"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Code,
  Database,
  Shield,
  Zap,
  Globe,
  Palette,
  Package,
  MessageCircle,
  Users,
  Star,
  ArrowRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButtons, HeroAuthButtons } from "@/components/auth-buttons";
import AIChatbox from "@/components/ai-chatbox";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="text-center py-12 sm:py-16 relative px-4">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <AuthButtons />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
          <Image
            src="/codeguide-logo.png"
            alt="CodeGuide Logo"
            width={50}
            height={50}
            className="rounded-xl sm:w-[60px] sm:h-[60px]"
          />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-400 bg-clip-text text-transparent font-parkinsans">
            Legia Professional Services
          </h1>
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 mb-8">
          Connect with vetted professionals for architecture, interior design, and construction projects. 
          Get AI-powered project outlines and find the perfect experts for your dream space.
        </p>
        
        <HeroAuthButtons />
      </div>

      <main className="container mx-auto px-4 sm:px-6 pb-12 sm:pb-8 max-w-6xl">
        {/* AI Chatbox Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MessageCircle className="w-8 h-8 text-blue-500" />
              <h2 className="text-2xl sm:text-3xl font-bold">Start Your Project with AI</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Describe your dream project and our AI assistant will create a detailed outline, 
              generate visual concepts, and match you with the perfect professionals.
            </p>
          </div>
          
          <AIChatbox />
        </div>

        {/* Service Categories */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Professional Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with vetted professionals across multiple service categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-2">Architecture</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Custom building designs, floor plans, and architectural consultations
              </p>
              <div className="flex items-center justify-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                <span>250+ Experts</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-2">Interior Design</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Space planning, furniture selection, and complete room makeovers
              </p>
              <div className="flex items-center justify-center gap-1 text-sm text-purple-600 dark:text-purple-400">
                <span>180+ Designers</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold mb-2">Construction</h3>
              <p className="text-sm text-muted-foreground mb-4">
                New builds, renovations, and complete construction management
              </p>
              <div className="flex items-center justify-center gap-1 text-sm text-green-600 dark:text-green-400">
                <span>320+ Builders</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold mb-2">Landscaping</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Garden design, outdoor spaces, and sustainable landscaping
              </p>
              <div className="flex items-center justify-center gap-1 text-sm text-orange-600 dark:text-orange-400">
                <span>95+ Specialists</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get your project started in 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="font-semibold mb-2">Describe Your Project</h3>
              <p className="text-sm text-muted-foreground">
                Chat with our AI to outline your requirements and preferences
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">2</span>
              </div>
              <h3 className="font-semibold mb-2">Get AI Suggestions</h3>
              <p className="text-sm text-muted-foreground">
                Receive project outlines, visual concepts, and budget estimates
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">3</span>
              </div>
              <h3 className="font-semibold mb-2">Match with Professionals</h3>
              <p className="text-sm text-muted-foreground">
                Find vetted experts based on location, budget, and expertise
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">4</span>
              </div>
              <h3 className="font-semibold mb-2">Start Your Project</h3>
              <p className="text-sm text-muted-foreground">
                Secure payment, term-based milestones, and real-time communication
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">845+</div>
              <div className="text-sm text-muted-foreground">Verified Professionals</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">2.3k+</div>
              <div className="text-sm text-muted-foreground">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">4.9★</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">$2.1M</div>
              <div className="text-sm text-muted-foreground">Total Project Value</div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
