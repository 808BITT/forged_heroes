import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export default function Navbar(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  const navItems = [
    // { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Tools', path: '/tools' },
    { name: 'Armory', path: '/armory' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Tool Forge
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(item => (
              <Link 
                key={item.path}
                to={item.path} 
                className={cn(
                  "text-foreground hover:text-primary transition-colors mr-4 hover:bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text",
                  isActive(item.path) && "text-primary font-medium underline"
                )}
              >
                {item.name}
              </Link>
            ))}
            
            <Button variant="default">
              <Link to="/tools/new">Create Tool</Link>
            </Button>
          </div>
          
          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 space-y-3 py-3">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "block py-2 text-foreground hover:text-primary transition-colors",
                  isActive(item.path) && "text-primary font-medium"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Button 
              variant="default" 
              className="w-full mt-3"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link to="/tools/new">Create Tool</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
