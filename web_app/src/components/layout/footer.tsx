import { Link } from 'react-router-dom';
import { Github, Youtube, X, Twitch } from 'lucide-react';

export default function Footer(): JSX.Element {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Forge</h3>
            <p className="text-muted-foreground">
              Tools to equip your LLM Heroes
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-muted-foreground text-sm transition-colors">
              <li><Link to="/documentation" className='hover:text-primary'>Documentation</Link></li>
              <li><Link to="/support" className='hover:text-primary'>Support</Link></li>
              <li><Link to="/privacy" className='hover:text-primary'>Privacy</Link></li>
              <li><Link to="/terms" className='hover:text-primary'>Terms</Link></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-lg mb-4 items-center flex">Community</h3>
            <div className="flex gap-4">
              <a 
                href="https://github.com/808BiTT/llm-forge" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-6 w-6" />
              </a>
              <a 
                href="https://youtube.com/808BiTT/llm-forge" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-red-600 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-6 w-6" />
              </a>
              <a 
                href="https://x.com/808BiTT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors"
                aria-label="X (Twitter)"
              >
                <X className="h-6 w-6" />
              </a>
              <a 
                href="https://twitch.tv/808BiTT" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-purple-400 transition-colors"
                aria-label="Twitch"
              >
                <Twitch className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Forge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
