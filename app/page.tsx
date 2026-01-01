"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  ShieldCheck,
  Target,
  Plug,
  ArrowRight,
  LineChart,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/50 via-background to-background" />
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-secondary/50 px-3 py-1 text-sm text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2" />
              The Professional Trading Journal
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary mb-6 max-w-4xl mx-auto">
              Master Your Psychology. <br />
              <span className="text-[var(--accent)]">Build Your Wealth.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              JTrade is the intelligent journal that helps you track trades,
              analyze performance, and enforce discipline with automated trading
              rules.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={isLoggedIn ? "/dashboard" : "/register"}>
                <Button size="lg" className="h-12 px-8 text-lg gap-2">
                  {isLoggedIn ? "Open Dashboard" : "Start Journaling Free"}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-lg"
                >
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboard Preview / Mockup */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="relative rounded-xl border border-border bg-card shadow-2xl overflow-hidden max-w-5xl mx-auto aspect-[16/9] group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />

              {/* Abstract UI Representation */}
              <div className="p-6 h-full flex flex-col gap-6">
                {/* Mock Header */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400/50" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400/50" />
                    <div className="h-3 w-3 rounded-full bg-green-400/50" />
                  </div>
                  <div className="h-4 w-32 bg-muted rounded" />
                </div>

                <div className="flex-1 grid grid-cols-12 gap-6">
                  {/* Sidebar Mock */}
                  <div className="hidden md:block col-span-2 space-y-3">
                    <div className="h-8 w-full bg-primary/10 rounded" />
                    <div className="h-8 w-full bg-muted/30 rounded" />
                    <div className="h-8 w-full bg-muted/30 rounded" />
                    <div className="h-8 w-full bg-muted/30 rounded" />
                  </div>

                  {/* Main Content Mock */}
                  <div className="col-span-12 md:col-span-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Cards */}
                    <div className="p-4 rounded-lg border border-border bg-background space-y-2">
                      <div className="h-4 w-12 bg-muted rounded" />
                      <div className="h-8 w-24 bg-primary/20 rounded" />
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-background space-y-2">
                      <div className="h-4 w-12 bg-muted rounded" />
                      <div className="h-8 w-24 bg-[var(--accent)]/20 rounded" />
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-background space-y-2">
                      <div className="h-4 w-12 bg-muted rounded" />
                      <div className="h-8 w-24 bg-green-500/20 rounded" />
                    </div>

                    {/* Chart Area */}
                    <div className="col-span-1 md:col-span-2 p-4 rounded-lg border border-border bg-background h-48 flex items-end justify-between gap-2">
                      {[40, 60, 45, 70, 55, 80, 65, 90, 75, 50].map((h, i) => (
                        <div
                          key={i}
                          className="w-full bg-primary/20 rounded-t"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>

                    {/* Recent Trades */}
                    <div className="col-span-1 p-4 rounded-lg border border-border bg-background space-y-3">
                      <div className="h-4 w-20 bg-muted rounded mb-4" />
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <div className="h-3 w-12 bg-muted rounded" />
                          <div className="h-3 w-8 bg-green-500/20 rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlay Text */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="bg-background/80 backdrop-blur px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                  Interactive Dashboard Preview
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4">
                Everything You Need to Scale
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built for serious traders who treat their trading like a
                business.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={LineChart}
                title="Advanced Analytics"
                description="Visualize your equity curve, win rate, and risk-reward ratio automatically."
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Trading Rules Engine"
                description="Define your playbook. The system automatically flags trades that break your rules."
              />
              <FeatureCard
                icon={Plug}
                title="MT5 Sync"
                description="Connect your MetaTrader 5 account to import history and live trades instantly."
              />
              <FeatureCard
                icon={BookOpen}
                title="Rich Journaling"
                description="Add screenshots, notes, and tags to every trade. Learn from your winners and losers."
              />
              <FeatureCard
                icon={Target}
                title="Strategy Performance"
                description="Tag trades by strategy to see which setups are actually making you money."
              />
              <FeatureCard
                icon={CheckCircle2}
                title="Discipline Score"
                description="Track your psychological performance. Improve your discipline, improve your P&L."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-2xl p-8 md:p-16 text-center text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent)]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

              <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
                Ready to take your trading to the next level?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto relative z-10">
                Join thousands of traders who are building wealth through
                disciplined journaling.
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 px-8 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-sm text-muted-foreground">
              © 2024 JTrade. All rights reserved.
            </span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow group">
      <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
