import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useToolStore } from '../store/toolStore';

export default function ArmoryPage() {
    const tools = useToolStore((state) => state.getAllTools());
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTool, setSelectedTool] = useState<string | null>(null);

    // Group tools by category
    const toolsByCategory = tools.reduce((acc, tool) => {
        const category = tool.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(tool);
        return acc;
    }, {} as Record<string, typeof tools>);

    const selectedToolParameters = tools.find(tool => tool.id === selectedTool)?.parameters || [];

    // Get unique categories
    const categories = Object.keys(toolsByCategory);

    return (
        <div className="container mx-auto py-10 px-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 text-center"
            >
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                    The Digital Armory
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Equip your LLM Heroes with powerful tools. Click on categories to explore tools and their parameters.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Categories Column */}
                <motion.div
                    className="lg:col-span-3 space-y-4"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <h2 className="text-2xl font-semibold mb-4">Categories</h2>
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <motion.div
                                key={category}
                                className={`p-4 rounded-lg cursor-pointer transition-all ${selectedCategory === category
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'bg-card hover:bg-secondary/50'
                                    }`}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setSelectedTool(null);
                                }}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{category}</span>
                                    <motion.div
                                        animate={{ rotate: selectedCategory === category ? 90 : 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Tools Column */}
                <motion.div
                    className="lg:col-span-4 space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <h2 className="text-2xl font-semibold mb-4">
                        {selectedCategory ? `${selectedCategory} Tools` : 'Tools'}
                    </h2>

                    <AnimatePresence mode="wait">
                        {selectedCategory ? (
                            <motion.div
                                key={selectedCategory}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-3"
                            >
                                {toolsByCategory[selectedCategory].map((tool) => (
                                    <motion.div
                                        key={tool.id}
                                        className={`p-4 border rounded-lg cursor-pointer ${selectedTool === tool.id
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:border-primary/50'
                                            }`}
                                        onClick={() => setSelectedTool(tool.id)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold">{tool.name}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {tool.description}
                                                </p>
                                            </div>
                                            <motion.div
                                                animate={{ rotate: selectedTool === tool.id ? 90 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <p className="text-muted-foreground mb-4">
                                    Select a category to explore tools
                                </p>
                                <motion.div
                                    animate={{
                                        x: [0, 10, 0],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2
                                    }}
                                >
                                    <ChevronRight className="h-6 w-6 text-primary" />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Parameters Column */}
                <motion.div
                    className="lg:col-span-5 space-y-4"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <h2 className="text-2xl font-semibold mb-4">Parameters</h2>

                    <AnimatePresence mode="wait">
                        {selectedTool ? (
                            <motion.div
                                key={selectedTool}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-4"
                            >
                                {selectedToolParameters.map((param) => (
                                    <motion.div
                                        key={param.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-start">
                                            <div className={`w-2 h-2 mt-2 rounded-full mr-2 ${param.required ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                            <div>
                                                <h3 className="font-semibold">{param.name}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {param.description || "No description provided"}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}

                                {selectedToolParameters.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        This tool has no parameters
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <p className="text-muted-foreground mb-4">
                                    {selectedCategory
                                        ? "Select a tool to view its parameters"
                                        : "Select a category and then a tool to view parameters"}
                                </p>
                                {selectedCategory && (
                                    <motion.div
                                        animate={{
                                            x: [0, 10, 0],
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 2
                                        }}
                                    >
                                        <ChevronRight className="h-6 w-6 text-primary" />
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}