import { ChevronDown, ChevronUp, Trash } from "lucide-react";
import React from "react";
import { Parameter } from "../store/toolStore";
import ParameterDependency from "./ParameterDependency";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";

const PARAMETER_TYPES = ["string", "number", "integer", "boolean", "object", "array", "enum"];

interface ParameterEditorProps {
    parameters: Parameter[];
    openPanels: Record<string, boolean>;
    highlightedFields: string[];
    onTogglePanel: (id: string) => void;
    onUpdateParameter: (id: string, field: keyof Parameter, value: any) => void;
    onUpdateParameterDependency: (id: string, dependencies: any) => void;
    onUpdateArrayConfig: (id: string, config: any) => void;
    onUpdateObjectProperties: (id: string, propertiesText: string) => void;
    onUpdateEnumValues: (id: string, valuesText: string) => void;
    onRemoveParameter: (id: string) => void;
    renderTypeSpecificFields: (param: Parameter) => JSX.Element | null;
}

const ParameterEditor: React.FC<ParameterEditorProps> = ({
    parameters,
    openPanels,
    highlightedFields,
    onTogglePanel,
    onUpdateParameter,
    onUpdateParameterDependency,
    onUpdateArrayConfig,
    onUpdateObjectProperties,
    onUpdateEnumValues,
    onRemoveParameter,
    renderTypeSpecificFields,
}) => {
    return (
        <div className="space-y-4">
            {parameters.map((param, index) => (
                <Collapsible
                    key={param.id}
                    open={openPanels[param.id]}
                    onOpenChange={() => onTogglePanel(param.id)}
                    className="rounded-md border"
                >
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">
                                Parameter {index + 1}: {param.name || "Unnamed Parameter"}
                            </h3>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveParameter(param.id);
                                    }}
                                    className="h-8 w-8 p-0"
                                >
                                    <Trash className="h-4 w-4 text-red-500 hover:text-red-700" />
                                </Button>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        {openPanels[param.id] ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </Button>
                                </CollapsibleTrigger>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor={`param-name-${param.id}`}>Parameter Name</Label>
                                <Input
                                    id={`param-name-${param.id}`}
                                    value={param.name}
                                    onChange={(e) => onUpdateParameter(param.id, "name", e.target.value)}
                                    placeholder="e.g. location"
                                    className={highlightedFields.includes(`param-name-${param.id}`) ? "border-red-500" : ""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`param-type-${param.id}`}>Type</Label>
                                <Select
                                    value={param.type}
                                    onValueChange={(value) => onUpdateParameter(param.id, "type", value)}
                                >
                                    <SelectTrigger id={`param-type-${param.id}`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PARAMETER_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="space-y-2">
                                <Label htmlFor={`param-desc-${param.id}`}>Description</Label>
                                <Input
                                    id={`param-desc-${param.id}`}
                                    value={param.description}
                                    onChange={(e) => onUpdateParameter(param.id, "description", e.target.value)}
                                    placeholder="Describe the parameter"
                                    className={highlightedFields.includes(`param-desc-${param.id}`) ? "border-red-500" : ""}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 mt-4">
                            <Switch
                                id={`param-required-${param.id}`}
                                checked={param.required}
                                onCheckedChange={(checked) => onUpdateParameter(param.id, "required", checked)}
                            />
                            <Label htmlFor={`param-required-${param.id}`}>Required parameter</Label>
                        </div>
                    </div>

                    <CollapsibleContent>
                        <div className="p-4 border-t space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor={`param-default-${param.id}`}>Default Value (Optional)</Label>
                                <Input
                                    id={`param-default-${param.id}`}
                                    value={param.default || ""}
                                    onChange={(e) => onUpdateParameter(param.id, "default", e.target.value)}
                                    placeholder="No default value"
                                />
                            </div>

                            {renderTypeSpecificFields(param)}

                            <ParameterDependency
                                parameter={param}
                                allParameters={parameters}
                                onUpdate={(deps) => onUpdateParameterDependency(param.id, deps)}
                            />

                            {parameters.length > 1 && (
                                <div className="flex justify-end mt-4">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onRemoveParameter(param.id)}
                                    >
                                        <Trash className="h-4 w-4 mr-1" />
                                        Remove Parameter
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            ))}
        </div>
    );
};

export default ParameterEditor;