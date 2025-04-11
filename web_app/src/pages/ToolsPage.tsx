import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToolList from '../components/ToolList';
import { Button } from '../components/ui/button';

export default function ToolsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tools</h1>
        <Button variant="outline" asChild className="gap-2 mt-4 sm:mt-0">
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
