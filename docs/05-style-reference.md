# Style Reference

## Overview

This document outlines the design system and styling patterns used in Forge. Following these guidelines will ensure visual consistency throughout the application and make development more efficient.

## Design System

Forge uses a component-based design system built on Tailwind CSS and Radix UI primitives. This approach provides:

- Consistent design language
- Accessible components
- Responsive layouts
- Theme support (light/dark)
- Scalable UI architecture

## Color Palette

### Primary Colors

```css
--primary: 179 96% 20%;           /* Main brand color */
--primary-foreground: 210 40% 98%; /* Text on primary */

--secondary: 217.2 32.6% 17.5%;    /* Secondary accent */
--secondary-foreground: 210 40% 98%; /* Text on secondary */

--accent: 217.2 32.6% 17.5%;       /* Highlight accent */
--accent-foreground: 210 40% 98%;   /* Text on accent */
```

### UI Colors

```css
--background: 222.2 84% 4.9%;      /* Page background */
--foreground: 210 40% 98%;         /* Main text */

--card: 222.2 84% 4.9%;            /* Card background */
--card-foreground: 210 40% 98%;    /* Card text */

--popover: 222.2 84% 4.9%;         /* Popover background */
--popover-foreground: 210 40% 98%; /* Popover text */

--muted: 217.2 32.6% 17.5%;        /* Muted elements */
--muted-foreground: 215 20.2% 65.1%; /* Muted text */

--border: 217.2 32.6% 17.5%;       /* Borders */
--input: 217.2 32.6% 17.5%;        /* Input fields */
--ring: 179 96% 25%;               /* Focus rings */
```

### Semantic Colors

```css
--destructive: 0 62.8% 30.6%;      /* Error/delete actions */
--destructive-foreground: 210 40% 98%; /* Text on destructive */

--success: 142 76% 36%;            /* Success indicators */
--warning: 38 92% 50%;             /* Warning indicators */
--info: 217 91% 60%;               /* Information indicators */
```

## Typography

### Font Family

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Font Sizes

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## Spacing

Based on a 4px grid system, accessible through Tailwind's spacing scale:

```css
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

## Border Radius

```css
--radius: 0.5rem;       /* Base radius */
--radius-sm: 0.3rem;    /* Small radius */
--radius-lg: 0.8rem;    /* Large radius */
--radius-full: 9999px;  /* Pill shape */
```

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

## Animations

### Standard Animations

```css
@keyframes accordion-down {
  from { height: 0 }
  to { height: var(--radix-accordion-content-height) }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height) }
  to { height: 0 }
}

@keyframes float {
  0% { transform: translateY(0px) }
  50% { transform: translateY(-10px) }
  100% { transform: translateY(0px) }
}
```

### Animation Utilities

```css
.animate-accordion-down {
  animation: accordion-down 0.2s ease-out;
}

.animate-accordion-up {
  animation: accordion-up 0.2s ease-out;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

## Components

### Button Variants

- **Primary**: Main call-to-action buttons
- **Secondary**: Alternative actions
- **Ghost**: Low-emphasis buttons
- **Link**: Text links
- **Destructive**: Delete/remove actions
- **Outline**: Bordered buttons

### Component Examples

#### Button

```tsx
<Button variant="default">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="destructive">Delete</Button>
```

#### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>
```

#### Form Elements

```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="name">Name</Label>
    <Input id="name" placeholder="Enter name" />
  </div>
  <div className="space-y-2">
    <Label htmlFor="description">Description</Label>
    <Textarea id="description" placeholder="Enter description" />
  </div>
</div>
```

## Layout Patterns

### Container Widths

```css
.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }
```

### Page Layout

```tsx
<div className="min-h-screen bg-background">
  <header className="sticky top-0 z-40 border-b">
    {/* Navigation */}
  </header>
  <main className="container mx-auto py-6 px-4 md:px-6">
    {/* Page content */}
  </main>
  <footer className="border-t py-6">
    {/* Footer content */}
  </footer>
</div>
```

### Responsive Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

## Usage Guidelines

1. Use Tailwind utility classes for styling
2. Use component composition for complex UI elements
3. Maintain consistent spacing using the spacing scale
4. Follow semantic color usage
5. Use typography scale for consistent text sizing
6. Ensure all interactive elements have proper hover/focus states
7. Keep accessibility in mind by using proper contrast and ARIA attributes
