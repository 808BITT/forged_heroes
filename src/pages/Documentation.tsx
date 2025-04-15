import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Documentation() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Documentation</h1>
      </div>

      <div className="prose dark:prose-invert">
        <h2>Getting Started with Forge</h2>
        <p>
          Forge is a tool specification builder for Large Language Models (LLMs). 
          It allows you to create and manage tool specifications that can be used with models like GPT-4.
        </p>

        <h3>What are Tool Specifications?</h3>
        <p>
          Tool specifications are JSON structures that define functions that LLMs can call. 
          They include the name, description, parameters, and return types for each tool.
        </p>

        <h3>Creating Your First Tool</h3>
        <ol>
          <li>Navigate to the Tools page</li>
          <li>Click "New Tool" to open the tool editor</li>
          <li>Fill in the basic information: name, description, and category</li>
          <li>Add parameters with appropriate types and descriptions</li>
          <li>Save your tool</li>
        </ol>

        <h3>Using Tool Specifications with LLMs</h3>
        <p>
          Once you've created a tool, you can copy its JSON representation and use it 
          in your prompts to LLMs. This enables the model to request specific actions
          through function calling.
        </p>

        <h2>Advanced Features</h2>
        <p>
          Explore the Armory to visualize your tools and their relationships.
          Create complex parameter dependencies, where the visibility or requirement
          of one parameter depends on the value of another.
        </p>

        <div className="bg-muted p-4 rounded-md mt-8">
          <p className="text-sm text-muted-foreground">
            This documentation is a placeholder. More comprehensive documentation will be added soon.
          </p>
        </div>
      </div>
    </div>
  );
}
