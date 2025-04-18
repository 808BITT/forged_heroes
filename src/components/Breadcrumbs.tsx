import { motion } from 'framer-motion';
import { ChevronRight, Home, Plus, Shield, Users, Wrench } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Breadcrumbs(): JSX.Element {
    const location = useLocation();
    const segments = location.pathname.split('/').filter(Boolean);

    // Format segment name nicely
    const formatName = (segment: string): string => {
        // Handle special cases like IDs
        if (segment.match(/^[a-f0-9]{8,}$/i)) return 'Details';

        // Convert kebab-case or snake_case to spaces
        const withSpaces = segment.replace(/[-_]/g, ' ');

        // Capitalize each word
        return withSpaces
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Get appropriate icon for a segment
    const getIconForSegment = (segment: string) => {
        switch (segment.toLowerCase()) {
            case 'tools': return <Wrench className="h-4 w-4" />;
            case 'new': return <Plus className="h-4 w-4" />;
            case 'barracks': return <Users className="h-4 w-4" />;
            case 'armory': return <Shield className="h-4 w-4" />;
            default: return null;
        }
    };

    // Build breadcrumb items with paths
    const crumbs = segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        const name = formatName(segment);
        const icon = getIconForSegment(segment);
        return { name, path, icon };
    });

    // Animations
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, x: -5 },
        show: { opacity: 1, x: 0 }
    };

    // Let's avoid using motion elements directly as li items
    return (
        <div
            className="container mx-auto py-2 px-4"
            aria-label="breadcrumb"
        >
            <nav>
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="flex items-center flex-wrap"
                >
                    <motion.div variants={item} className="flex items-center">
                        <Link
                            to="/"
                            className="flex items-center px-3 py-1.5 text-sm font-medium rounded-md hover:bg-accent/50 transition-colors group"
                        >
                            <Home className="h-4 w-4 mr-1 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-muted-foreground group-hover:text-primary transition-colors">Home</span>
                        </Link>
                    </motion.div>

                    {crumbs.map((crumb, index) => (
                        <motion.div key={crumb.path} variants={item} className="flex items-center">
                            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground flex-shrink-0" />

                            <Link
                                to={crumb.path}
                                className={cn(
                                    "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors group",
                                    index === crumbs.length - 1
                                        ? "bg-primary/10 font-medium text-primary"
                                        : "hover:bg-accent/50 font-medium text-muted-foreground hover:text-primary"
                                )}
                            >
                                {crumb.icon && <span className="mr-1.5">{crumb.icon}</span>}
                                {crumb.name}
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </nav>
        </div>
    );
}