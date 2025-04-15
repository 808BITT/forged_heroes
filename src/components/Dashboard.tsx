import { motion } from "framer-motion";
import { Activity, ArrowRight, Hammer, Users, Wrench } from "lucide-react";
import { Link } from "react-router-dom";

const statsCards = [
    {
        title: "Total Tools",
        value: "12",
        change: "+2",
        icon: <Wrench className="h-5 w-5" />,
        color: "from-blue-600 to-blue-400"
    },
    {
        title: "Active Users",
        value: "2.4k",
        change: "+15%",
        icon: <Users className="h-5 w-5" />,
        color: "from-purple-600 to-purple-400"
    },
    {
        title: "Daily Actions",
        value: "1.2k",
        change: "+20%",
        icon: <Activity className="h-5 w-5" />,
        color: "from-emerald-600 to-emerald-400"
    }
];

export default function Dashboard() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome to Forged Heroes. Monitor your tools and activities.
                </p>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
                {statsCards.map((card) => (
                    <motion.div
                        key={card.title}
                        variants={item}
                        className="group relative overflow-hidden rounded-lg border p-6 hover:border-foreground/50 transition-colors"
                    >
                        <div className="flex items-center justify-between space-x-4">
                            <div className="flex items-center space-x-4">
                                <div className={`rounded-full p-2 bg-gradient-to-br ${card.color}`}>
                                    {card.icon}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {card.title}
                                    </p>
                                    <h3 className="text-2xl font-bold">{card.value}</h3>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1 text-emerald-500">
                                <span className="text-sm font-medium">{card.change}</span>
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border p-6 hover:border-foreground/50 transition-colors"
                >
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="space-y-4">
                        <Link
                            to="/tools/new"
                            className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="rounded-full p-2 bg-purple-100 dark:bg-purple-900">
                                    <Hammer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="font-medium">Create New Tool</p>
                                    <p className="text-sm text-muted-foreground">
                                        Add a new tool to your collection
                                    </p>
                                </div>
                            </div>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-lg border p-6 hover:border-foreground/50 transition-colors"
                >
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        {/* Add your recent activity items here */}
                        <p className="text-muted-foreground text-sm">No recent activity</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}