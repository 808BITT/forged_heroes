import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

export default function HomePage(): JSX.Element {
  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Build Better Projects with Forge2
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          A modern platform that helps teams collaborate, track progress, and deliver outstanding results.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/dashboard">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/docs">Learn More</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Project Management",
              description: "Organize tasks, track progress, and manage resources efficiently.",
              icon: "📋"
            },
            {
              title: "Team Collaboration",
              description: "Work together seamlessly with real-time updates and communication.",
              icon: "👥"
            },
            {
              title: "Analytics & Reporting",
              description: "Get insights into project performance with detailed analytics.",
              icon: "📊"
            }
          ].map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of teams that use Forge2 to deliver projects on time and within budget.
        </p>
        <Button size="lg">Sign Up Now</Button>
      </section>
    </div>
  );
}
