import { motion } from "framer-motion";
import { ArrowLeft, Copy, Plus, Save, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Parameter, useToolStore } from "../store/toolStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea.tsx";

const PARAMETER_TYPES = ["string", "number", "boolean", "object", "array"];

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
                    required: true
                }
            ]);
        }
    }, [id, getToolById]);

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
                    properties: parameters.reduce((acc, param) => {
                        if (param.name) {
                            acc[param.name] = {
                                type: param.type,
                                description: param.description
                            };
                        }
                        return acc;
                    }, {} as Record<string, any>),
                    required: parameters
                        .filter(param => param.required && param.name)
                        .map(param => param.name)
                }
            }
        };
        
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
                required: true
            }
        ]);
    };

    const handleUpdateParameter = (id: string, field: keyof Parameter, value: any) => {
        setParameters(parameters.map(p => 
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    const handleRemoveParameter = (id: string) => {
        setParameters(parameters.filter(p => p.id !== id));
    };

    const handleSave = () => {
        if (!name.trim()) {
            alert("Tool name is required");
            return;
        }

        const toolData = {
            name,
            description,
            category,
            parameters,
            status: 'active' as const,
            lastModified: new Date().toISOString()
        };

        if (id) {
            updateTool(id, toolData);
        } else {
            const newId = addTool(toolData);
            navigate(`/tools/${newId}`);
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
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Tool Configuration Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">Tool Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter tool name..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter tool description..."
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
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
                            {parameters.map((param, _index) => (
                                <div key={param.id} className="rounded-md border p-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
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
                                                            {type}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        <div className="space-y-2 sm:col-span-2">
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
                                            />
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
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
                                        
                                        {parameters.length > 1 && (
                                            <div className="flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveParameter(param.id)}
                                                >
                                                    <Trash className="h-4 w-4 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
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