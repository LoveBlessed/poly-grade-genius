import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Calculator, TrendingUp, Shield, Users, Award } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/foundation-poly-hero.jpg";

const Landing = () => {
  const features = [
    {
      icon: Calculator,
      title: "Automatic CGPA Calculation",
      description: "Accurate GPA and CGPA computation based on credit units and grades"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Visual charts and analytics to track your academic performance over time"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your academic data is protected with enterprise-grade security"
    },
    {
      icon: Users,
      title: "Multi-Role Access",
      description: "Separate interfaces for students and administrators"
    },
    {
      icon: Award,
      title: "Performance Reports",
      description: "Generate detailed transcripts and performance reports"
    },
    {
      icon: GraduationCap,
      title: "Academic Excellence",
      description: "Built specifically for Foundation Polytechnic's grading system"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header-academic py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Foundation Polytechnic</h1>
              <p className="text-white/80 text-sm">CGPA Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="academic" size="sm">
              <Link to="/student-login">Student Login</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
              <Link to="/admin-login">Admin Login</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-secondary/90"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Track Your Academic
            <span className="block bg-gradient-to-r from-accent to-yellow-300 bg-clip-text text-transparent">
              Excellence
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Effortlessly manage your grades, calculate CGPA, and monitor your academic progress 
            with Foundation Polytechnic's comprehensive student portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="lg" className="text-lg px-8 py-4">
              <Link to="/student-login">Get Started as Student</Link>
            </Button>
            <Button asChild variant="academic" size="lg" className="text-lg px-8 py-4 bg-white/10 text-white border-white/30 hover:bg-white/20">
              <Link to="/admin-login">Administrator Access</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Powerful Features for Academic Success
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage and track academic performance efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-academic hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Excel in Your Studies?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of Foundation Polytechnic students already using our platform to achieve academic excellence.
          </p>
          <Button asChild variant="academic" size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link to="/student-login">Start Your Journey</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <GraduationCap className="h-6 w-6" />
            <span className="text-lg font-semibold">Foundation Polytechnic</span>
          </div>
          <p className="text-white/70 mb-4">CGPA Management System</p>
          <p className="text-white/50 text-sm">
            © 2024 Foundation Polytechnic. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;