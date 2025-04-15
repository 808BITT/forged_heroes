import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Terms & Conditions</h1>
      </div>

      <div className="prose dark:prose-invert">
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <h2>Agreement to Terms</h2>
        <p>
          By accessing or using Forge, you agree to be bound by these Terms and Conditions. 
          If you disagree with any part of the terms, you may not use our application.
        </p>

        <h2>Use License</h2>
        <p>
          Forge is licensed under the MIT License. You may:
        </p>
        <ul>
          <li>Use the application for personal or commercial purposes</li>
          <li>Modify the application for your own use</li>
          <li>Distribute the application with proper attribution</li>
        </ul>

        <h2>User Content</h2>
        <p>
          You retain all rights to the tool specifications you create with Forge. We claim no ownership 
          over your content.
        </p>

        <h2>Limitations</h2>
        <p>
          In no event shall Forge or its suppliers be liable for any damages arising out of the use 
          or inability to use the application, even if we have been notified of the possibility of such damages.
        </p>

        <h2>Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
          without regard to its conflict of law provisions.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify users of any changes by 
          updating the date at the top of this page.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at terms@example.com.
        </p>

        <div className="bg-muted p-4 rounded-md mt-8">
          <p className="text-sm text-muted-foreground">
            This is a placeholder terms and conditions document. Please replace with your actual terms before deployment.
          </p>
        </div>
      </div>
    </div>
  );
}
