# Style Reference

## Overview

This document defines the design system and styling standards used throughout the Llero platform. It promotes visual consistency, accessible UI, and scalable development by unifying component styles, layout behavior, and color themes.

---

## Design System

Llero uses a utility-first styling approach powered by **Tailwind CSS** and **Radix UI** components. This setup enables:

- A consistent design language
- Accessibility best practices
- Responsive layouts with mobile-first principles
- Support for dark/light themes
- Modular and scalable UI architecture

---

## Color System

### Brand Colors

```css
--primary: 179 96% 20%;
--primary-foreground: 210 40% 98%;

--secondary: 217.2 32.6% 17.5%;
--secondary-foreground: 210 40% 98%;

--accent: 217.2 32.6% 17.5%;
--accent-foreground: 210 40% 98%;
```

### UI Base Colors

```css
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;

--card: 222.2 84% 4.9%;
--card-foreground: 210 40% 98%;

--popover: 222.2 84% 4.9%;
--popover-foreground: 210 40% 98%;
```

### Utility Colors

```css
--muted: 217.2 32.6% 17.5%;
--muted-foreground: 215 20.2% 65.1%;
--border: 217.2 32.6% 17.5%;
--input: 217.2 32.6% 17.5%;
--ring: 179 96% 25%;
```

### Semantic Colors

```css
--destructive: 0 62.8% 30.6%;
--destructive-foreground: 210 40% 98%;

--success: 142 76% 36%;
--warning: 38 92% 50%;
--info: 217 91% 60%;
```

---

## Typography

### Fonts

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Scale & Weights

```css
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;

--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## Spacing & Layout

Llero uses a 4px spacing scale:

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-5: 1.25rem;
--space-6: 1.5rem;
--space-8: 2rem;
--space-10: 2.5rem;
--space-12: 3rem;
--space-16: 4rem;
```

### Border Radius

```css
--radius: 0.5rem;
--radius-sm: 0.3rem;
--radius-lg: 0.8rem;
--radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
```

---

## Animations

### Keyframes

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
  0% { transform: translateY(0) }
  50% { transform: translateY(-10px) }
  100% { transform: translateY(0) }
}
```

### Utilities

```css
.animate-accordion-down { animation: accordion-down 0.2s ease-out; }
.animate-accordion-up { animation: accordion-up 0.2s ease-out; }
.animate-float { animation: float 3s ease-in-out infinite; }
```

---

## Components

### Button Variants

- `primary`: Main actions
- `secondary`: Supporting actions
- `ghost`: Minimal styling
- `link`: Inline navigational action
- `destructive`: High-risk actions
- `outline`: Emphasized but neutral

### Examples

```tsx
<Button variant="default">Primary</Button>
<Button variant="destructive">Delete</Button>
```

### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content here</p>
  </CardContent>
</Card>
```

### Form Inputs

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

---

## Layout Patterns

### Responsive Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

### Container Sizes

```css
.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }
```

### Page Wrapper

```tsx
<div className="min-h-screen bg-background">
  <header className="sticky top-0 z-40 border-b">
    {/* Navbar */}
  </header>
  <main className="container mx-auto py-6 px-4 md:px-6">
    {/* Page content */}
  </main>
  <footer className="border-t py-6">
    {/* Footer */}
  </footer>
</div>
```

---

## Usage Guidelines

1. Use Tailwind utility classes as first choice for styling
2. Compose UIs using Radix + custom component architecture
3. Apply spacing via standard scale and avoid arbitrary values
4. Follow semantic naming for color use (primary, accent, etc.)
5. Use text sizing from the defined typography scale
6. Ensure consistent shadow and radius usage for hierarchy
7. Enforce accessibility with contrast checks and ARIA roles

---

Consistent styling across the platform helps all modules—Forge, Barracks, Academy, Armory, and Command Center—feel unified, reliable, and maintainable.
