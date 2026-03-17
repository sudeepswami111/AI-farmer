import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Camera,
  MessageCircle,
  CloudSun,
  IndianRupee,
  Sprout,
  Mic,
  ArrowRight,
  Shield,
  Zap,
  Users,
} from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

const features = [
  {
    icon: <Camera className="h-6 w-6" />,
    title: "Crop Disease Detection",
    description:
      "Upload photos of your crops and get instant AI-powered disease diagnosis with treatment recommendations.",
    href: "/upload",
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: "Ask Farming Questions",
    description:
      "Get expert answers to any farming question using text or voice in your local language.",
    href: "/ask",
  },
  {
    icon: <CloudSun className="h-6 w-6" />,
    title: "Weather Alerts",
    description:
      "Receive timely weather forecasts and alerts to protect your crops from adverse conditions.",
    href: "/weather",
  },
  {
    icon: <IndianRupee className="h-6 w-6" />,
    title: "Mandi Prices",
    description:
      "Check live market prices across mandis to get the best rates for your produce.",
    href: "/mandi",
  },
  {
    icon: <Mic className="h-6 w-6" />,
    title: "Voice Assistant",
    description:
      "Simply speak your questions and get answers in Hindi, Marathi, Telugu, and more.",
    href: "/ask",
  },
];

const stats = [
  { value: "50,000+", label: "Farmers Helped" },
  { value: "95%", label: "Accuracy Rate" },
  { value: "12+", label: "Languages" },
  { value: "24/7", label: "Available" },
];

const Index = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Beautiful farmland at sunrise"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
        </div>

        {/* Organic Shapes */}
        <div className="organic-shape bg-primary w-96 h-96 -top-48 -right-48" />
        <div className="organic-shape bg-accent w-64 h-64 bottom-0 left-1/4" />

        <div className="container-app relative py-20 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
              <Zap className="h-4 w-4" />
              AI-Powered Farming Assistant
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6 animate-fade-in stagger-1">
              Smart Farming,
              <br />
              <span className="text-primary">Better Harvests</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in stagger-2 leading-relaxed">
              Get instant AI-powered advice for crop diseases, weather alerts,
              and market prices. Available in your language,
              designed for Indian farmers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in stagger-3">
              <Button variant="hero" size="lg" asChild>
                <Link to="/dashboard">
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="hero-secondary" size="lg" asChild>
                <Link to="/ask">
                  <Mic className="h-5 w-5" />
                  Ask a Question
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative bg-primary py-12 -mt-1">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-primary-foreground/80">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-spacing py-20 bg-background">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Everything You Need for
              <span className="text-primary"> Better Farming</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              From disease detection to market prices, we've got you covered
              with AI-powered tools designed specifically for Indian agriculture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link
                key={feature.title}
                to={feature.href}
                className="animate-fade-in block"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section-spacing py-20 bg-muted/30">
        <div className="container-app">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                Trusted by Farmers
                <br />
                <span className="text-primary">Across India</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our AI models are trained on extensive agricultural data from
                across India, ensuring accurate recommendations for local crops,
                soil types, and climate conditions.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: <Shield className="h-5 w-5" />,
                    title: "Verified by Experts",
                    desc: "All recommendations reviewed by agricultural scientists",
                  },
                  {
                    icon: <Users className="h-5 w-5" />,
                    title: "Community Driven",
                    desc: "Learn from thousands of farmers sharing their experiences",
                  },
                  {
                    icon: <Zap className="h-5 w-5" />,
                    title: "Instant Results",
                    desc: "Get answers in seconds, not days",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-foreground">
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-strong">
                <img
                  src={heroImage}
                  alt="Farmer in field"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-surface rounded-xl shadow-medium p-5 max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center text-success-foreground">
                    ✓
                  </div>
                  <div>
                    <div className="font-heading font-bold text-foreground">
                      Disease Identified
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Leaf Blight - Treatable
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing py-20 bg-primary">
        <div className="container-app text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of farmers who are already using KisanMitra to grow
            better crops and earn more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-surface text-primary hover:bg-surface/90 shadow-medium"
              asChild
            >
              <Link to="/dashboard">
                Start Free Now
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link to="/ask">Talk to AI Assistant</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Index;
