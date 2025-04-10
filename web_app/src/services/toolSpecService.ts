import { Parameter, Tool } from '../store/toolStore';

// Import tool specs directly
import executeCommandSpec from '../../tool_specs/cli/execute_command.json';
import remoteExecutionSpec from '../../tool_specs/cli/remote_execution.json';
import exampleToolSpec from '../../tool_specs/example_tool_spec.json';

// Helper function to convert tool spec format to the application's Tool format
export const convertSpecToTool = (spec: any, id: string, category: string): Tool => {
    // Extract the function details from the spec
    const functionSpec = spec.function;

    // Extract parameters from the spec
    const parameters: Parameter[] = [];

    if (functionSpec.parameters && functionSpec.parameters.properties) {
        Object.entries(functionSpec.parameters.properties).forEach(([paramName, paramProps]: [string, any], index) => {
            const isRequired = functionSpec.parameters.required &&
                functionSpec.parameters.required.includes(paramName);

            parameters.push({
                id: `p${index + 1}`,
                name: paramName,
                type: paramProps.type || 'string',
                description: paramProps.description || '',
                required: isRequired,
                default: paramProps.default
            });
        });
    }

    // Create a Tool object from the spec
    return {
        id,
        name: functionSpec.name,
        description: functionSpec.description || '',
        category,
        status: 'active',
        parameters,
        lastModified: new Date().toISOString().split('T')[0]
    };
};

// Function to load and parse tool specs
export const loadToolSpecs = async (): Promise<Record<string, Tool>> => {
    try {
        // Manually create the map of specs
        const specs = [
            { spec: exampleToolSpec, id: 'spec_1', category: 'General' },
            { spec: executeCommandSpec, id: 'spec_2', category: 'CLI' },
            { spec: remoteExecutionSpec, id: 'spec_3', category: 'CLI' },
        ];

        const tools: Record<string, Tool> = {};

        // Process each spec
        specs.forEach(({ spec, id, category }) => {
            // Only process valid specs with function property
            if (spec && spec.function && spec.function.name) {
                tools[id] = convertSpecToTool(spec, id, category);
            }
        });

        return tools;
    } catch (error) {
        console.error('Failed to load tool specifications:', error);
        return {};
    }
};

// Function to parse function signature and extract name, parameters, and their types
export const parseFunctionSignature = (signature: string) => {
    const functionRegex = /function\s+(\w+)\s*\(([^)]*)\)/;
    const match = signature.match(functionRegex);

    if (!match) {
        return null;
    }

    const name = match[1];
    const params = match[2].split(',').map(param => {
        const [paramName, paramType] = param.trim().split(':');
        return {
            name: paramName.trim(),
            type: paramType ? paramType.trim() : 'string'
        };
    });

    return { name, params };
};

// Function to generate description using a light LLM
export const generateDescription = async (name: string) => {
    // Placeholder for LLM call
    return `This function ${name} is used to...`;
};
