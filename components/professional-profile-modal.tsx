"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  MapPin,
  DollarSign,
  Clock,
  Shield,
  ShoppingCart,
  Mail,
  Phone,
  Globe,
  Calendar,
  Award,
  Users,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  MessageCircle,
} from "lucide-react";

interface Professional {
  id: string;
  businessName: string;
  description: string;
  location: string;
  averageRating: string;
  totalReviews: number;
  portfolioImages: string[];
  hourlyRate: string;
  minimumBudget: string;
  maximumBudget: string;
  availability: string;
  isVerified: boolean;
  serviceCategories: string[];
  user: {
    name: string;
    email: string;
    image?: string;
  };
  matchScore?: number;
  matchReasons?: string[];
}

interface ProfessionalProfileModalProps {
  professional: Professional | null;
  open: boolean;
  onClose: () => void;
  onAddToCart?: (professional: Professional) => void;
  onContact?: (professional: Professional) => void;
}

export default function ProfessionalProfileModal({
  professional,
  open,
  onClose,
  onAddToCart,
  onContact,
}: ProfessionalProfileModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  if (!professional) return null;

  const portfolioImages = Array.isArray(professional.portfolioImages) 
    ? professional.portfolioImages 
    : [];
  
  const serviceCategories = Array.isArray(professional.serviceCategories) 
    ? professional.serviceCategories 
    : [];

  const rating = parseFloat(professional.averageRating || "0");
  
  const handleNextImage = () => {
    if (portfolioImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % portfolioImages.length);
    }
  };

  const handlePrevImage = () => {
    if (portfolioImages.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? portfolioImages.length - 1 : prev - 1
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={professional.user.image} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg">
                  {professional.user.name?.charAt(0)?.toUpperCase() || "P"}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  {professional.businessName}
                  {professional.isVerified && (
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                  )}
                </DialogTitle>
                
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{professional.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{rating.toFixed(1)}</span>
                    <span>({professional.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {professional.matchScore && (
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  {professional.matchScore}% Match
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              
              <Button variant="ghost" size="icon">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="portfolio" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="portfolio" className="h-full m-0">
                <div className="relative h-full">
                  {portfolioImages.length > 0 ? (
                    <div className="h-full flex flex-col">
                      {/* Main Image */}
                      <div className="flex-1 relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                        <img
                          src={portfolioImages[currentImageIndex]}
                          alt={`${professional.businessName} portfolio ${currentImageIndex + 1}`}
                          className="w-full h-full object-contain"
                        />
                        
                        {/* Navigation Controls */}
                        {portfolioImages.length > 1 && (
                          <>
                            <button
                              onClick={handlePrevImage}
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={handleNextImage}
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {portfolioImages.length}
                        </div>
                      </div>

                      {/* Thumbnail Gallery */}
                      {portfolioImages.length > 1 && (
                        <div className="flex gap-2 p-4 border-t overflow-x-auto">
                          {portfolioImages.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                                index === currentImageIndex 
                                  ? "border-blue-500" 
                                  : "border-transparent hover:border-gray-300"
                              }`}
                            >
                              <img
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <div className="text-6xl mb-4">📷</div>
                        <p>No portfolio images available</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="services" className="m-0">
                <ScrollArea className="h-full p-6">
                  <div className="space-y-6">
                    {/* Service Categories */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Services Offered</h3>
                      <div className="flex flex-wrap gap-2">
                        {serviceCategories.map((category, index) => (
                          <Badge key={index} variant="secondary">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Pricing */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Pricing</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
                          <div className="font-semibold">${professional.hourlyRate}/hr</div>
                          <div className="text-sm text-muted-foreground">Hourly Rate</div>
                        </div>
                        
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="font-semibold">${parseInt(professional.minimumBudget).toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Minimum Project</div>
                        </div>
                        
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="font-semibold">${parseInt(professional.maximumBudget).toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">Maximum Project</div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Availability */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Availability</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={professional.availability === "available" ? "default" : "secondary"}>
                          {professional.availability === "available" ? "Available Now" : "Currently Busy"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {professional.availability === "available" 
                            ? "Ready to start new projects"
                            : "Currently working on existing projects"
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="reviews" className="m-0">
                <ScrollArea className="h-full p-6">
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                    <h3 className="text-xl font-semibold mb-2">Excellent Reviews</h3>
                    <p className="text-muted-foreground mb-4">
                      {rating.toFixed(1)} out of 5 stars based on {professional.totalReviews} reviews
                    </p>
                    <Button variant="outline">
                      Read All Reviews
                    </Button>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="about" className="m-0">
                <ScrollArea className="h-full p-6">
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">About {professional.businessName}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {professional.description}
                      </p>
                    </div>

                    <Separator />

                    {/* Match Reasons */}
                    {professional.matchReasons && professional.matchReasons.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Why This Professional?</h3>
                        <div className="space-y-2">
                          {professional.matchReasons.map((reason, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Contact Info */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{professional.user.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{professional.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onContact?.(professional)}
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contact
          </Button>
          
          <Button
            onClick={() => onAddToCart?.(professional)}
            disabled={professional.availability !== "available"}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}