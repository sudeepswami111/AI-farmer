import { PageLayout } from "@/components/layout/PageLayout";
import { FeatureCard, Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Camera,
  MessageCircle,
  CloudSun,
  IndianRupee,
  Sprout,
  Mic,
  Bell,
  TrendingUp,
  Droplets,
  ThermometerSun,
} from "lucide-react";

const quickActions = [
  {
    icon: <Camera className="h-6 w-6" />,
    title: "Scan Crop",
    description: "Upload a photo to detect diseases",
    href: "/upload",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: "Ask Question",
    description: "Get AI-powered farming advice",
    href: "/ask",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: <Mic className="h-6 w-6" />,
    title: "Voice Query",
    description: "Speak your question in any language",
    href: "/ask",
    color: "bg-accent/10 text-accent-foreground",
  },
  {
    icon: <IndianRupee className="h-6 w-6" />,
    title: "Mandi Prices",
    description: "Check today's market rates",
    href: "/mandi",
    color: "bg-success/10 text-success",
  },
];

const weatherData = {
  temperature: "28°C",
  humidity: "65%",
  condition: "Partly Cloudy",
  alert: "Rain expected tomorrow - Consider harvesting today",
};

const recentPrices = [
  { crop: "Wheat", price: "₹2,150", change: "+2.3%" },
  { crop: "Rice", price: "₹3,400", change: "+1.1%" },
  { crop: "Cotton", price: "₹6,200", change: "-0.5%" },
  { crop: "Soybean", price: "₹4,800", change: "+3.2%" },
];

const Dashboard = () => {
  return (
    <PageLayout>
      <div className="container-app py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            Good Morning, Farmer! 🌾
          </h1>
          <p className="text-lg text-muted-foreground">
            Here's what's happening with your farm today
          </p>
        </div>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-xl font-heading font-bold text-foreground mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={action.title}
                to={action.href}
                className="animate-fade-in block"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full hover:scale-[1.02] transition-transform duration-300">
                  <CardContent className="p-4 text-center">
                    <div
                      className={`mx-auto h-12 w-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}
                    >
                      {action.icon}
                    </div>
                    <h3 className="font-heading font-bold text-foreground mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Weather Widget */}
          <section className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-heading font-bold mb-1">
                      Today's Weather
                    </h2>
                    <p className="text-primary-foreground/80">
                      {weatherData.condition}
                    </p>
                  </div>
                  <CloudSun className="h-12 w-12 opacity-80" />
                </div>

                <div className="flex gap-8 mb-6">
                  <div className="flex items-center gap-2">
                    <ThermometerSun className="h-5 w-5" />
                    <span className="text-2xl font-bold">
                      {weatherData.temperature}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    <span className="text-lg">{weatherData.humidity}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-warning/20 rounded-lg p-3">
                  <Bell className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <p className="text-sm">{weatherData.alert}</p>
                </div>
              </div>

              <CardContent className="p-4">
                <Link
                  to="/weather"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View 7-day forecast →
                </Link>
              </CardContent>
            </Card>
          </section>

          {/* Market Prices */}
          <section>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-heading font-bold text-foreground">
                    Market Prices
                  </h2>
                  <IndianRupee className="h-5 w-5 text-muted-foreground" />
                </div>

                <div className="space-y-3">
                  {recentPrices.map((item) => (
                    <div
                      key={item.crop}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <span className="font-medium text-foreground">
                        {item.crop}
                      </span>
                      <div className="text-right">
                        <div className="font-bold text-foreground">
                          {item.price}
                        </div>
                        <div
                          className={`text-sm ${
                            item.change.startsWith("+")
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          <TrendingUp className="h-3 w-3 inline mr-1" />
                          {item.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/mandi"
                  className="block mt-4 text-sm font-medium text-primary hover:underline text-center"
                >
                  View all prices →
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Features Grid */}
        <section className="mt-8">
          <h2 className="text-xl font-heading font-bold text-foreground mb-4">
            Explore Tools
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/upload">
              <FeatureCard
                icon={<Camera className="h-6 w-6" />}
                title="Disease Detection"
                description="AI-powered crop disease identification from photos"
              />
            </Link>
            <Link to="/soil">
              <FeatureCard
                icon={<Sprout className="h-6 w-6" />}
                title="Soil Analysis"
                description="Get fertilizer and soil health recommendations"
              />
            </Link>
            <Link to="/weather">
              <FeatureCard
                icon={<CloudSun className="h-6 w-6" />}
                title="Weather Insights"
                description="Detailed forecasts and farming alerts"
              />
            </Link>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
