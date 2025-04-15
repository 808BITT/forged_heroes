import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>

      <div className="prose dark:prose-invert">
        <p>Last updated: {new Date().toLocaleDateString()}</p>

        <h2>Introduction</h2>
        <p>
          This Privacy Policy outlines how Forge ("we", "our", or "us") collects, uses, and protects 
          information that you provide when using our tool specification builder application.
        </p>

        <h2>Information We Collect</h2>
        <p>
          We collect information that you voluntarily provide when using Forge, including:
        </p>
        <ul>
          <li>Tool specifications and parameters you create</li>
          <li>Usage data to improve our application</li>
          <li>Contact information if you reach out to us for support</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>
          The information we collect is used to:
        </p>
        <ul>
          <li>Provide and improve our services</li>
          <li>Respond to your requests and inquiries</li>
          <li>Analyze usage patterns to enhance user experience</li>
        </ul>

        <h2>Data Storage</h2>
        <p>
          Your tool specifications are stored locally by default. If you opt to use our server-based storage, 
          we implement reasonable security measures to protect your data.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          We do not share your information with third parties except as necessary to provide our services 
          or as required by law.
        </p>

        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
          the new Privacy Policy on this page.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at privacy@example.com.
        </p>

        <div className="bg-muted p-4 rounded-md mt-8">
          <p className="text-sm text-muted-foreground">
            This is a placeholder privacy policy. Please replace with your actual privacy policy before deployment.
          </p>
        </div>
      </div>
    </div>
  );
}
