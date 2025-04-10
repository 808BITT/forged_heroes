import { motion } from "framer-motion";
import { ArrowRight, Plus, Search, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { useToolStore } from "../store/toolStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function ToolList() {
    const tools = useToolStore((state) => state.getAllTools());

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
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Tools</h1>
                    <Link to="/tools/new">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Tool
                        </Button>
                    </Link>
                </div>
                <p className="text-muted-foreground">
                    Manage and configure your tool collection
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tools..."
                        className="pl-10"
                    />
                </div>
                <Button variant="outline">Filter</Button>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
                {tools.map((tool) => (
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
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {tool.description}
                            </p>
                            <div className="flex items-center justify-between">
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

            {tools.length === 0 && (
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
                        Get started by creating your first tool.
                    </p>
                    <Link to="/tools/new" className="mt-4">
                        <Button>Create Tool</Button>
                    </Link>
                </motion.div>
            )}
        </div>
    );
}