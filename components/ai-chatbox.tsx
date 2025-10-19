"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Home, 
  DollarSign, 
  MapPin, 
  Calendar,
  Palette,
  Ruler,
  Loader2,
  ShoppingCart,
  Users
} from "lucide-react";
import { useChat } from "ai/react";
import { useCartStore } from "@/lib/cart-store";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ProjectData {
  title: string;
  serviceType: string;
  landArea?: number;
  description: string;
  location: string;
  budget: number;
  style?: string;
  schedule?: string;
}

interface AIResponse {
  projectOutline: {
    title: string;
    description: string;
    keyFeatures: string[];
    estimatedTimeline: string;
    recommendations: string[];
  };
  roomSuggestions: Array<{
    roomType: string;
    description: string;
    estimatedSize: string;
    keyFeatures: string[];
  }>;
  imagePrompts: string[];
  budgetBreakdown: {
    design: number;
    materials: number;
    labor: number;
    contingency: number;
  };
}

export default function AIChatbox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI assistant for Legia. I'll help you create a detailed project outline for your dream space. Tell me about your project - what kind of service do you need, where is it located, what's your budget, and any specific preferences you have?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [aiResponse, setAIResponse] = useState<AIResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { setProjectData: setCartProjectData, openCart } = useCartStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/projects/ai-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I've analyzed your requirements and created a project outline for you. Here's what I understand:\n\n**Project:** ${data.projectData.title}\n**Service Type:** ${data.projectData.serviceType}\n**Location:** ${data.projectData.location}\n**Budget:** $${data.projectData.budget.toLocaleString()}\n**Description:** ${data.projectData.description}\n\n**Key Features:**\n${data.aiResponse.projectOutline.keyFeatures.map((feature: string) => `• ${feature}`).join("\n")}\n\n**Estimated Timeline:** ${data.aiResponse.projectOutline.estimatedTimeline}\n\nWould you like me to find professionals for this project?`,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        setProjectData(data.projectData);
        setAIResponse(data.aiResponse);
        
        // Store project data in cart
        setCartProjectData(data.projectData);
      } else {
        throw new Error(data.error || "Failed to generate project data");
      }
    } catch (error) {
      console.error("AI generation error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col p-6 shadow-lg border-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Project Assistant</h3>
              <p className="text-sm text-muted-foreground">Powered by advanced AI</p>
            </div>
          </div>
          {isGenerating && (
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </div>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarImage src="/ai-avatar.png" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500">
                      <Bot className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white ml-auto"
                      : "bg-white dark:bg-gray-800 border border-border/50"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === "user"
                        ? "text-blue-100"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {message.role === "user" && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className="bg-blue-500">
                      <User className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isGenerating && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500">
                    <Bot className="w-4 h-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white dark:bg-gray-800 border border-border/50 rounded-2xl px-4 py-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Project Summary (if available) */}
        {projectData && aiResponse && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <h4 className="font-semibold text-sm">Project Summary</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Home className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium capitalize">{projectData.serviceType}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-medium truncate">{projectData.location}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground">Budget:</span>
                <span className="font-medium">${projectData.budget.toLocaleString()}</span>
              </div>
              
              {projectData.landArea && (
                <div className="flex items-center gap-2">
                  <Ruler className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Area:</span>
                  <span className="font-medium">{projectData.landArea}m²</span>
                </div>
              )}
            </div>

            {aiResponse.projectOutline.keyFeatures.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-2">Key Features:</div>
                <div className="flex flex-wrap gap-1">
                  {aiResponse.projectOutline.keyFeatures.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {aiResponse.projectOutline.keyFeatures.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{aiResponse.projectOutline.keyFeatures.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {projectData && aiResponse && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <h4 className="font-semibold text-sm">Ready to Find Professionals</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => window.location.href = "/professionals"}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Users className="w-4 h-4 mr-2" />
                Find Professionals
              </Button>
              
              <Button
                onClick={openCart}
                variant="outline"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Cart
              </Button>
            </div>
            
            <div className="mt-3 text-xs text-muted-foreground text-center">
              Your project data has been saved. Click to find matching professionals or manage your cart.
            </div>
          </div>
        )}

        {/* Input */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your dream project..."
              disabled={isGenerating}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isGenerating}
              size="icon"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Tip: Include details about location, budget, style preferences, and timeline for better results
          </div>
        </div>
      </Card>
    </div>
  );
}