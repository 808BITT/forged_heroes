import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export default function Dashboard(): JSX.Element {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link to="/tools/new">Create New Tool</Link>
        </Button>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Tools</CardTitle>
            <CardDescription>Your created tools</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">5</p>
            <p className="text-sm text-muted-foreground mt-2">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Tools</CardTitle>
            <CardDescription>Tools currently in use</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3</p>
            <p className="text-sm text-muted-foreground mt-2">75% of your tools</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Latest Activity</CardTitle>
            <CardDescription>Recent tool updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Last edited 2 days ago</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Your Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample tool cards - in a real app these would be generated from your data */}
          {[1, 2, 3].map((tool) => (
            <Card key={tool} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Tool {tool}</CardTitle>
                <CardDescription>Created on {new Date().toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Tool description goes here...</p>
                <Button variant="outline" asChild className="w-full">
                  <Link to={`/tools/${tool}`}>Edit Tool</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
