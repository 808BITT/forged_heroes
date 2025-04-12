import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

interface GlowEffectProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  glowSize?: number;
  borderGlow?: boolean;
  glowIntensity?: number;
  hoverScale?: number;
  pulseOutline?: boolean;
  animateBorder?: boolean;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>; // Updated to match React's MouseEventHandler
}

export function GlowEffect({
  children,
  className = "",
  glowColor = "rgba(102, 204, 255, 0.5)", // Default light blue glow
  glowSize = 150,
  borderGlow = true,
  glowIntensity = 0.6,
  hoverScale = 1.02,
  pulseOutline = false,
  animateBorder = false,
  disabled = false,
  onClick,
}: GlowEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: -9999, y: -9999 }); // Start off-screen
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle mouse movement to track pointer position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || disabled) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Handle mouse enter to set hover state
  const handleMouseEnter = () => {
    if (disabled) return;
    setIsHovering(true);
  };

  // Handle mouse leave to reset hover state and position
  const handleMouseLeave = () => {
    setIsHovering(false);
    setPosition({ x: -9999, y: -9999 }); // Move the glow effect off-screen
  };

  // To prevent the glow from jumping when mouse enters
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      setIsHovering(false); // Clean up state when component unmounts
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        pulseOutline && "animate-pulse-outline",
        animateBorder && "border animate-border-flow",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={!disabled ? { scale: hoverScale } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* The actual content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Mouse-following glow effect */}
      {!disabled && isMounted && (
        <>
          {/* Radial glow that follows mouse */}
          <motion.div 
            className="absolute pointer-events-none transition-opacity duration-300 z-0"
            initial={{ opacity: 0 }}
            animate={{
              opacity: isHovering ? glowIntensity : 0,
              width: isHovering ? [glowSize, glowSize * 1.2, glowSize] : glowSize,
              height: isHovering ? [glowSize, glowSize * 1.2, glowSize] : glowSize,
            }}
            transition={{ 
              opacity: { duration: 0.2 },
              width: { duration: 2, repeat: isHovering ? Infinity : 0 },
              height: { duration: 2, repeat: isHovering ? Infinity : 0 },
              ease: "easeInOut"
            }}
            style={{
              left: position.x,
              top: position.y,
              width: glowSize,
              height: glowSize,
              background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
              transform: 'translate(-50%, -50%)',
              mixBlendMode: 'lighten',
            }}
          />

          {/* Border glow effect */}
          {borderGlow && (
            <motion.div 
              className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300"
              initial={{ opacity: 0 }}
              animate={{
                opacity: isHovering ? glowIntensity * 0.7 : 0,
                boxShadow: isHovering ? [
                  `0 0 15px 2px ${glowColor}`,
                  `0 0 20px 4px ${glowColor}`,
                  `0 0 15px 2px ${glowColor}`
                ] : `0 0 0 0 transparent`
              }}
              transition={{ 
                opacity: { duration: 0.2 },
                boxShadow: { duration: 2, repeat: isHovering ? Infinity : 0, ease: "easeInOut" }
              }}
            />
          )}

          {/* Animated outline that appears on hover */}
          <motion.div
            className="absolute inset-0 rounded-[inherit] pointer-events-none border-2 z-5"
            initial={{ borderColor: "rgba(255,255,255,0)" }}
            animate={{
              borderColor: isHovering ? [
                "rgba(255,255,255,0)",
                glowColor.replace(/[^,]+\)/, "0.6)"),
                "rgba(255,255,255,0)"
              ] : "rgba(255,255,255,0)"
            }}
            transition={{ 
              borderColor: { duration: 2, repeat: isHovering ? Infinity : 0 }
            }}
          />
        </>
      )}
      
      {/* Moving gradient background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 -z-10",
          isHovering && !disabled ? "opacity-100" : ""
        )}
        style={{
          background: `linear-gradient(120deg, 
            rgba(102, 204, 255, 0.1), 
            rgba(153, 102, 255, 0.1), 
            rgba(255, 102, 153, 0.1))`,
          backgroundSize: '200% 200%',
          animation: isHovering ? 'gradientMove 3s ease infinite' : 'none'
        }}
      />
    </motion.div>
  );
}

// Enhanced button with glow effect
interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  glowColor?: string;
  glowSize?: number;
  glowIntensity?: number;
  pulseOutline?: boolean;
  animateBorder?: boolean;
}

export function GlowButton({
  className,
  variant = 'default',
  size = 'default',
  glowColor = "rgba(102, 204, 255, 0.6)",
  glowSize = 180,
  glowIntensity = 0.7,
  pulseOutline = false,
  animateBorder = false,
  disabled,
  children,
  ...props
}: GlowButtonProps) {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'underline-offset-4 hover:underline text-primary',
  };

  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10',
  };

  return (
    <GlowEffect
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      glowColor={glowColor}
      glowSize={glowSize}
      glowIntensity={glowIntensity}
      pulseOutline={pulseOutline}
      animateBorder={animateBorder}
      disabled={disabled}
    >
      <button disabled={disabled} className="w-full h-full flex items-center justify-center" {...props}>
        {children}
      </button>
    </GlowEffect>
  );
}

// Enhanced input with glow effect
interface GlowInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  glowColor?: string;
  glowSize?: number;
  glowIntensity?: number;
  pulseOutline?: boolean;
  animateBorder?: boolean;
}

export function GlowInput({
  className,
  glowColor = "rgba(102, 204, 255, 0.4)",
  glowSize = 200,
  glowIntensity = 0.5,
  pulseOutline = false,
  animateBorder = false,
  disabled,
  ...props
}: GlowInputProps) {
  return (
    <GlowEffect
      className={cn(
        'flex rounded-md border border-input bg-background px-3 py-2 text-sm',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      glowColor={glowColor}
      glowSize={glowSize}
      glowIntensity={glowIntensity}
      pulseOutline={pulseOutline}
      animateBorder={animateBorder}
      disabled={disabled}
      borderGlow={false}
    >
      <input disabled={disabled} className="w-full bg-transparent outline-none" {...props} />
    </GlowEffect>
  );
}

// Enhanced card with glow effect
interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  glowSize?: number;
  glowIntensity?: number;
  hoverScale?: number;
  pulseOutline?: boolean;
  animateBorder?: boolean;
}

export function GlowCard({
  className,
  glowColor = "rgba(102, 204, 255, 0.4)",
  glowSize = 250,
  glowIntensity = 0.4,
  hoverScale = 1.01,
  pulseOutline = false,
  animateBorder = false,
  children,
  ...props
}: GlowCardProps) {
  return (
    <GlowEffect
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      glowColor={glowColor}
      glowSize={glowSize}
      glowIntensity={glowIntensity}
      hoverScale={hoverScale}
      pulseOutline={pulseOutline}
      animateBorder={animateBorder}
      {...props}
    >
      {children}
    </GlowEffect>
  );
}