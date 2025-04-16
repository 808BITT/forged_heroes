import { Parameter } from "../store/toolStore";

interface ValidationResult {
    errors: string[];
    fieldsToHighlight: Record<string, boolean>;
}

export const validateToolForm = (name: string, description: string, parameters: Parameter[]): ValidationResult => {
    const errors: string[] = [];
    const fieldsToHighlight: Record<string, boolean> = {};

    if (!name.trim()) {
        errors.push('Tool name is required');
        fieldsToHighlight['name'] = true;
    }

    if (!description.trim()) {
        errors.push('Tool description is required');
        fieldsToHighlight['description'] = true;
    }

    parameters.forEach((param, index) => {
        const paramDisplay = `Parameter ${index + 1}${param.name ? ` (${param.name})` : ''}`;

        if (!param.name.trim()) {
            errors.push(`${paramDisplay} name is required`);
            fieldsToHighlight[`param-name-${param.id}`] = true;
        }

        if (!param.type.trim()) {
            errors.push(`${paramDisplay} type is required`);
            fieldsToHighlight[`param-type-${param.id}`] = true;
        }

        if (!param.description.trim()) {
            errors.push(`${paramDisplay} description is required`);
            fieldsToHighlight[`param-desc-${param.id}`] = true;
        }

        switch (param.type) {
            case 'enum':
                if (!param.enumValues || param.enumValues.length === 0) {
                    errors.push(`${paramDisplay} must have at least one enum value`);
                    fieldsToHighlight[`param-enum-${param.id}`] = true;
                }
                break;

            case 'object':
                if (!param.objectProperties || Object.keys(param.objectProperties).length === 0) {
                    errors.push(`${paramDisplay} must have at least one property defined`);
                    fieldsToHighlight[`param-object-${param.id}`] = true;
                }
                break;
        }
    });

    return { errors, fieldsToHighlight };
};