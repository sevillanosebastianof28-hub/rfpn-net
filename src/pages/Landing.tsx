import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronRight,
  Layers,
  Settings,
  Bell,
  TrendingUp,
  Menu,
  X,
  Building2,
  FileCheck,
  Workflow,
  Clock,
  HeartHandshake,
  Sparkles,
  ArrowUpRight,
  Quote
} from 'lucide-react';

const features = [
  {
    icon: Building2,
    title: 'Property Network Management',
    description: 'Centralize all your property contacts, developers, and brokers in one intelligent platform.',
    color: 'from-violet-500 to-purple-600',
    stat: '10x faster',
  },
  {
    icon: Shield,
    title: 'Bank-Grade Security',
    description: 'SOC 2 compliant infrastructure with end-to-end encryption and role-based access control.',
    color: 'from-emerald-500 to-teal-600',
    stat: '99.99% uptime',
  },
  {
    icon: Zap,
    title: 'Instant Collaboration',
    description: 'Real-time updates across your entire network. No more chasing emails or spreadsheets.',
    color: 'from-amber-500 to-orange-600',
    stat: 'Real-time sync',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'AI-powered insights into your pipeline. Know exactly where every deal stands at a glance.',
    color: 'from-blue-500 to-cyan-600',
    stat: 'AI-powered',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Super Admins, Developers, Brokers — everyone gets exactly the access they need.',
    color: 'from-pink-500 to-rose-600',
    stat: '4 role types',
  },
  {
    icon: FileCheck,
    title: 'Application Tracking',
    description: 'Monitor funding applications from submission to approval with full audit trails.',
    color: 'from-indigo-500 to-violet-600',
    stat: 'End-to-end',
  },
];

const steps = [
  {
    number: '01',
    title: 'Connect Your Network',
    description: 'Import contacts, set up organizations, and invite your team in minutes.',
    icon: Workflow,
  },
  {
    number: '02',
    title: 'Configure & Customize',
    description: 'Set roles, branding, and access levels. Each organization gets their own workspace.',
    icon: Settings,
  },
  {
    number: '03',
    title: 'Scale With Confidence',
    description: 'Process applications, track progress, and grow your property network seamlessly.',
    icon: TrendingUp,
  },
];

const testimonials = [
  {
    quote: "Reley completely changed how we manage developer relationships. We went from scattered spreadsheets to a unified command center overnight.",
    author: "Sarah Chen",
    role: "Head of Lending, Meridian Capital",
    avatar: "SC",
    metric: "3x faster deal processing",
  },
  {
    quote: "The role-based access is a game-changer. Our brokers see exactly what they need, and our compliance team sleeps easy at night.",
    author: "Marcus Johnson",
    role: "VP Operations, FinCore Partners",
    avatar: "MJ",
    metric: "Zero security incidents",
  },
  {
    quote: "We onboarded 50 broker organizations in our first month. The multi-tenant architecture makes it feel like each one has their own platform.",
    author: "Elena Rodriguez",
    role: "CEO, PropertyBridge",
    avatar: "ER",
    metric: "50 orgs in 30 days",
  },
];

const stats = [
  { value: '99.99', label: 'Uptime SLA', suffix: '%' },
  { value: '500', label: 'Property Networks', suffix: '+' },
  { value: '£2.4B', label: 'Loans Processed', suffix: '' },
  { value: '<5', label: 'Min Setup Time', suffix: 'min' },
];

const trustedBy = [
  'Meridian Capital', 'PropertyBridge', 'FinCore Partners', 'Horizon Lending', 'Atlas Property Group'
];

const words = ['Faster', 'Smarter', 'Together', 'Securely'];

export default function Landing() {
  const [currentWord, setCurrentWord] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Logo size="sm" />
            
            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </a>
              <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/login">
                <Button variant="gradient" size="sm" className="group">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-background border-b border-border/50 animate-slide-up">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <a href="#features" className="block py-2 text-foreground">Features</a>
              <a href="#how-it-works" className="block py-2 text-foreground">How It Works</a>
              <a href="#testimonials" className="block py-2 text-foreground">Testimonials</a>
              <a href="#contact" className="block py-2 text-foreground">Contact</a>
              <div className="pt-4 border-t border-border/50 space-y-3">
                <Link to="/login" className="block">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link to="/login" className="block">
                  <Button variant="gradient" className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-40 left-10 w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-60 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          
          {/* Dot Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
              backgroundSize: '32px 32px'
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in hover:bg-primary/15 transition-colors cursor-default">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">The #1 Platform for Property Finance Networks</span>
              <ChevronRight className="w-4 h-4 text-primary" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
              <span className="text-foreground">Build Property Networks</span>
              <br />
              <span className="relative inline-block mt-2">
                <span className="text-gradient">{words[currentWord]}</span>
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-glow rounded-full animate-pulse" />
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-slide-up stagger-1 leading-relaxed">
              Connect developers, brokers, and lenders in one powerful platform.
              <span className="text-foreground font-medium"> Manage contacts, track applications, and close deals faster.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-slide-up stagger-2">
              <Link to="/login">
                <Button variant="gradient" size="xl" className="btn-glow group text-base px-8 w-full sm:w-auto">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="mailto:hello@reley.io">
                <Button variant="outline" size="xl" className="group text-base px-8 w-full sm:w-auto">
                  <HeartHandshake className="w-5 h-5 mr-1" />
                  Contact Us
                </Button>
              </a>
            </div>

            {/* Social Proof Mini */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in stagger-3">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-2">
                  {['SC', 'MJ', 'ER', 'AK'].map((initials, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-xs font-medium text-white border-2 border-background">
                      {initials}
                    </div>
                  ))}
                </div>
                <span className="ml-2">Trusted by 500+ networks</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-1">4.9/5 from 200+ reviews</span>
              </div>
            </div>
          </div>

          {/* Hero Visual - Floating Dashboard */}
          <div className="relative mt-16 lg:mt-24 max-w-6xl mx-auto animate-slide-up stagger-4">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            
            {/* Glow behind dashboard */}
            <div className="absolute inset-4 bg-primary/10 rounded-3xl blur-2xl -z-10" />
            
            {/* Main Dashboard Card */}
            <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-background/50 text-xs text-muted-foreground">
                    app.reley.io/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                  {/* Sidebar Mock */}
                  <div className="hidden lg:block space-y-3">
                    {['Dashboard', 'Contacts', 'Users', 'Applications', 'Settings'].map((item, i) => (
                      <div 
                        key={item}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                          i === 0 ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        {i === 0 && <BarChart3 className="w-4 h-4" />}
                        {i === 1 && <Building2 className="w-4 h-4" />}
                        {i === 2 && <Users className="w-4 h-4" />}
                        {i === 3 && <FileCheck className="w-4 h-4" />}
                        {i === 4 && <Settings className="w-4 h-4" />}
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Active Contacts', value: '2,847', change: '+12%', icon: Building2 },
                        { label: 'Pipeline Value', value: '£48.5M', change: '+8%', icon: TrendingUp },
                        { label: 'Approval Rate', value: '94.2%', change: '+3%', icon: FileCheck },
                      ].map((stat) => (
                        <div key={stat.label} className="p-4 rounded-xl bg-background/50 border border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <stat.icon className="w-4 h-4 text-muted-foreground" />
                            {stat.change && (
                              <span className="text-xs text-success font-medium">{stat.change}</span>
                            )}
                          </div>
                          <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Chart Mock */}
                    <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-medium">Loan Pipeline Overview</span>
                        <Bell className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-end gap-2 h-32">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-gradient-to-t from-primary to-primary-glow rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -left-4 sm:-left-8 top-1/4 animate-bounce-subtle hidden md:block">
              <Card className="glass-card shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Loan Approved</div>
                      <div className="text-xs text-muted-foreground">£2.4M • Just now</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="absolute -right-4 sm:-right-8 top-1/3 animate-bounce-subtle hidden md:block" style={{ animationDelay: '0.5s' }}>
              <Card className="glass-card shadow-xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">+12 new contacts</div>
                      <div className="text-xs text-muted-foreground">This week</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Bar */}
      <section className="py-10 sm:py-14 border-y border-border/50 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground mb-8">
            Trusted by leading property finance firms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {trustedBy.map((name) => (
              <span key={name} className="text-lg font-semibold text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {stat.value}<span className="text-primary">{stat.suffix}</span>
                </div>
                <div className="text-sm sm:text-base text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Purpose-Built Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Everything your property network <span className="text-gradient">needs to thrive</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From contact management to loan tracking — one platform replaces your entire toolkit.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature) => (
              <Card 
                key={feature.title} 
                className="group relative overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <CardContent className="relative p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                      {feature.stat}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Clock className="w-4 h-4" />
              Get Started in Minutes
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Three steps to a <span className="text-gradient">smarter network</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              No complex setup. No lengthy onboarding. Just results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="relative group">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-40px)] h-px bg-gradient-to-r from-primary/30 to-primary/10" />
                )}
                
                <div className="text-center">
                  {/* Step Number */}
                  <div className="relative inline-flex mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-500">
                      <step.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-xs font-bold text-white shadow-lg">
                      {step.number}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA under How It Works */}
          <div className="text-center mt-16">
            <Link to="/login">
              <Button variant="gradient" size="lg" className="btn-glow group">
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 sm:py-32 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Customer Stories
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Trusted by property <span className="text-gradient">professionals</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              See how teams are transforming their property finance operations with Reley.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 sm:p-8">
                  {/* Quote icon */}
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  
                  <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                  
                  {/* Metric highlight */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium mb-6">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {testimonial.metric}
                  </div>
                  
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-sm font-medium text-white">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 sm:py-32 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="relative rounded-3xl overflow-hidden border border-border/50">
            {/* Layered Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-glow" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div 
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
                  radial-gradient(circle at 75% 75%, white 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px, 60px 60px'
              }}
            />
            {/* Animated orbs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

            <div className="relative px-6 py-20 sm:px-12 sm:py-28 lg:px-20 lg:py-32 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-sm font-medium text-white/90">Now onboarding new property networks</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                Ready to grow your<br className="hidden sm:block" />
                <span className="text-white/80">property network?</span>
              </h2>
              <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
                Join 500+ property finance firms who trust Reley. Get started in under 5 minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link to="/login">
                  <Button 
                    size="xl" 
                    className="bg-white text-primary hover:bg-white/90 shadow-2xl shadow-black/20 group w-full sm:w-auto text-base px-10 h-14"
                  >
                    Get Started Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a href="mailto:hello@reley.io">
                  <Button 
                    variant="outline" 
                    size="xl" 
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm w-full sm:w-auto text-base px-10 h-14"
                  >
                    Contact Us
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Quick setup in minutes
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Dedicated support
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Enterprise-grade security
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <Logo size="sm" />
              <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
                The modern platform for property finance networks. Connect, manage, and scale with confidence.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <a href="#" className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Reley Fast Property Network. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
