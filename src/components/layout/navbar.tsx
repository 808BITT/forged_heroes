import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export default function Navbar(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    {
      name: 'lleros',
      path: '/lleros',
      subItems: [
        { name: 'Tools', path: '/tools' },
        { name: 'Barracks', path: '/barracks' },
        { name: 'Academy', path: '/academy' },
        { name: 'Armory', path: '/armory' },
        { name: 'Command Center', path: '/command-center' },
      ]
    },
    { name: 'Settings', path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleMenuItemClick = () => {
    setActiveDropdown(null);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center py-2">
            <Link to="/" className="flex items-center">
              <img 
                src="/static/logo.png" 
                alt="Forged Heroes Logo" 
                className="logo h-16 w-auto mr-4" 
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(item => (
              <div key={item.name} className="relative">
                <button
                  onClick={() => toggleDropdown(item.name)}
                  className={cn(
                    "text-foreground hover:text-primary transition-colors mr-4 font-semibold",
                    isActive(item.path) && "text-primary underline"
                  )}
                >
                  {item.name}
                </button>
                {item.subItems && activeDropdown === item.name && (
                  <div className="absolute left-0 mt-2 bg-background border rounded shadow-lg z-10">
                    {item.subItems.map(subItem => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={handleMenuItemClick}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            <div className="user-profile-placeholder">UserProfile Component</div>
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
              <div key={item.name}>
                <button
                  onClick={() => toggleDropdown(item.name)}
                  className={cn(
                    "block py-2 text-foreground hover:text-primary transition-colors font-semibold",
                    isActive(item.path) && "text-primary"
                  )}
                >
                  {item.name}
                </button>
                {item.subItems && activeDropdown === item.name && (
                  <div className="ml-4 space-y-2">
                    {item.subItems.map(subItem => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className="block py-1 text-sm text-foreground hover:text-primary transition-colors"
                        onClick={handleMenuItemClick}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="user-profile-placeholder">UserProfile Component</div>
          </div>
        )}
      </div>
    </nav>
  );
}
