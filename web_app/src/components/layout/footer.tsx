import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer(): JSX.Element {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Forge2</h3>
            <p className="text-muted-foreground">
              A modern application for managing your projects efficiently.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Tools</h3>
            <ul className="space-y-2">
              <li><Link to="/tools/new" className="text-muted-foreground hover:text-foreground">Create Tool</Link></li>
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground">Tool Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/documentation" className="text-muted-foreground hover:text-foreground">Documentation</Link></li>
              <li><Link to="/support" className="text-muted-foreground hover:text-foreground">Support</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} Forge2. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
