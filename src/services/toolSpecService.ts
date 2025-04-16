import { Parameter } from '../store/toolStore';
import toolsApi from './apiService';

// Import tool specs directly
import executeCommandSpec from '../../tool_specs/cli/execute_command.json';
import remoteExecutionSpec from '../../tool_specs/cli/remote_execution.json';
import exampleToolSpec from '../../tool_specs/example_tool_spec.json';

// Updated Tool interface to match the new specification
export interface Tool {
  name: string; // Unique identifier for the tool
  description?: string; // Human-readable description
  inputSchema: {
    type: "object";
    properties: Record<string, any>; // Tool-specific parameters
  };
  annotations?: {
    title?: string; // Human-readable title for the tool
    readOnlyHint?: boolean; // If true, the tool does not modify its environment
    destructiveHint?: boolean; // If true, the tool may perform destructive updates
    idempotentHint?: boolean; // If true, repeated calls with same args have no additional effect
    openWorldHint?: boolean; // If true, tool interacts with external entities
  };
}

// Helper function to convert tool spec format to the application's Tool format
export const convertSpecToTool = (spec: any): Tool => {
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
        name: functionSpec.name,
        description: functionSpec.description || '',
        inputSchema: {
            type: "object",
            properties: functionSpec.parameters.properties || {}
        },
        annotations: {
            title: functionSpec.title || '',
            readOnlyHint: functionSpec.readOnlyHint || false,
            destructiveHint: functionSpec.destructiveHint || false,
            idempotentHint: functionSpec.idempotentHint || false,
            openWorldHint: functionSpec.openWorldHint || false
        }
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
        specs.forEach(({ spec, id }) => {
            // Only process valid specs with function property
            if (spec && (spec as any).function && (spec as any).function.name) {
                tools[id] = convertSpecToTool(spec);
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
        // Extended regex patterns to cover more JavaScript function types
        const functionRegex = /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/; // Regular function
        const arrowFunctionRegex = /(?:const|let|var)?\s*([a-zA-Z0-9_]+)\s*=\s*\(([^)]*)\)\s*=>/; // Arrow function
        const asyncFunctionRegex = /async\s+function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/; // Async function
        const methodRegex = /([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s*{/; // Object or class method

        let matches = signature.match(functionRegex) ||
                      signature.match(arrowFunctionRegex) ||
                      signature.match(asyncFunctionRegex) ||
                      signature.match(methodRegex);

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
        case 'object[]':
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

/**
 * Generate a tool specification JSON string
 */
export function generateToolSpec(name: string, description: string, parameters: Parameter[]): string {
    const toolSpec = {
        type: "function",
        function: {
            name: name.toLowerCase().replace(/\s+/g, '_'),
            description: description,
            parameters: {
                type: "object",
                properties: parameters.reduce((acc: Record<string, any>, param: Parameter) => {
                    if (param.name) {
                        const paramSpec: any = {
                            type: param.type === 'integer' ? 'integer' : param.type,
                            description: param.description,
                        };

                        if (param.format && (param.type === 'string' || param.type === 'number' || param.type === 'integer')) {
                            paramSpec.format = param.format;
                        }

                        if (param.type === 'enum' && param.enumValues && param.enumValues.length > 0) {
                            paramSpec.type = 'string';
                            paramSpec.enum = param.enumValues;
                        }

                        if ((param.type === 'number' || param.type === 'integer') && param.minimum !== '') {
                            paramSpec.minimum = Number(param.minimum);
                        }
                        if ((param.type === 'number' || param.type === 'integer') && param.maximum !== '') {
                            paramSpec.maximum = Number(param.maximum);
                        }

                        if (param.default !== '') {
                            paramSpec.default = convertDefaultValue(param.type, param.default || '');
                        }

                        if (param.type === 'array') {
                            paramSpec.items = {
                                type: param.arrayItemType || 'string',
                                description: param.arrayItemDescription || '',
                            };

                            if (param.arrayItemType === 'object' && param.objectProperties) {
                                paramSpec.items.properties = param.objectProperties;
                            }
                        }

                        if (param.type === 'object' && param.objectProperties) {
                            paramSpec.properties = param.objectProperties;
                        }

                        acc[param.name] = paramSpec;
                    }
                    return acc;
                }, {} as Record<string, any>),
                required: parameters
                    .filter((param: Parameter) => param.required && param.name)
                    .map((param: Parameter) => param.name),
            },
        },
    };

    const paramDependencies = parameters.filter((p: Parameter) => p.dependencies && p.name);
    if (paramDependencies.length > 0) {
        const paramsObj = toolSpec.function.parameters as any;
        if (!paramsObj.dependencyMap) {
            paramsObj.dependencyMap = {};
        }

        paramDependencies.forEach((param: Parameter) => {
            if (!param.dependencies || !param.name) return;

            paramsObj.dependencyMap[param.name] = {
                conditions: param.dependencies.conditions.map((c: any) => {
                    const sourceParam = parameters.find((p: Parameter) => p.id === c.paramId);
                    if (!sourceParam || !sourceParam.name) return null;

                    return {
                        sourceParam: sourceParam.name,
                        operator: c.operator,
                        value: c.value,
                    };
                }).filter(Boolean),
                effect: param.dependencies.effect,
            };
        });
    }

    return JSON.stringify(toolSpec, null, 2);
}

function convertDefaultValue(type: string, defaultValue: string): any {
    switch (type) {
        case 'string':
            return defaultValue;
        case 'number':
        case 'integer':
            return Number(defaultValue);
        case 'boolean':
            return defaultValue.toLowerCase() === 'true';
        case 'array':
            try {
                return JSON.parse(defaultValue);
            } catch {
                return [];
            }
        case 'object':
            try {
                return JSON.parse(defaultValue);
            } catch {
                return {};
            }
        default:
            return defaultValue;
    }
}
