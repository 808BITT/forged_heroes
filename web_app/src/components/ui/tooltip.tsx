import { ReactNode } from "react";
import { motion } from "framer-motion";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <div className="relative group inline-block">
      {children}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute left-1/2 transform -translate-x-1/2 top-full mt-1 p-3 bg-card text-card-foreground rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none z-10 max-w-xs"
      >
        {typeof content === "string" ? (
          <p>{content}</p>
        ) : (
          content
        )}
      </motion.div>
    </div>
  );
}

export default Tooltip;