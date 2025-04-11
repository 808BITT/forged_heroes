import { Parameter, Tool } from '../store/toolStore';
import toolsApi from './apiService';

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

/**
 * Parse a TypeScript function signature into a tool schema
 */
export function parseFunctionSignature(signature: string) {
    try {
        // Basic regex pattern to extract function name and parameters
        const functionRegex = /function\s+([a-zA-Z0-9_]+)\s*\((.*)\)/;
        const arrowFunctionRegex = /(?:const|let|var)?\s*([a-zA-Z0-9_]+)\s*=\s*(?:\(.*\)|[a-zA-Z0-9_]+)\s*=>\s*{/;

        let matches = signature.match(functionRegex);
        if (!matches) {
            matches = signature.match(arrowFunctionRegex);
        }

        if (!matches) {
            console.warn('Could not parse function signature:', signature);
            return null;
        }

        const functionName = matches[1];
        const paramsString = matches[2] || '';

        // Parse parameters
        const paramRegex = /([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)/g;
        const params = [];
        let paramMatch;

        while ((paramMatch = paramRegex.exec(paramsString)) !== null) {
            params.push({
                name: paramMatch[1],
                type: mapTypeToSchema(paramMatch[2])
            });
        }

        return {
            name: functionName,
            params
        };
    } catch (error) {
        console.error('Error parsing function signature:', error);
        return null;
    }
}

/**
 * Map TypeScript types to JSON schema types
 */
function mapTypeToSchema(tsType: string): string {
    switch (tsType.toLowerCase()) {
        case 'string':
            return 'string';
        case 'number':
            return 'number';
        case 'boolean':
            return 'boolean';
        case 'any':
            return 'object';
        case 'object':
            return 'object';
        case 'array':
        case 'any[]':
            return 'array';
        case 'date':
            return 'string';
        case 'int':
        case 'integer':
            return 'integer';
        default:
            return 'string';
    }
}

/**
 * Generate a description for a function signature using the API
 */
export async function generateDescription(signature: string): Promise<string> {
    try {
        return await toolsApi.generateDescription(signature);
    } catch (error) {
        console.error('Error generating description:', error);
        return '';
    }
}
