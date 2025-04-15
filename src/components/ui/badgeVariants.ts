import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border border-slate-200 bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-900",
    {
        variants: {
            variant: {
                default: "bg-slate-200 border-slate-200 text-slate-900",
                secondary: "bg-slate-100 border-slate-100 text-slate-800",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export { badgeVariants };
export type { VariantProps };
