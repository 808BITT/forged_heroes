import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Github, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function Support() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Support</h1>
      </div>

      <p className="text-muted-foreground mb-8">
        Need help with Forge? We're here to help you get the most out of our tool specification builder.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub Issues
            </CardTitle>
            <CardDescription>
              Report bugs or request features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              If you've found a bug or would like to request a new feature, please open an issue on GitHub.
            </p>
            <Button asChild variant="outline">
              <a href="https://github.com/yourusername/forge/issues" target="_blank" rel="noopener noreferrer">
                Open GitHub Issues
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Support
            </CardTitle>
            <CardDescription>
              Get help via email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              For direct support, please email our support team and we'll get back to you as soon as possible.
            </p>
            <Button asChild variant="outline">
              <a href="mailto:support@example.com">
                Contact Support
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">How do I export my tool specifications?</h3>
              <p className="text-muted-foreground">
                You can copy the JSON representation of your tool by clicking the "Copy" button in the tool editor.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Can I use Forge offline?</h3>
              <p className="text-muted-foreground">
                Yes, Forge can be run entirely locally. Just follow the installation instructions in the README.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Is Forge compatible with all LLMs?</h3>
              <p className="text-muted-foreground">
                Forge creates tool specifications that work with LLMs that support function calling, like GPT-4.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
