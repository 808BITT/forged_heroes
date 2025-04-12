import { ArrowRight, Filter, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToolStore } from "../store/toolStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { LoadingSpinner } from "./ui/loading-spinner";
import { Tooltip } from "./ui/tooltip.tsx";
import { GlowEffect } from "./ui/glow-effect";
import { GlowCard } from "./ui/glow-effect";
import { motion } from "framer-motion";

interface ToolListProps {
    hideHeader?: boolean;
    searchTerm?: string;
}

export default function ToolList({ hideHeader = false, searchTerm: externalSearchTerm }: ToolListProps) {
    const tools = useToolStore((state) => state.getAllTools());
    const loadToolSpecifications = useToolStore((state) => state.loadToolSpecifications);
    const isLoaded = useToolStore((state) => state.isLoaded);
    const isLoading = useToolStore((state) => state.isLoading);
    const [internalSearchTerm, setInternalSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const navigate = useNavigate();
    
    // Use external search term if provided, or internal otherwise
    const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;

    useEffect(() => {
        if (!isLoaded) {
            loadToolSpecifications();
        }
    }, [isLoaded, loadToolSpecifications]);

    // Clear selected category when search term changes
    useEffect(() => {
        if (searchTerm) {
            setSelectedCategory(null);
        }
    }, [searchTerm]);

    const filteredTools = tools.filter((tool) => {
        const matchesSearch = searchTerm === "" || 
            tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (tool.description && tool.description.toLowerCase().includes(searchTerm.toLowerCase()));
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

    // Get a color based on category (for visual variety)
    const getCategoryColor = (category: string) => {
        const colors = [
            "rgba(26, 188, 156, 0.6)", // Emerald
            "rgba(46, 204, 113, 0.6)", // Green
            "rgba(52, 152, 219, 0.6)", // Blue
            "rgba(155, 89, 182, 0.6)", // Purple
            "rgba(52, 73, 94, 0.6)",   // Dark
            "rgba(241, 196, 15, 0.6)",  // Yellow
            "rgba(230, 126, 34, 0.6)",  // Orange
            "rgba(231, 76, 60, 0.6)",   // Red
        ];
        
        // Use a hash of the category name to select a color
        let hash = 0;
        for (let i = 0; i < category.length; i++) {
            hash = category.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    const handleToolClick = (toolId: string) => {
        navigate(`/tools/${toolId}`);
    };

    const renderToolCard = (tool: any, color: string, parameters: any[]) => (
        <Tooltip
            key={tool.id}
            content={
                <div>
                    <h3 className="text-base font-semibold mb-3">{tool.name}</h3>
                    {tool.description && (
                        <p className="mb-3 text-sm">{tool.description}</p>
                    )}
                    <h3 className="text-sm font-semibold mb-2">Parameters:</h3>
                    {parameters && parameters.length > 0 ? (
                        <ul className="space-y-2">
                            {parameters.map(param => (
                                <li key={param.id || `param-${param.name}`} className="flex items-start min-w-[200px]">
                                    <div className={`min-w-[10px] h-[10px] mt-[5px] rounded-full mr-[10px] flex-shrink-0 ${param.required ? "bg-green-500" : "bg-gray-400"}`}></div>
                                    <div className="flex-1">
                                        <span className="font-medium">{param.name}</span>
                                        <span className="text-xs ml-2 text-muted-foreground">({param.type})</span>
                                        <p className="text-xs text-muted-foreground mt-0.5">{param.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No parameters defined</p>
                    )}
                </div>
            }
            width="max-w-md"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <GlowCard
                    className="p-4 cursor-pointer relative overflow-hidden group rounded-lg border bg-card text-card-foreground shadow-sm"
                    glowColor={color}
                    glowSize={200}
                    glowIntensity={0.6}
                    hoverScale={1.03}
                    onClick={() => handleToolClick(tool.id)}
                >
                    <div className="flex justify-between">
                        <div>
                            <h3 className="font-semibold">{tool.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                                {tool.description}
                            </p>
                        </div>
                        {parameters.length > 0 && (
                            <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                                {parameters.length}
                            </div>
                        )}
                    </div>
                </GlowCard>
            </motion.div>
        </Tooltip>
    );

    return (
        <div className="space-y-8">
            {!hideHeader && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tools</h1>
                        <Link to="/tools/new">
                            <Button className="gap-2 relative overflow-hidden group">
                                <Plus className="h-4 w-4" />
                                <span>New Tool</span>
                                <motion.div 
                                    className="absolute inset-0 bg-primary/20" 
                                    initial={{x: "-100%"}} 
                                    whileHover={{x: "100%"}}
                                    transition={{duration: 0.8, ease: "easeInOut"}} 
                                />
                            </Button>
                        </Link>
                    </div>
                    <p className="text-muted-foreground">Equip your LLM Heroes with powerful tools</p>
                </div>
            )}

            {externalSearchTerm === undefined && (
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search tools..."
                            value={internalSearchTerm}
                            onChange={(e) => setInternalSearchTerm(e.target.value)}
                            className="pl-10 flex-1 border-primary/20 focus-within:border-primary/50 transition-colors duration-300"
                        />
                        {internalSearchTerm && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                onClick={() => setInternalSearchTerm("")}
                            >
                                ✕
                            </motion.button>
                        )}
                    </div>
                    {selectedCategory && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-md text-sm"
                        >
                            <Filter className="h-4 w-4" />
                            <span>Filter: {selectedCategory}</span>
                            <button 
                                onClick={() => setSelectedCategory(null)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                ✕
                            </button>
                        </motion.div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 space-y-4">
                    <h2 className="text-2xl font-semibold mb-4">Categories</h2>
                    <div className="space-y-2">
                        {categories.map((category) => {
                            const isSelected = selectedCategory === category;
                            const color = getCategoryColor(category);
                            
                            return (
                                <motion.div
                                    key={category}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    layout
                                >
                                    <GlowEffect
                                        className={`p-4 rounded-lg cursor-pointer transition-all ${isSelected 
                                            ? "bg-primary/80 text-primary-foreground shadow-md" 
                                            : "bg-card hover:bg-secondary/50"}`}
                                        onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                                        glowColor={color}
                                        glowSize={180}
                                        glowIntensity={isSelected ? 0.8 : 0.5}
                                        hoverScale={1.0}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{category}</span>
                                            {isSelected ? (
                                                <motion.div 
                                                    className="h-3 w-3 rounded-full bg-primary-foreground"
                                                    animate={{ scale: [1, 1.3, 1] }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                />
                                            ) : (
                                                <ArrowRight className="h-4 w-4 opacity-60" />
                                            )}
                                        </div>
                                    </GlowEffect>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-9 space-y-4">
                    <h2 className="text-2xl font-semibold mb-4">
                        {selectedCategory ? `${selectedCategory} Tools` : "All Tools"}
                        <span className="text-base font-normal ml-2 text-muted-foreground">({filteredTools.length} tools)</span>
                    </h2>

                    {isLoading ? (
                        <LoadingSpinner />
                    ) : (
                        <motion.div 
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.05 }}
                            layout
                        >
                            {filteredTools.map((tool) => {
                                const parameters = getParameters(tool);
                                const category = tool.category || "Uncategorized";
                                const color = getCategoryColor(category);
                                
                                return renderToolCard(tool, color, parameters);
                            })}

                            {filteredTools.length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    {searchTerm ? (
                                        <>No tools found matching "{searchTerm}"</>
                                    ) : selectedCategory ? (
                                        <>No tools found in category "{selectedCategory}"</>
                                    ) : (
                                        <>No tools found</>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
