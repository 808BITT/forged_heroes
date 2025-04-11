import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToolList from '../components/ToolList';
import { Button } from '../components/ui/button';

export default function ToolsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tools</h1>
        <Button variant="outline" asChild className="gap-2">
          <Link to="/armory">
            <BookOpen className="h-4 w-4" />
            Enter the Armory
          </Link>
        </Button>
      </div>
      <ToolList />
    </div>
  );
}
