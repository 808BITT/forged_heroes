import { motion } from "framer-motion";
import { ArrowLeft, Plus, PlusCircle, Save, Trash } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { convertDefaultValue } from "../lib/utils";
import toolsApi from "../services/apiService";
import { useToolEditorStore, Parameter, Category } from "../store/toolStore";
import { useToolStore } from "../store/toolStore";
import ArrayItemConfig from "./ArrayItemConfig";
import JsonPreview from "./JsonPreview";
import ParameterEditor from "./ParameterEditor";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea.tsx";
import {
    handleAddParameter,
    handleRemoveParameter,
    handleUpdateArrayConfig,
    handleUpdateEnumValues,
    handleUpdateObjectProperties,
    handleUpdateParameter,
    handleUpdateParameterDependency,
} from "./toolEditorHandlers";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import { useToast } from "./ui/use-toast";
import { validateToolForm } from "../lib/validation";

export default function ToolEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addTool, updateTool, deleteTool } = useToolStore();
    const { addToast } = useToast();

    const {
        name,
        description,
        category,
        parameters,
        categories,
        highlightedFields,
        errors,
        jsonPreview,
        copied,
        isLoadingCategories,
        categoryError,
        categoryModalOpen,
        newCategoryName,
        isSavingCategory,
        newCategoryError,
        setName,
        setDescription,
        setCategory,
        setParameters,
        setCategories,
        setHighlightedFields,
        setErrors,
        setJsonPreview,
        setCopied,
        setIsLoadingCategories,
        setCategoryError,
        setCategoryModalOpen,
        setNewCategoryName,
        setIsSavingCategory,
        setNewCategoryError,
    } = useToolEditorStore();

    useEffect(() => {
        async function initialize() {
            try {
                setIsLoadingCategories(true);
                setCategoryError("");
                const categoriesData = await toolsApi.getCategories();
                setCategories(categoriesData);
            } catch (error) {
                console.error("Error fetching categories:", error);
                setCategoryError("Failed to load categories");
                setCategories([
                    { id: "default-general", name: "General" },
                    { id: "default-cli", name: "CLI" },
                    { id: "default-api", name: "API" },
                    { id: "default-data", name: "Data" },
                ]);
            } finally {
                setIsLoadingCategories(false);
            }

            if (id) {
                try {
                    const response = await toolsApi.getById(id);
                    setName(response.name);
                    setDescription(response.description);
                    setCategory(response.category);
                    const parsedParameters = Array.isArray(response.parameters)
                        ? response.parameters
                        : [];
                    setParameters(parsedParameters);
                } catch (error) {
                    console.error("Error fetching tool:", error);
                }
            } else {
                setParameters([]);
            }
        }

        initialize();
    }, [id]);

    const handleAddCategory = async (): Promise<void> => {
        if (!newCategoryName.trim()) {
            setNewCategoryError("Category name is required");
            return;
        }

        if (categories.some((cat: Category) => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
            setNewCategoryError("Category already exists");
            return;
        }

        try {
            setIsSavingCategory(true);
            setNewCategoryError("");
            const newCategory: Category = await toolsApi.createCategory(newCategoryName.trim());
            setCategories([...categories, newCategory]);
            setCategory(newCategory.name);
            setCategoryModalOpen(false);
            setNewCategoryName("");
            addToast({
                title: "Category added",
                description: `"${newCategory.name}" has been added to categories`,
            });
        } catch (error) {
            console.error("Error creating category:", error);
            setNewCategoryError("Failed to create category");
        } finally {
            setIsSavingCategory(false);
        }
    };

    const togglePanel = (panelId: string): void => {
        setHighlightedFields({
            ...highlightedFields,
            [panelId]: !highlightedFields[panelId],
        });
    };

    useEffect(() => {
        if (!name) return;

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

        setJsonPreview(JSON.stringify(toolSpec, null, 2));
    }, [name, description, parameters]);

    const validateForm = (): boolean => {
        const { errors, fieldsToHighlight } = validateToolForm(name, description, parameters);
        setHighlightedFields(fieldsToHighlight);
        setErrors(errors);
        return errors.length === 0;
    };

    const handleSave = async (): Promise<void> => {
        if (!validateForm()) return;

        const toolData = {
            name,
            description,
            inputSchema: {
                type: "object",
                properties: parameters.reduce((acc: Record<string, any>, param: Parameter) => {
                    if (param.name) {
                        acc[param.name] = {
                            type: param.type,
                            description: param.description,
                            ...(param.default !== undefined && { default: param.default }),
                            ...(param.enumValues && { enum: param.enumValues }),
                            ...(param.minimum && { minimum: Number(param.minimum) }),
                            ...(param.maximum && { maximum: Number(param.maximum) }),
                            ...(param.type === "array" && param.arrayItemType && {
                                items: { type: param.arrayItemType },
                            }),
                            ...(param.type === "object" && param.objectProperties && {
                                properties: param.objectProperties,
                            }),
                        };
                    }
                    return acc;
                }, {}),
            },
            annotations: {
                title: name,
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false,
            },
            version: "1.0",
            category,
            parameters,
            returns: {
                type: "object",
                properties: {
                    success: {
                        type: "boolean",
                        description: "Whether the operation was successful",
                    },
                    result: {
                        type: "object",
                        description: "Result data from the tool execution",
                    },
                },
            },
            rawParameters: parameters.map((param: Parameter) => ({
                id: param.id,
                name: param.name,
                type: param.type,
                description: param.description,
                required: param.required,
                default: param.default,
                enumValues: param.enumValues,
                minimum: param.minimum,
                maximum: param.maximum,
                arrayItemType: param.arrayItemType,
                arrayItemDescription: param.arrayItemDescription,
                objectProperties: param.objectProperties,
                dependencies: param.dependencies,
            })),
            status: "active" as "active",
            lastModified: new Date().toISOString(),
        };

        try {
            if (id) {
                await updateTool(id, toolData);
            } else {
                const newId = await addTool(toolData);
                if (!newId) {
                    console.error("Failed to add tool: No ID returned");
                    return;
                }
            }

            navigate("/tools");
            addToast({
                title: "Success",
                description: "Tool saved successfully!",
                variant: "success",
            });
        } catch (error) {
            console.error("Error saving tool:", error);
            addToast({
                title: "Error",
                description: "Failed to save the tool.",
                variant: "error",
            });
        }
    };

    const handleDelete = (): void => {
        if (id) {
            setCategoryModalOpen(true);
        }
    };

    const confirmDelete = async (): Promise<void> => {
        try {
            if (id) {
                await deleteTool(id);
            } else {
                console.error("Tool ID is undefined. Cannot delete tool.");
            }
            navigate("/tools");
            addToast({
                title: "Tool Deleted",
                description: "The tool has been successfully deleted.",
                variant: "success",
            });
        } catch (error) {
            console.error("Error deleting tool:", error);
            addToast({
                title: "Error",
                description: "Failed to delete the tool.",
                variant: "error",
            });
        } finally {
            setCategoryModalOpen(false);
        }
    };

    const copyJsonToClipboard = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(jsonPreview);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const renderTypeSpecificFields = (param: Parameter): JSX.Element | null => {
        switch (param.type) {
            case 'string':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={`param-format-${param.id}`}>Format (Optional)</Label>
                        <Select
                            value={param.format || ""}
                            onValueChange={(value: string) => handleUpdateParameter(param.id, 'format', value, parameters, setParameters)}
                        >
                            <SelectTrigger id={`param-format-${param.id}`}>
                                <SelectValue placeholder="No format restriction" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="uri">URI</SelectItem>
                                <SelectItem value="date-time">Date-Time</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="time">Time</SelectItem>
                                <SelectItem value="password">Password</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                );

            case 'number':
            case 'integer':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`param-min-${param.id}`}>Minimum (Optional)</Label>
                            <Input
                                id={`param-min-${param.id}`}
                                type="number"
                                value={param.minimum}
                                onChange={(e) => handleUpdateParameter(param.id, 'minimum', e.target.value, parameters, setParameters)}
                                placeholder="No minimum"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`param-max-${param.id}`}>Maximum (Optional)</Label>
                            <Input
                                id={`param-max-${param.id}`}
                                type="number"
                                value={param.maximum}
                                onChange={(e) => handleUpdateParameter(param.id, 'maximum', e.target.value, parameters, setParameters)}
                                placeholder="No maximum"
                            />
                        </div>
                    </div>
                );

            case 'enum':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={`param-enum-${param.id}`}>Enum Values (comma-separated)</Label>
                        <Input
                            id={`param-enum-${param.id}`}
                            value={param.enumValues ? param.enumValues.join(', ') : ''}
                            onChange={(e) => handleUpdateEnumValues(parameters, setParameters, param.id, e.target.value)}
                            placeholder="value1, value2, value3"
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter comma-separated values that this parameter can accept
                        </p>
                    </div>
                );

            case 'array':
                return (
                    <ArrayItemConfig
                        itemType={param.arrayItemType || 'string'}
                        itemDescription={param.arrayItemDescription || ''}
                        itemProperties={param.objectProperties}
                        onUpdate={function (): void {
                            throw new Error("Function not implemented.");
                        }}
                    />
                );

            case 'object':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={`param-object-${param.id}`}>Object Properties (JSON)</Label>
                        <Textarea
                            id={`param-object-${param.id}`}
                            value={JSON.stringify(param.objectProperties || {}, null, 2)}
                            onChange={(e) => handleUpdateObjectProperties(parameters, setParameters, param.id, e.target.value)}
                            placeholder='{ "property": { "type": "string", "description": "Property description" } }'
                            rows={5}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Define the properties of this object in JSON format
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="relative w-full flex flex-col items-center text-center mb-8">
                    <div className="absolute left-2 top-0 z-10">
                        <Link to="/tools">
                            <Button variant="secondary" className="shadow-md text-lg px-5 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800">
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-2 pt-2 max-w-2xl mx-auto">
                        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight py-2 px-6">
                            {id ? "Edit Tool" : "Create Tool"}
                        </h1>
                        <p className="text-muted-foreground py-2 px-4">
                            Configure your tool settings and parameters
                        </p>
                    </div>

                    <div className="absolute right-2 top-0 z-10">
                        <div className="flex gap-2">
                            {id && (
                                <Button variant="destructive" onClick={handleDelete} className="shadow-md">
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            )}
                            <Button onClick={handleSave} className="gap-2 shadow-md" data-testid="save-tool-button">
                                <Save className="h-4 w-4" />
                                Save
                            </Button>
                        </div>
                    </div>
                </div>

                {errors.length > 0 && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <ul className="mt-2">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6 bg-white/80 dark:bg-slate-900/80 p-6 rounded-lg shadow-md backdrop-blur-sm"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="tool-name">Tool Name</Label>
                            <Input
                                id="tool-name"
                                placeholder="Enter tool name..."
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={highlightedFields["name"] ? "border-red-500" : ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tool-description">Tool Description</Label>
                            <Input
                                id="tool-description"
                                placeholder="Enter tool description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={highlightedFields["description"] ? "border-red-500" : ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="category">Category</Label>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setCategoryModalOpen(true)}
                                >
                                    <PlusCircle className="h-4 w-4 mr-1" />
                                    Add Category
                                </Button>
                            </div>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryError ? (
                                        <SelectItem value="error" disabled>
                                            Error loading categories
                                        </SelectItem>
                                    ) : isLoadingCategories ? (
                                        <SelectItem value="loading" disabled>
                                            Loading categories...
                                        </SelectItem>
                                    ) : categories.length === 0 ? (
                                        <SelectItem value="none" disabled>
                                            No categories found
                                        </SelectItem>
                                    ) : (
                                        categories.map((cat: Category) => (
                                            <SelectItem key={cat.id} value={cat.name}>
                                                {cat.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Parameters</Label>
                                <Button 
                                    type="button" 
                                    variant="default" 
                                    size="sm" 
                                    onClick={() => handleAddParameter(parameters, setParameters)}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Parameter
                                </Button>
                            </div>

                            <ParameterEditor
                                parameters={parameters}
                                openPanels={highlightedFields}
                                highlightedFields={Object.keys(highlightedFields).filter(key => highlightedFields[key])}
                                onTogglePanel={togglePanel}
                                onUpdateParameter={(id, field, value) => handleUpdateParameter(id, field, value, parameters, setParameters)}
                                onUpdateParameterDependency={(id, dependencies) => handleUpdateParameterDependency(parameters, setParameters, id, dependencies)}
                                onUpdateArrayConfig={(id, config) => handleUpdateArrayConfig(id, config, parameters, setParameters)}
                                onUpdateObjectProperties={(id, propertiesText) => handleUpdateObjectProperties(parameters, setParameters, id, propertiesText)}
                                onUpdateEnumValues={(id, valuesText) => handleUpdateEnumValues(parameters, setParameters, id, valuesText)}
                                onRemoveParameter={(id) => handleRemoveParameter(id, parameters, setParameters)}
                                renderTypeSpecificFields={renderTypeSpecificFields}
                            />
                        </div>
                    </motion.div>

                    <JsonPreview jsonPreview={jsonPreview} onCopy={copyJsonToClipboard} copied={copied} />
                </div>

                <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Category</DialogTitle>
                            <DialogDescription>
                                Create a new category for organizing tools.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-category-name">Category Name</Label>
                                <Input
                                    id="new-category-name"
                                    placeholder="Enter category name..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className={newCategoryError ? "border-red-500" : ""}
                                />
                                {newCategoryError && (
                                    <p className="text-sm text-red-500">{newCategoryError}</p>
                                )}
                            </div>
                        </div>
                        
                        <DialogFooter>
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setCategoryModalOpen(false);
                                    setNewCategoryName("");
                                    setNewCategoryError("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleAddCategory} 
                                disabled={isSavingCategory || !newCategoryName.trim()}
                            >
                                {isSavingCategory ? "Adding..." : "Add Category"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirm Delete</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this tool? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCategoryModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </>
    );
}
