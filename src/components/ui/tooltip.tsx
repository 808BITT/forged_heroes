import { ReactNode, useState } from "react";
import { motion } from "framer-motion";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  width?: string; // Added width prop for customizability
}

export function Tooltip({ content, children, width = "max-w-md" }: TooltipProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative group inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={isHovered ? { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { duration: 0.3, type: "spring", stiffness: 300 }
        } : { 
          opacity: 0, 
          y: 10, 
          scale: 0.95,
          transition: { duration: 0.2 }
        }}
        className={`absolute left-1/2 transform -translate-x-1/2 top-full mt-2 p-4 
          bg-gradient-to-br from-card/95 to-card/85 backdrop-blur-md text-card-foreground 
          rounded-lg border border-primary/30 shadow-lg z-50 ${width}
          pointer-events-none`}
      >
        <div className="relative z-10">
          {typeof content === "string" ? (
            <p className="text-sm">{content}</p>
          ) : (
            content
          )}
        </div>
        {/* Decorative glow effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-transparent opacity-70 blur-md -z-10"></div>
      </motion.div>
    </div>
  );
}

export default Tooltip;