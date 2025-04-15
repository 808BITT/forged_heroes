import { motion } from "framer-motion";
import { ArrowLeft, Plus, PlusCircle, Save, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { convertDefaultValue } from "../lib/utils";
import toolsApi, { Category } from "../services/apiService";
import { Parameter, useToolStore } from "../store/toolStore";
import ArrayItemConfig from "./ArrayItemConfig";
import JsonPreview from "./JsonPreview";
import ParameterEditor from "./ParameterEditor";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea.tsx";
// Modal components for the category dialog
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

export default function ToolEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const addTool = useToolStore((state) => state.addTool);
    const updateTool = useToolStore((state) => state.updateTool);
    const deleteTool = useToolStore((state) => state.deleteTool);
    const { addToast, toasts } = useToast();
    
    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("General");
    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [jsonPreview, setJsonPreview] = useState("");
    const [copied, setCopied] = useState(false);
    const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    
    // New state for categories
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [categoryError, setCategoryError] = useState("");
    
    // New state for the category modal
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [newCategoryError, setNewCategoryError] = useState("");
    
    // Panel toggle state to manage complexity
    const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({});

    // Consolidated initialization logic
    useEffect(() => {
        async function initialize() {
        // Fetch categories
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

            // Fetch tool data if editing
            if (id) {
                try {
                    const response = await toolsApi.getById(id);
                    setName(response.name);
                    setDescription(response.description);
                    setCategory(response.category);
                    // Ensure parameters are an array
                    const parsedParameters = Array.isArray(response.parameters)
                        ? response.parameters
                        : []; // Default to an empty array if not valid
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

    // Handle adding a new category
    const handleAddCategory = async () => {
        // Validate input
        if (!newCategoryName.trim()) {
            setNewCategoryError("Category name is required");
            return;
        }

        // Check if category already exists (case insensitive)
        if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
            setNewCategoryError("Category already exists");
            return;
        }

        try {
            setIsSavingCategory(true);
            setNewCategoryError("");
            
            // Call API to create new category
            const newCategory = await toolsApi.createCategory(newCategoryName.trim());
            
            // Update categories list
            setCategories(prev => [...prev, newCategory]);
            
            // Select the new category
            setCategory(newCategory.name);
            
            // Close modal and reset
            setCategoryModalOpen(false);
            setNewCategoryName("");
            
            // Show success message
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

    // Toggle panel open/closed state
    const togglePanel = (panelId: string) => {
        setOpenPanels(prev => ({
            ...prev,
            [panelId]: !prev[panelId]
        }));
    };

    // Generate and update JSON preview
    useEffect(() => {
        if (!name) return;
        
        const toolSpec = {
            type: "function",
            function: {
                name: name.toLowerCase().replace(/\s+/g, '_'),
                description: description,
                parameters: {
                    type: "object",
                    properties: parameters.reduce((acc: Record<string, any>, param) => {
                        if (param.name) {
                            // Base property definition
                            const paramSpec: any = {
                                type: param.type === 'integer' ? 'integer' : param.type,
                                description: param.description
                            };
                            
                            // Add format if specified
                            if (param.format && (param.type === 'string' || param.type === 'number' || param.type === 'integer')) {
                                paramSpec.format = param.format;
                            }
                            
                            // Add enum values if type is enum
                            if (param.type === 'enum' && param.enumValues && param.enumValues.length > 0) {
                                paramSpec.type = 'string';
                                paramSpec.enum = param.enumValues;
                            }
                            
                            // Add min/max for numbers/integers
                            if ((param.type === 'number' || param.type === 'integer') && param.minimum !== '') {
                                paramSpec.minimum = Number(param.minimum);
                            }
                            if ((param.type === 'number' || param.type === 'integer') && param.maximum !== '') {
                                paramSpec.maximum = Number(param.maximum);
                            }
                            
                            // Add default value if provided with proper type conversion
                            if (param.default !== '') {
                                paramSpec.default = convertDefaultValue(param.type, param.default || '');
                            }
                            
                            // Handle array items
                            if (param.type === 'array') {
                                paramSpec.items = {
                                    type: param.arrayItemType || 'string',
                                    description: param.arrayItemDescription || ''
                                };
                                
                                // If array items are objects, add their properties
                                if (param.arrayItemType === 'object' && param.objectProperties) {
                                    paramSpec.items.properties = param.objectProperties;
                                }
                            }
                            
                            // Handle object properties
                            if (param.type === 'object' && param.objectProperties) {
                                paramSpec.properties = param.objectProperties;
                            }

                            acc[param.name] = paramSpec;
                        }
                        return acc;
                    }, {} as Record<string, any>),
                    required: parameters
                        .filter(param => param.required && param.name)
                        .map(param => param.name)
                }
            }
        };
        
        // Add dependency conditions to the spec if they exist
        const paramDependencies = parameters.filter(p => p.dependencies && p.name);
        if (paramDependencies.length > 0) {
            // Use a properly typed object to avoid direct property access issues
            const paramsObj = toolSpec.function.parameters as any;
            if (!paramsObj.dependencyMap) {
                paramsObj.dependencyMap = {};
            }
            
            paramDependencies.forEach(param => {
                if (!param.dependencies || !param.name) return;
                
                paramsObj.dependencyMap[param.name] = {
                    conditions: param.dependencies.conditions.map(c => {
                        // Find the parameter this condition depends on
                        const sourceParam = parameters.find(p => p.id === c.paramId);
                        if (!sourceParam || !sourceParam.name) return null;
                        
                        return {
                            sourceParam: sourceParam.name,
                            operator: c.operator,
                            value: c.value
                        };
                    }).filter(Boolean),
                    effect: param.dependencies.effect
                };
            });
        }
        
        setJsonPreview(JSON.stringify(toolSpec, null, 2));
    }, [name, description, parameters]);

    const validateForm = () => {
        const newErrors: string[] = [];
        if (!name.trim()) newErrors.push("Tool name is required");
        if (!description.trim()) newErrors.push("Tool description is required");
        
        parameters.forEach((param, _index) => {
            const paramDisplay = `Parameter ${_index + 1}${param.name ? ` (${param.name})` : ''}`;
            
            // Basic validation
            if (!param.name.trim()) newErrors.push(`${paramDisplay} name is required`);
            if (!param.type.trim()) newErrors.push(`${paramDisplay} type is required`);
            if (!param.description.trim()) newErrors.push(`${paramDisplay} description is required`);
            
            // Type-specific validation
            switch (param.type) {
                case 'enum':
                    if (!param.enumValues || param.enumValues.length === 0) {
                        newErrors.push(`${paramDisplay} must have at least one enum value`);
                    }
                    break;
                    
                case 'array':
                    if (!param.arrayItemType) {
                        newErrors.push(`${paramDisplay} must specify array item type`);
                    }
                    break;
                    
                case 'object':
                    try {
                        if (!param.objectProperties || Object.keys(param.objectProperties).length === 0) {
                            newErrors.push(`${paramDisplay} must have at least one property defined`);
                        }
                    } catch (error) {
                        newErrors.push(`${paramDisplay} has invalid object properties format`);
                    }
                    break;
                    
                case 'number':
                case 'integer':
                    if (param.minimum !== '' && param.maximum !== '' && 
                        Number(param.minimum) > Number(param.maximum)) {
                        newErrors.push(`${paramDisplay} minimum value cannot be greater than maximum`);
                    }
                    
                    if (param.default !== '') {
                        const defaultNum = Number(param.default);
                        if (isNaN(defaultNum)) {
                            newErrors.push(`${paramDisplay} default value must be a valid ${param.type}`);
                        } else {
                            // Check if default is within min/max range if specified
                            if (param.minimum !== '' && defaultNum < Number(param.minimum)) {
                                newErrors.push(`${paramDisplay} default value cannot be less than minimum`);
                            }
                            if (param.maximum !== '' && defaultNum > Number(param.maximum)) {
                                newErrors.push(`${paramDisplay} default value cannot be greater than maximum`);
                            }
                            // For integer type, ensure the default is an integer
                            if (param.type === 'integer' && !Number.isInteger(defaultNum)) {
                                newErrors.push(`${paramDisplay} default value must be an integer`);
                            }
                        }
                    }
                    break;
                    
                case 'boolean':
                    if (param.default !== '' && param.default !== 'true' && param.default !== 'false') {
                        newErrors.push(`${paramDisplay} default value must be either 'true' or 'false'`);
                    }
                    break;
            }
        });
        
        // Highlight UI elements with errors
        const fieldsToHighlight = [];
        if (!name.trim()) fieldsToHighlight.push("name");
        if (!description.trim()) fieldsToHighlight.push("description");
        parameters.forEach((param) => {
            if (!param.name.trim()) fieldsToHighlight.push(`param-name-${param.id}`);
            if (!param.type.trim()) fieldsToHighlight.push(`param-type-${param.id}`);
            if (!param.description.trim()) fieldsToHighlight.push(`param-desc-${param.id}`);
            
            // Add fields with type-specific errors
            switch(param.type) {
                case 'enum':
                    if (!param.enumValues || param.enumValues.length === 0) {
                        fieldsToHighlight.push(`param-enum-${param.id}`);
                    }
                    break;
                case 'object':
                    if (!param.objectProperties || Object.keys(param.objectProperties).length === 0) {
                        fieldsToHighlight.push(`param-object-${param.id}`);
                    }
                    break;
            }
        });
        
        setHighlightedFields(fieldsToHighlight);
        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        const toolData = {
            name,
            description,
            inputSchema: {
                type: "object",
                properties: parameters.reduce((acc: Record<string, any>, param) => {
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
            rawParameters: parameters.map((param) => ({
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
            console.log("Start Toast"); // Debugging log
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

    const handleDelete = () => {
        if (id) {
            setCategoryModalOpen(true);
        }
    };

    const confirmDelete = async () => {
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

    const copyJsonToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(jsonPreview);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    // Render type-specific configuration fields
    const renderTypeSpecificFields = (param: Parameter) => {
        switch (param.type) {
            case 'string':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={`param-format-${param.id}`}>Format (Optional)</Label>
                        <Select
                            value={param.format || ""}
                            onValueChange={(value) => handleUpdateParameter(param.id, 'format', value, parameters, setParameters)}
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
                    {/* Tool Configuration Form */}
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
                                className={highlightedFields.includes("name") ? "border-red-500" : ""}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tool-description">Tool Description</Label>
                            <Input
                                id="tool-description"
                                placeholder="Enter tool description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={highlightedFields.includes("description") ? "border-red-500" : ""}
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
                                        categories.map(cat => (
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

                            {/* Parameter Editor */}
                            <ParameterEditor
                                parameters={parameters}
                                openPanels={openPanels}
                                highlightedFields={highlightedFields}
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

                    {/* JSON Preview */}
                    <JsonPreview jsonPreview={jsonPreview} onCopy={copyJsonToClipboard} copied={copied} />
                </div>

                {/* Add Category Modal */}
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

                {/* Delete Confirmation Modal */}
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
