import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowRight, Code, Database, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage(): JSX.Element {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-12 py-8">
      {/* Hero Section */}
      <motion.section 
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Forge Tools for your LLM Heroes
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Create, manage, and share powerful tools for Large Language Models to accomplish tasks more effectively.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/tools">Explore Tools</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/tools/new">Create New Tool</Link>
          </Button>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
      >
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Define Your Tool",
              description: "Create tools with parameters that your LLM can use to interact with external systems or perform complex tasks.",
              icon: <Wrench className="h-10 w-10" />
            },
            {
              title: "Generate JSON Spec",
              description: "Our tool automatically generates the JSON specification needed for LLM function calling.",
              icon: <Code className="h-10 w-10" />
            },
            {
              title: "Use With Any LLM",
              description: "Copy and paste the tool specs into your favorite LLM chat interface to enhance its capabilities.",
              icon: <Database className="h-10 w-10" />
            }
          ].map((feature, index) => (
            <motion.div key={index} variants={item}>
              <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-primary/10 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-center">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="bg-primary/5 rounded-lg p-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h2 className="text-3xl font-bold mb-4">Ready to build your tools?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Start equipping your LLM Heroes with the tools they need to accomplish tasks more effectively.
        </p>
        <Button size="lg" className="gap-2" asChild>
          <Link to="/tools/new" className="flex items-center">
            Create Your First Tool
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.section>
    </div>
  );
}
