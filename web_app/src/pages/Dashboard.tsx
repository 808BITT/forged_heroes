import { useEffect } from 'react';
// import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
// import { Button } from '../components/ui/button';
import { useToolStore } from '../store/toolStore';
import ToolList from '../components/ToolList';

export default function Dashboard(): JSX.Element {
  const getStats = useToolStore(state => state.getStats);
  const loadToolSpecifications = useToolStore(state => state.loadToolSpecifications);
  const isLoaded = useToolStore(state => state.isLoaded);
  
  useEffect(() => {
    if (!isLoaded) {
      loadToolSpecifications();
    }
  }, [isLoaded, loadToolSpecifications]);
  
  const stats = getStats();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {/* <Button asChild>
          <Link to="/tools/new">Create New Tool</Link>
        </Button> */}
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Tools</CardTitle>
            <CardDescription>Your created tools</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalTools}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Tools ready to equip your LLM Heroes
            </p>
          </CardContent>
        </Card>
        {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Tools</CardTitle>
            <CardDescription>Tools currently in use</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.activeTools}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {stats.totalTools > 0
                ? `${Math.round((stats.activeTools / stats.totalTools) * 100)}% of your tools`
                : 'No tools created yet'}
            </p>
          </CardContent>
        </Card> */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Recently Updated</CardTitle>
            <CardDescription>Tools updated in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.recentlyUpdated}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Keep your tools up-to-date for best results
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tool List */}
      <div className="mt-8">
        <ToolList />
      </div>
    </div>
  );
}
