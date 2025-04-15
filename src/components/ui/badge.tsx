import * as React from "react";
import { cn } from "../../lib/utils";
import type { VariantProps } from "./badgeVariants";
import { badgeVariants } from "./badgeVariants";

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    variant?: "default" | "secondary" | null;
}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge };

