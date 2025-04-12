import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToolStore } from "../store/toolStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { LoadingSpinner } from "./ui/loading-spinner";
import { Tooltip } from "./ui/tooltip.tsx";

interface ToolListProps {
    hideHeader?: boolean;
}

export default function ToolList({ hideHeader = false }: ToolListProps) {
    const tools = useToolStore((state) => state.getAllTools());
    const loadToolSpecifications = useToolStore((state) => state.loadToolSpecifications);
    const isLoaded = useToolStore((state) => state.isLoaded);
    const isLoading = useToolStore((state) => state.isLoading);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoaded) {
            loadToolSpecifications();
        }
    }, [isLoaded, loadToolSpecifications]);

    const filteredTools = tools.filter((tool) => {
        const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? tool.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    const toolsByCategory = tools.reduce((acc, tool) => {
        const category = tool.category || "Uncategorized";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(tool);
        return acc;
    }, {} as Record<string, typeof tools>);

    const categories = Object.keys(toolsByCategory);

    // Helper function to parse parameters if they're stored as a string
    interface ToolParameter {
        id?: string;
        name: string;
        type: string;
        description: string;
        required: boolean;
    }

    const getParameters = (tool: { parameters?: string | ToolParameter[] }): ToolParameter[] => {
        if (!tool.parameters) return [];
        
        // If parameters is a string, parse it
        if (typeof tool.parameters === 'string') {
            try {
                return JSON.parse(tool.parameters) as ToolParameter[];
            } catch (err) {
                console.error('Failed to parse parameters:', err);
                return [];
            }
        }
        
        // If it's already an array, return it
        if (Array.isArray(tool.parameters)) {
            return tool.parameters;
        }
        
        return [];
    };

    return (
        <div className="space-y-8">
            {!hideHeader && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tools</h1>
                        <Link to="/tools/new">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Tool
                            </Button>
                        </Link>
                    </div>
                    <p className="text-muted-foreground">Equip your LLM Heroes with powerful tools</p>
                </div>
            )}

            <div className="flex items-center gap-4">
                <Input
                    type="text"
                    placeholder="Search tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 space-y-4">
                    <h2 className="text-2xl font-semibold mb-4">Categories</h2>
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <div
                                key={category}
                                className={`p-4 rounded-lg cursor-pointer transition-all ${selectedCategory === category
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "bg-card hover:bg-secondary/50"}`}
                                onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                            >
                                <span className="font-medium">{category}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-9 space-y-4">
                    <h2 className="text-2xl font-semibold mb-4">
                        {selectedCategory ? `${selectedCategory} Tools` : "All Tools"}
                    </h2>

                    {isLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTools.map((tool) => {
                                const parameters = getParameters(tool);
                                return (
                                <Tooltip
                                    key={tool.id}
                                    content={
                                        <div>
                                            <h3 className="text-sm font-semibold mb-2">Parameters:</h3>
                                            {parameters && parameters.length > 0 ? (
                                                <ul className="space-y-1">
                                                    {parameters.map(param => (
                                                        <li key={param.id || `param-${param.name}`} className="flex items-start">
                                                            <div className={`w-2 h-2 mt-1 rounded-full mr-2 ${param.required ? "bg-green-500" : "bg-gray-400"}`}></div>
                                                            <div>
                                                                <span className="font-medium">{param.name}</span>
                                                                <span className="text-xs ml-2 text-muted-foreground">({param.type})</span>
                                                                <p className="text-xs text-muted-foreground">{param.description}</p>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">No parameters defined</p>
                                            )}
                                        </div>
                                    }
                                >
                                    <div
                                        className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-all"
                                        onClick={() => navigate(`/tools/${tool.id}`)}
                                    >
                                        <h3 className="font-semibold">{tool.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {tool.description}
                                        </p>
                                    </div>
                                </Tooltip>
                            )})}

                            {filteredTools.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground">
                                    No tools found
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
