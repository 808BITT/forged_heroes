import { Copy } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

interface JsonPreviewProps {
    jsonPreview: string;
    onCopy: () => void;
    copied: boolean;
}

const JsonPreview: React.FC<JsonPreviewProps> = ({ jsonPreview, onCopy, copied }) => {
    const isEmpty = !jsonPreview.trim();

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">JSON Preview</h2>
            <div className="relative">
                {isEmpty ? (
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-muted-foreground">
                        Fill out the form to generate the JSON preview.
                    </div>
                ) : (
                    <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md overflow-auto text-sm">
                        {jsonPreview}
                    </pre>
                )}
                {!isEmpty && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={onCopy}
                    >
                        <Copy className="h-4 w-4 mr-1" />
                        {copied ? "Copied!" : "Copy"}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default JsonPreview;