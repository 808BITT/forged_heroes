import { BookOpen, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToolList from '../components/ToolList';
import { Button } from '../components/ui/button';

export default function ToolsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tools</h1>
          <p className="text-muted-foreground text-sm">Equip your LLM Heroes with powerful tools</p>
        </div>
        <div className="flex gap-4">
          <Link to="/tools/new">
            <Button variant="default" className="gap-2">
              <Plus className="h-4 w-4" />
              New Tool
            </Button>
          </Link>
          {/* <Button variant="outline" asChild className="gap-2">
            <Link to="/armory" className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Enter the Armory
            </Link>
          </Button> */}
        </div>
      </div>
      <ToolList hideHeader />
    </div>
  );
}
