import { Parameter } from "../store/toolStore";
import type { ArrayItemConfigProps } from "./ArrayItemConfig";

export const handleAddParameter = (
    parameters: Parameter[],
    setParameters: (params: Parameter[]) => void
) => {
    setParameters([
        ...parameters,
        {
            id: `p${Date.now()}`,
            name: "",
            type: "string",
            description: "",
            required: true,
            format: "",
            enumValues: [],
            minimum: "",
            maximum: "",
            default: "",
            arrayItemType: "string",
            arrayItemDescription: "",
            objectProperties: {},
            dependencies: null,
        },
    ]);
};

export const handleUpdateParameter = (
    id: string,
    field: keyof Parameter,
    value: any,
    parameters: Parameter[],
    setParameters: (params: Parameter[]) => void
) => {
    setParameters(
        parameters.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
};

export const handleUpdateArrayConfig = (
    id: string,
    config: ArrayItemConfigProps,
    parameters: Parameter[],
    setParameters: (params: Parameter[]) => void
) => {
    setParameters(
        parameters.map((p) =>
            p.id === id
                ? {
                    ...p,
                    arrayItemType: config.itemType,
                    arrayItemDescription: config.itemDescription,
                    objectProperties:
                        config.itemType === "object" ? config.itemProperties : p.objectProperties,
                }
                : p
        )
    );
};

export const handleRemoveParameter = (
    id: string,
    parameters: Parameter[],
    setParameters: (params: Parameter[]) => void
) => {
    setParameters(parameters.filter((p) => p.id !== id));
};

export const handleUpdateParameterDependency = (
    parameters: Parameter[],
    setParameters: (params: Parameter[]) => void,
    id: string,
    dependencies: any
) => {
    setParameters(
        parameters.map((p) =>
            p.id === id ? { ...p, dependencies } : p
        )
    );
};

export const handleUpdateObjectProperties = (
    parameters: Parameter[],
    setParameters: (params: Parameter[]) => void,
    id: string,
    propertiesText: string
) => {
    try {
        const properties = JSON.parse(propertiesText);
        setParameters(
            parameters.map((p) =>
                p.id === id ? { ...p, objectProperties: properties } : p
            )
        );
    } catch (error) {
        console.error("Invalid JSON for object properties:", error);
    }
};

export const handleUpdateEnumValues = (
    parameters: Parameter[],
    setParameters: (params: Parameter[]) => void,
    id: string,
    valuesText: string
) => {
    const values = valuesText.split(",").map((v) => v.trim()).filter(Boolean);
    setParameters(
        parameters.map((p) =>
            p.id === id ? { ...p, enumValues: values } : p
        )
    );
};