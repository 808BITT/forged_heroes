import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label.tsx";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea.tsx";

export default function ToolEditor() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link to="/tools">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Tool</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Configure your tool settings and parameters
                    </p>
                </div>
                <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            <div className="grid gap-8">
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
                            className="max-w-md"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Enter tool description..."
                            className="max-w-xl"
                            rows={4}
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>Configuration</Label>
                        <div className="grid gap-6 max-w-xl">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label>Enable Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receive notifications when tool execution completes
                                    </p>
                                </div>
                                <Switch />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label>Auto-save Progress</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically save changes while editing
                                    </p>
                                </div>
                                <Switch />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                            id="tags"
                            placeholder="Enter comma-separated tags..."
                            className="max-w-md"
                        />
                        <p className="text-sm text-muted-foreground">
                            Separate tags with commas (e.g. automation, testing, deployment)
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold tracking-tight">Advanced Settings</h2>
                        <Button variant="outline">Configure</Button>
                    </div>

                    <div className="rounded-lg border bg-card">
                        <div className="p-6">
                            <h3 className="font-medium">API Configuration</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Configure API endpoints and authentication settings
                            </p>
                        </div>
                        <div className="border-t p-6">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="apiKey">API Key</Label>
                                    <Input
                                        id="apiKey"
                                        type="password"
                                        placeholder="Enter API key..."
                                        className="max-w-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endpoint">API Endpoint</Label>
                                    <Input
                                        id="endpoint"
                                        placeholder="https://api.example.com/v1"
                                        className="max-w-md"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}