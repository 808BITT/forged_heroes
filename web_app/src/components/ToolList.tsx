import { motion } from "framer-motion";
import { ArrowRight, Plus, Search, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToolStore } from "../store/toolStore";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { LoadingSpinner } from "./ui/loading-spinner";

interface ToolListProps {
    hideHeader?: boolean;
}

export default function ToolList({ hideHeader = false }: ToolListProps) {
    const tools = useToolStore((state) => state.getAllTools());
    const loadToolSpecifications = useToolStore((state) => state.loadToolSpecifications);
    const isLoaded = useToolStore((state) => state.isLoaded);
    const isLoading = useToolStore((state) => state.isLoading);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (!isLoaded) {
            loadToolSpecifications();
        }
    }, [isLoaded, loadToolSpecifications]);

    const filteredTools = tools.filter(tool => 
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-8">
            {/* Only show header when not hidden */}
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
                    <p className="text-muted-foreground">
                        Equip your LLM Heroes with powerful tools
                    </p>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tools..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-muted-foreground">Loading your tools...</p>
                </div>
            ) : (
                <>
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        {filteredTools.map((tool) => (
                            <motion.div
                                key={tool.id}
                                variants={item}
                                className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:border-foreground/50 transition-all duration-200"
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="rounded-full p-2 bg-purple-100 dark:bg-purple-900">
                                                <Wrench className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <h3 className="font-semibold tracking-tight">{tool.name}</h3>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        <Badge variant="secondary">{tool.category}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {tool.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(tool.lastModified).toLocaleDateString()}
                                        </div>
                                        <Link to={`/tools/${tool.id}`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Configure
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
                            </motion.div>
                        ))}
                    </motion.div>

                    {filteredTools.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
                        >
                            <div className="rounded-full bg-secondary p-3">
                                <Wrench className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold">No tools found</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {searchTerm ? "Try a different search term." : "Get started by creating your first tool."}
                            </p>
                            {/* <Link to="/tools/new" className="mt-4">
                                <Button>Create Tool</Button>
                            </Link> */}
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
}
