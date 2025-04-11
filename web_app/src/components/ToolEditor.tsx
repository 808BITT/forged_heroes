import { motion } from "framer-motion";
import { ArrowLeft, Copy, Plus, Save, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Parameter, useToolStore } from "../store/toolStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea.tsx";
import { ToolTester } from './ToolTester';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible.tsx";
import ParameterDependency from "./ParameterDependency";
import ArrayItemConfig from "./ArrayItemConfig";
// New imports for LLM and API services
import { parseFunctionSignature, generateDescription } from "../services/toolSpecService";

// Updated parameter types
const PARAMETER_TYPES = [
  "string", 
  "number", 
  "integer", 
  "boolean", 
  "object", 
  "array", 
  "enum"
];

export default function ToolEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const getToolById = useToolStore((state) => state.getToolById);
    const addTool = useToolStore((state) => state.addTool);
    const updateTool = useToolStore((state) => state.updateTool);
    const deleteTool = useToolStore((state) => state.deleteTool);
    
    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("General");
    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [jsonPreview, setJsonPreview] = useState("");
    const [copied, setCopied] = useState(false);
    const [functionSignature, setFunctionSignature] = useState("");
    const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    
    // Panel toggle state to manage complexity
    const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({});

    // Load tool data if editing
    useEffect(() => {
        if (id) {
            const tool = getToolById(id);
            if (tool) {
                setName(tool.name);
                setDescription(tool.description);
                setCategory(tool.category);
                setParameters(tool.parameters);
            }
        } else {
            // Default empty parameter for new tools
            setParameters([
                {
                    id: `p${Date.now()}`,
                    name: "",
                    type: "string",
                    description: "",
                    required: true,
                    // New fields for enhanced type support
                    format: "",
                    enumValues: [],
                    minimum: "",
                    maximum: "",
                    default: "",
                    arrayItemType: "string",
                    arrayItemDescription: "",
                    objectProperties: {},
                    dependencies: null
                }
            ]);
        }
    }, [id, getToolById]);

    // Toggle panel open/closed state
    const togglePanel = (panelId: string) => {
        setOpenPanels(prev => ({
            ...prev,
            [panelId]: !prev[panelId]
        }));
    };

    // Generate and update JSON preview
    const convertDefaultValue = (type: string, defaultValue: string): any => {
        if (defaultValue === '') return undefined;
        
        switch (type) {
            case 'number':
                return Number(defaultValue);
            case 'integer':
                return parseInt(defaultValue, 10);
            case 'boolean':
                return defaultValue === 'true';
            default:
                return defaultValue;
        }
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
                    properties: parameters.reduce((acc, param) => {
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

    const handleAddParameter = () => {
        setParameters([
            ...parameters,
            {
                id: `p${Date.now()}`,
                name: "",
                type: "string",
                description: "",
                required: true,
                // New fields for enhanced type support
                format: "",
                enumValues: [],
                minimum: "",
                maximum: "",
                default: "",
                arrayItemType: "string",
                arrayItemDescription: "",
                objectProperties: {},
                dependencies: null
            }
        ]);
    };

    const handleUpdateParameter = (id: string, field: keyof Parameter, value: any) => {
        setParameters(parameters.map(p => 
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    const handleUpdateParameterDependency = (id: string, dependencies: any) => {
        setParameters(parameters.map(p => 
            p.id === id ? { ...p, dependencies } : p
        ));
    };

    const handleUpdateArrayConfig = (id: string, config: any) => {
        setParameters(parameters.map(p => 
            p.id === id ? { 
                ...p, 
                arrayItemType: config.itemType,
                arrayItemDescription: config.itemDescription,
                objectProperties: config.itemType === 'object' ? config.itemProperties : p.objectProperties
            } : p
        ));
    };

    const handleUpdateObjectProperties = (id: string, propertiesText: string) => {
        try {
            const properties = JSON.parse(propertiesText);
            setParameters(parameters.map(p => 
                p.id === id ? { ...p, objectProperties: properties } : p
            ));
        } catch (error) {
            // Handle invalid JSON
            console.error('Invalid object properties JSON:', error);
        }
    };

    const handleUpdateEnumValues = (id: string, valuesText: string) => {
        try {
            // Split by comma and trim whitespace
            const values = valuesText.split(',').map(v => v.trim()).filter(v => v);
            setParameters(parameters.map(p => 
                p.id === id ? { ...p, enumValues: values } : p
            ));
        } catch (error) {
            console.error('Error updating enum values:', error);
        }
    };

    const handleRemoveParameter = (id: string) => {
        setParameters(parameters.filter(p => p.id !== id));
    };

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
            category,
            parameters,
            status: "active" as "active" | "inactive" | "draft",
            lastModified: new Date().toISOString(),
            categories: [category],
        };

        if (id) {
            updateTool(id, toolData);
        } else {
            try {
                const newId = await addTool(toolData); // Await the promise
                if (newId) {
                    navigate(`/tools/${newId}`);
                } else {
                    console.error("Failed to add tool: No ID returned");
                }
            } catch (error) {
                console.error("Error adding tool:", error);
            }
        }
    };

    const handleDelete = () => {
        if (id && confirm("Are you sure you want to delete this tool?")) {
            deleteTool(id);
            navigate("/dashboard");
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

    const handleFunctionSignatureChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const signature = e.target.value;
        setFunctionSignature(signature);

        if (signature.trim()) {
            const result = parseFunctionSignature(signature);
            if (result) {
                const { name, params } = result;
                setName(name);
                setParameters(params.map(param => ({
                    id: `p${Date.now()}`,
                    name: param.name,
                    type: param.type,
                    description: "",
                    required: true,
                    // New fields for enhanced type support
                    format: "",
                    enumValues: [],
                    minimum: "",
                    maximum: "",
                    default: "",
                    arrayItemType: "string",
                    arrayItemDescription: "",
                    objectProperties: {},
                    dependencies: null
                })));
            }
            setName(name);
            setParameters(parameters);

            const descriptionStart = await generateDescription(signature);
            setDescription(descriptionStart);

            const fieldsToHighlight = [];
            if (!name) fieldsToHighlight.push("name");
            if (!descriptionStart) fieldsToHighlight.push("description");
            parameters.forEach((param: Parameter) => {
                if (!param.name) fieldsToHighlight.push(`param-name-${param.id}`);
                if (!param.type) fieldsToHighlight.push(`param-type-${param.id}`);
                if (!param.description) fieldsToHighlight.push(`param-desc-${param.id}`);
            });
            setHighlightedFields(fieldsToHighlight);
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
                            onValueChange={(value) => handleUpdateParameter(param.id, 'format', value)}
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
                                onChange={(e) => handleUpdateParameter(param.id, 'minimum', e.target.value)}
                                placeholder="No minimum"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`param-max-${param.id}`}>Maximum (Optional)</Label>
                            <Input
                                id={`param-max-${param.id}`}
                                type="number"
                                value={param.maximum}
                                onChange={(e) => handleUpdateParameter(param.id, 'maximum', e.target.value)}
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
                            onChange={(e) => handleUpdateEnumValues(param.id, e.target.value)}
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
                        onUpdate={(config) => handleUpdateArrayConfig(param.id, config)}
                    />
                );
                
            case 'object':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={`param-object-${param.id}`}>Object Properties (JSON)</Label>
                        <Textarea
                            id={`param-object-${param.id}`}
                            value={JSON.stringify(param.objectProperties || {}, null, 2)}
                            onChange={(e) => handleUpdateObjectProperties(param.id, e.target.value)}
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link to="/tools">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
                            {id ? "Edit Tool" : "Create Tool"}
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        Configure your tool settings and parameters
                    </p>
                </div>
                <div className="flex gap-2">
                    {id && (
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    )}
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save
                    </Button>
                    {jsonPreview && <ToolTester toolSpec={jsonPreview} className="mr-2" />}
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
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <Label htmlFor="function-signature">Function Signature</Label>
                        <Textarea
                            id="function-signature"
                            placeholder="Paste function signature here..."
                            rows={4}
                            value={functionSignature}
                            onChange={handleFunctionSignatureChange}
                        />
                    </div>

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
                        <label htmlFor="tool-description">Tool Description</label>
                        <input
                            id="tool-description"
                            name="description"
                            placeholder="Enter tool description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={highlightedFields.includes("description") ? "border-red-500" : ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="General">General</SelectItem>
                                <SelectItem value="CLI">CLI</SelectItem>
                                <SelectItem value="API">API</SelectItem>
                                <SelectItem value="Data">Data</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Parameters</Label>
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                onClick={handleAddParameter}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Parameter
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {parameters.map((param, index) => (
                                <Collapsible 
                                    key={param.id} 
                                    open={openPanels[param.id]} 
                                    onOpenChange={() => togglePanel(param.id)}
                                    className="rounded-md border"
                                >
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium">
                                                Parameter {index + 1}: {param.name || "Unnamed Parameter"}
                                            </h3>
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
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <div className="space-y-2">
                                                <Label htmlFor={`param-name-${param.id}`}>
                                                    Parameter Name
                                                </Label>
                                                <Input
                                                    id={`param-name-${param.id}`}
                                                    value={param.name}
                                                    onChange={(e) => 
                                                        handleUpdateParameter(param.id, 'name', e.target.value)
                                                    }
                                                    placeholder="e.g. location"
                                                    className={highlightedFields.includes(`param-name-${param.id}`) ? "border-red-500" : ""}
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <Label htmlFor={`param-type-${param.id}`}>Type</Label>
                                                <Select
                                                    value={param.type}
                                                    onValueChange={(value) => 
                                                        handleUpdateParameter(param.id, 'type', value)
                                                    }
                                                >
                                                    <SelectTrigger id={`param-type-${param.id}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PARAMETER_TYPES.map(type => (
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
                                                <Label htmlFor={`param-desc-${param.id}`}>
                                                    Description
                                                </Label>
                                                <Input
                                                    id={`param-desc-${param.id}`}
                                                    value={param.description}
                                                    onChange={(e) => 
                                                        handleUpdateParameter(param.id, 'description', e.target.value)
                                                    }
                                                    placeholder="Describe the parameter"
                                                    className={highlightedFields.includes(`param-desc-${param.id}`) ? "border-red-500" : ""}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 mt-4">
                                            <Switch
                                                id={`param-required-${param.id}`}
                                                checked={param.required}
                                                onCheckedChange={(checked) => 
                                                    handleUpdateParameter(param.id, 'required', checked)
                                                }
                                            />
                                            <Label htmlFor={`param-required-${param.id}`}>
                                                Required parameter
                                            </Label>
                                        </div>
                                    </div>

                                    <CollapsibleContent>
                                        <div className="p-4 border-t space-y-4">
                                            {/* Default value field - common for all types */}
                                            <div className="space-y-2">
                                                <Label htmlFor={`param-default-${param.id}`}>Default Value (Optional)</Label>
                                                <Input
                                                    id={`param-default-${param.id}`}
                                                    value={param.default || ''}
                                                    onChange={(e) => handleUpdateParameter(param.id, 'default', e.target.value)}
                                                    placeholder="No default value"
                                                />
                                            </div>
                                            
                                            {/* Type-specific configuration */}
                                            {renderTypeSpecificFields(param)}
                                            
                                            {/* Parameter Dependencies */}
                                            <ParameterDependency 
                                                parameter={param}
                                                allParameters={parameters}
                                                onUpdate={(deps) => handleUpdateParameterDependency(param.id, deps)}
                                            />
                                            
                                            {parameters.length > 1 && (
                                                <div className="flex justify-end mt-4">
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRemoveParameter(param.id)}
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
                    </div>
                </motion.div>

                {/* JSON Preview */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>JSON Tool Specification</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={copyJsonToClipboard}
                                className="gap-2"
                            >
                                <Copy className="h-4 w-4" />
                                {copied ? "Copied!" : "Copy"}
                            </Button>
                        </div>

                        <div className="rounded-md border bg-muted/50 p-4">
                            <pre className="overflow-auto text-xs text-muted-foreground text-left max-h-[500px] whitespace-pre-wrap">
                                {jsonPreview || "Complete the form to generate JSON"}
                            </pre>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-2">
                            This JSON can be used directly with Large Language Models to define the tool's functionality.
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
