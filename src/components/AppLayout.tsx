import { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Sheet, SheetTrigger } from './ui/sheet';
import { Switch } from './ui/switch';
import { useTheme } from './ui/theme-provider';

// Icons
import {
    Home,
    Menu,
    Moon,
    Plus,
    Sun,
    Wrench
} from 'lucide-react';

const LazySheetContent = lazy(() => import('./ui/sheet').then(module => ({ default: module.SheetContent })));

export default function AppLayout() {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Debounced resize handler
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        const debouncedResize = debounce(handleResize, 200);

        window.addEventListener('resize', debouncedResize);
        return () => window.removeEventListener('resize', debouncedResize);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }, [theme, setTheme]);

    const navigateTo = useCallback((path: string) => {
        navigate(path);
        setMobileMenuOpen(false);
    }, [navigate]);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" aria-hidden="true" /> },
        { name: 'Tool List', path: '/tools', icon: <Wrench className="h-5 w-5" aria-hidden="true" /> },
        { name: 'New Tool', path: '/tools/new', icon: <Plus className="h-5 w-5" aria-hidden="true" /> },
    ];

    const sidebarContent = (
        <div className="h-full flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="p-6 border-b flex items-center justify-center">
                <img 
                    src="/static/logo.png" 
                    alt="Forged Heroes Logo" 
                    className="logo h-10" 
                />
            </div>

            <nav className="flex-1" aria-label="Main Navigation">
                <ul className="space-y-1.5 p-4">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 px-3 py-6 transition-all duration-200 hover:bg-accent/50",
                                    location.pathname === item.path && "bg-accent font-medium"
                                )}
                                onClick={() => navigateTo(item.path)}
                                aria-current={location.pathname === item.path ? "page" : undefined}
                            >
                                {item.icon}
                                {item.name}
                            </Button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-6 border-t backdrop-blur-sm">
                <div className="flex items-center gap-3 rounded-lg p-3 bg-muted/50">
                    <div className="flex items-center flex-1 space-x-3">
                        <Switch
                            id="theme-mode"
                            checked={theme === 'dark'}
                            onCheckedChange={toggleTheme}
                            className="data-[state=checked]:bg-purple-600"
                            aria-label="Toggle Theme"
                        />
                        <label htmlFor="theme-mode" className="text-sm font-medium">
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </label>
                    </div>
                    {theme === 'dark' ? (
                        <Moon className="h-4 w-4 text-purple-400" aria-hidden="true" />
                    ) : (
                        <Sun className="h-4 w-4 text-amber-500" aria-hidden="true" />
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background">
            {/* Desktop Sidebar */}
            {!isMobile && (
                <div
                    className={cn(
                        "fixed inset-y-0 left-0 z-20 w-72 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:block",
                        "hidden transform transition-all duration-300 ease-in-out"
                    )}
                >
                    {sidebarContent}
                </div>
            )}

            {/* Mobile Sidebar */}
            {isMobile && (
                <Suspense fallback={<div>Loading...</div>}>
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <LazySheetContent side="left" className="p-0 w-72 transition-transform duration-300 ease-in-out" showCloseButton={false}>
                            {sidebarContent}
                        </LazySheetContent>
                    </Sheet>
                </Suspense>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:ml-72">
                {/* Header */}
                <header className="sticky top-0 z-10 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6">
                    {isMobile && (
                        <SheetTrigger asChild onClick={() => setMobileMenuOpen(true)}>
                            <Button variant="ghost" size="icon" className="mr-4">
                                <Menu className="h-5 w-5" aria-hidden="true" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                    )}
                    <div className="ml-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className={cn("hidden sm:flex hover:bg-accent/50 transition-colors", isMobile && "pointer-events-none")}
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5 text-amber-500" aria-hidden="true" />
                            ) : (
                                <Moon className="h-5 w-5 text-purple-400" aria-hidden="true" />
                            )}
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    <div className="container mx-auto py-6 px-4 max-w-6xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

// Utility function for debouncing
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}