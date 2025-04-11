import { useState } from "react";

interface Toast {
    id: string;
    title: string;
    description?: string;
}

const TOAST_DURATION = 3000;

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (toast: Omit<Toast, "id">) => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev, { id, ...toast }]);
        setTimeout(() => removeToast(id), TOAST_DURATION);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return { toasts, addToast };
}

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
    return (
        <div className="fixed bottom-4 right-4 space-y-2 z-50">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="bg-white border border-gray-300 shadow-md rounded-md p-4 max-w-sm"
                >
                    <strong className="block font-medium">{toast.title}</strong>
                    {toast.description && <p className="text-sm text-gray-600">{toast.description}</p>}
                </div>
            ))}
        </div>
    );
}
