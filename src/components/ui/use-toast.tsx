import { useState, useEffect, createContext, useContext } from "react";

interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: "default" | "success" | "error" | "info" | "warning";
    action?: {
        label: string;
        onClick: () => void;
    };
    duration?: number; // Duration in milliseconds
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_DURATION = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (toast: Omit<Toast, "id">) => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev, { id, ...toast }]);
        setTimeout(() => removeToast(id), toast.duration || TOAST_DURATION);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    
    return context;
}

export function ToastContainer() {
    const { toasts, removeToast } = useToast();
    
    // Reverse the array to display newest toasts at the bottom
    const sortedToasts = [...toasts].reverse();
    
    return (
        <div className="fixed bottom-4 right-4 flex flex-col-reverse gap-2 z-50">
            {sortedToasts.map((toast) => {
                // Get the appropriate styles based on the variant
                const variantStyles = {
                    default: "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700",
                    success: "bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300",
                    error: "bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300",
                    info: "bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300",
                    warning: "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300"
                };
                
                const variant = toast.variant || "default";
                const baseStyle = "border shadow-md rounded-md p-4 max-w-sm animate-fade-in relative";
                const variantStyle = variantStyles[variant];
                
                return (
                    <div
                        key={toast.id}
                        className={`${baseStyle} ${variantStyle}`}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors"
                            aria-label="Close toast"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        
                        {/* Icon for variant */}
                        <div className="flex items-center gap-2">
                            {variant !== "default" && (
                                <div className="flex-shrink-0">
                                    {variant === "success" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                    {variant === "error" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="8" x2="12" y2="12"></line>
                                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                        </svg>
                                    )}
                                    {variant === "info" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="12" y1="16" x2="12" y2="12"></line>
                                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                        </svg>
                                    )}
                                    {variant === "warning" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600 dark:text-yellow-400">
                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                            <line x1="12" y1="9" x2="12" y2="13"></line>
                                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                        </svg>
                                    )}
                                </div>
                            )}
                            <strong className="block font-medium">{toast.title}</strong>
                        </div>
                        
                        {toast.description && <p className="text-sm mt-1 opacity-90">{toast.description}</p>}
                        
                        {toast.action && (
                            <button 
                                onClick={toast.action.onClick} 
                                className={`mt-2 text-sm font-medium ${
                                    variant === "default" ? "text-blue-500 hover:text-blue-700" :
                                    variant === "success" ? "text-green-700 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300" :
                                    variant === "error" ? "text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" :
                                    variant === "info" ? "text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300" :
                                    "text-yellow-700 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                } transition-colors`}
                            >
                                {toast.action.label}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
