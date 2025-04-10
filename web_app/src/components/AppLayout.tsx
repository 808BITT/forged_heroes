import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
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

export default function AppLayout() {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const navigateTo = (path: string) => {
        navigate(path);
        setMobileMenuOpen(false);
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: <Home className="h-5 w-5" /> },
        { name: 'Tool List', path: '/tools', icon: <Wrench className="h-5 w-5" /> },
        { name: 'New Tool', path: '/tools/new', icon: <Plus className="h-5 w-5" /> },
    ];

    const sidebarContent = (
        <div className="h-full flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="p-6 border-b">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Forged Heroes</h2>
            </div>

            <nav className="flex-1">
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
                        />
                        <label htmlFor="theme-mode" className="text-sm font-medium">
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </label>
                    </div>
                    {theme === 'dark' ?
                        <Moon className="h-4 w-4 text-purple-400" /> :
                        <Sun className="h-4 w-4 text-amber-500" />
                    }
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
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetContent side="left" className="p-0 w-72" showCloseButton={false}>
                        {sidebarContent}
                    </SheetContent>
                </Sheet>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:ml-72">
                {/* Header */}
                <header className="sticky top-0 z-10 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6">
                    {isMobile && (
                        <SheetTrigger asChild onClick={() => setMobileMenuOpen(true)}>
                            <Button variant="ghost" size="icon" className="mr-4">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                    )}
                    <h1 className="text-lg font-semibold">Forged Heroes</h1>
                    <div className="ml-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="hidden sm:flex hover:bg-accent/50 transition-colors"
                        >
                            {theme === 'dark' ?
                                <Sun className="h-5 w-5 text-amber-500" /> :
                                <Moon className="h-5 w-5 text-purple-400" />
                            }
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