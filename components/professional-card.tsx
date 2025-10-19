"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  MapPin, 
  DollarSign, 
  Clock, 
  Shield, 
  ShoppingCart,
  Eye,
  Heart,
  ChevronRight,
  CheckCircle
} from "lucide-react";
import { useState } from "react";

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
  user: {
    name: string;
    email: string;
    image?: string;
  };
  matchScore?: number;
  matchReasons?: string[];
}

interface ProfessionalCardProps {
  professional: Professional;
  onAddToCart?: (professional: Professional) => void;
  onViewProfile?: (professional: Professional) => void;
  showMatchScore?: boolean;
  compact?: boolean;
}

export default function ProfessionalCard({
  professional,
  onAddToCart,
  onViewProfile,
  showMatchScore = false,
  compact = false,
}: ProfessionalCardProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const rating = parseFloat(professional.averageRating || "0");
  const portfolioImages = Array.isArray(professional.portfolioImages) 
    ? professional.portfolioImages 
    : [];

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
    <Card className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${
      compact ? "p-4" : "p-6"
    } ${showMatchScore && professional.matchScore && professional.matchScore >= 80 
      ? "ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10" 
      : ""}`}>
      
      {/* Match Score Badge */}
      {showMatchScore && professional.matchScore && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-blue-500 text-white px-2 py-1 text-xs font-semibold">
            {professional.matchScore}% Match
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={professional.user.image} />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            {professional.user.name?.charAt(0)?.toUpperCase() || "P"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg truncate">{professional.businessName}</h3>
            {professional.isVerified && (
              <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{professional.location}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{rating.toFixed(1)}</span>
              <span className="text-xs">({professional.totalReviews} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {professional.description}
      </p>

      {/* Portfolio Gallery */}
      {portfolioImages.length > 0 && !compact && (
        <div className="relative mb-4">
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={portfolioImages[currentImageIndex]}
              alt={`${professional.businessName} portfolio ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
              onLoad={() => setIsImageLoading(false)}
              onError={() => setIsImageLoading(false)}
            />
            {isImageLoading && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          
          {/* Gallery Controls */}
          {portfolioImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {portfolioImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Image Counter */}
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1} / {portfolioImages.length}
          </div>
        </div>
      )}

      {/* Match Reasons */}
      {showMatchScore && professional.matchReasons && professional.matchReasons.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Why this professional?</div>
          <div className="flex flex-wrap gap-1">
            {professional.matchReasons.slice(0, 3).map((reason, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {reason}
              </Badge>
            ))}
            {professional.matchReasons.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{professional.matchReasons.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Pricing & Availability */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <div className="text-muted-foreground mb-1">Rate</div>
          <div className="font-semibold">
            ${professional.hourlyRate}/hr
          </div>
        </div>
        
        <div>
          <div className="text-muted-foreground mb-1">Budget Range</div>
          <div className="font-semibold">
            ${parseInt(professional.minimumBudget).toLocaleString()} - ${parseInt(professional.maximumBudget).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-4">
        <Badge variant={professional.availability === "available" ? "default" : "secondary"}>
          {professional.availability === "available" ? "Available" : "Busy"}
        </Badge>
        
        {professional.isVerified && (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Shield className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewProfile?.(professional)}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Profile
        </Button>
        
        <Button
          size="sm"
          onClick={() => onAddToCart?.(professional)}
          disabled={professional.availability !== "available"}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="p-2"
        >
          <Heart className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}