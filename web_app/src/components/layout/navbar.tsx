import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Menu, X, Wrench } from 'lucide-react';

export default function Navbar(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl">Forge2</Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard" className="text-foreground hover:text-primary">Dashboard</Link>
            <Link to="/tools/new" className="text-foreground hover:text-primary">New Tool</Link>
            <Link to="/projects" className="text-foreground hover:text-primary">Projects</Link>
            <Link to="/settings" className="text-foreground hover:text-primary">Settings</Link>
            <Button variant="default">Get Started</Button>
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
            <Link to="/dashboard" className="block text-foreground hover:text-primary py-2">Dashboard</Link>
            <Link to="/tools/new" className="block text-foreground hover:text-primary py-2">New Tool</Link>
            <Link to="/projects" className="block text-foreground hover:text-primary py-2">Projects</Link>
            <Link to="/settings" className="block text-foreground hover:text-primary py-2">Settings</Link>
            <Button variant="default" className="w-full mt-3">Get Started</Button>
          </div>
        )}
      </div>
    </nav>
  );
}
