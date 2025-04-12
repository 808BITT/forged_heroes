import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToolList from '../components/ToolList';
import { GlowButton, GlowInput, GlowCard } from '../components/ui/glow-effect';
import { useState } from 'react';

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="container mx-auto py-6">
      <GlowCard className="p-8 mb-8" glowColor="rgba(26, 188, 156, 0.4)" glowIntensity={0.5}>
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Tools</h1>
            <p className="text-muted-foreground">Equip your LLM Heroes with powerful tools</p>
          </div>
          <div className="flex gap-4">
            <Link to="/tools/new">
              <GlowButton 
                variant="default" 
                className="gap-2" 
                glowColor="rgba(26, 188, 156, 0.6)" 
                glowSize={180}
              >
                <Plus className="h-4 w-4" />
                New Tool
              </GlowButton>
            </Link>
            {/* <Button variant="outline" asChild className="gap-2">
              <Link to="/armory" className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Enter the Armory
              </Link>
            </Button> */}
          </div>
        </div>
      </GlowCard>
      
      <div className="mb-6">
        <GlowInput 
          type="text" 
          placeholder="Search tools..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
          glowColor="rgba(102, 204, 255, 0.4)"
        />
      </div>
      
      <ToolList hideHeader searchTerm={searchQuery} />
    </div>
  );
}
