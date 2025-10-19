"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Star,
  RefreshCw,
  Grid,
  List,
  X,
  SlidersHorizontal
} from "lucide-react";
import ProfessionalCard from "./professional-card";

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

interface ProfessionalListProps {
  projectData?: {
    serviceType: string;
    location: string;
    budget: number;
    landArea?: number;
    style?: string;
  };
  onAddToCart?: (professional: Professional) => void;
  onViewProfile?: (professional: Professional) => void;
}

export default function ProfessionalList({
  projectData,
  onAddToCart,
  onViewProfile,
}: ProfessionalListProps) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("match_score");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [ratingFilter, setRatingFilter] = useState([0]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [locationFilter, setLocationFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    hasMore: true,
  });

  const fetchProfessionals = async (reset = true) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/professionals/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectData: projectData || {
            serviceType: "general",
            location: locationFilter || "anywhere",
            budget: priceRange[1],
          },
          limit: pagination.limit,
          offset: reset ? 0 : (pagination.page - 1) * pagination.limit,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (reset) {
          setProfessionals(data.professionals);
          setPagination(prev => ({
            ...prev,
            page: 1,
            total: data.total,
            hasMore: data.hasMore,
          }));
        } else {
          setProfessionals(prev => [...prev, ...data.professionals]);
          setPagination(prev => ({
            ...prev,
            total: data.total,
            hasMore: data.hasMore,
          }));
        }
      } else {
        setError(data.error || "Failed to fetch professionals");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectData || locationFilter || priceRange[1] > 0) {
      fetchProfessionals(true);
    }
  }, [projectData, locationFilter, priceRange, ratingFilter, verifiedOnly, sortBy]);

  // Apply client-side filters
  const filteredProfessionals = professionals.filter(prof => {
    // Search filter
    if (searchTerm && !prof.businessName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !prof.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !prof.location.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Rating filter
    if (ratingFilter[0] > 0 && parseFloat(prof.averageRating) < ratingFilter[0]) {
      return false;
    }

    // Location filter
    if (locationFilter && !prof.location.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }

    // Verified filter
    if (verifiedOnly && !prof.isVerified) {
      return false;
    }

    return true;
  });

  // Sort professionals
  const sortedProfessionals = [...filteredProfessionals].sort((a, b) => {
    switch (sortBy) {
      case "match_score":
        return (b.matchScore || 0) - (a.matchScore || 0);
      case "rating":
        return parseFloat(b.averageRating) - parseFloat(a.averageRating);
      case "reviews":
        return b.totalReviews - a.totalReviews;
      case "price_low":
        return parseInt(a.minimumBudget) - parseInt(b.minimumBudget);
      case "price_high":
        return parseInt(b.maximumBudget) - parseInt(a.maximumBudget);
      default:
        return 0;
    }
  });

  const handleLoadMore = () => {
    if (pagination.hasMore && !loading) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
      fetchProfessionals(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search professionals, services, or locations..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match_score">Best Match</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
              <SelectItem value="price_low">Lowest Price</SelectItem>
              <SelectItem value="price_high">Highest Price</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  placeholder="Enter location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Minimum Rating: {ratingFilter[0].toFixed(1)}★
                </label>
                <Slider
                  value={ratingFilter}
                  onValueChange={setRatingFilter}
                  max={5}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Budget Range: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={100000}
                  min={0}
                  step={1000}
                  className="w-full"
                />
              </div>

              {/* Verified Only */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verified-only"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="verified-only" className="text-sm font-medium">
                  Verified professionals only
                </label>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setLocationFilter("");
                  setRatingFilter([0]);
                  setPriceRange([0, 100000]);
                  setVerifiedOnly(false);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
              
              <Button onClick={() => fetchProfessionals(true)}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {loading ? "Searching..." : `Found ${sortedProfessionals.length} professionals`}
            {projectData && ` for "${projectData.serviceType}" in ${projectData.location}`}
          </span>
          {error && (
            <span className="text-red-500">{error}</span>
          )}
        </div>
      </Card>

      {/* Results Grid/List */}
      {loading && sortedProfessionals.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      ) : sortedProfessionals.length > 0 ? (
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        }`}>
          {sortedProfessionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              onAddToCart={onAddToCart}
              onViewProfile={onViewProfile}
              showMatchScore={!!projectData}
              compact={viewMode === "list"}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold mb-2">No professionals found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search terms to find more professionals.
          </p>
          <Button onClick={() => fetchProfessionals(true)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Search Again
          </Button>
        </Card>
      )}

      {/* Load More */}
      {pagination.hasMore && !loading && sortedProfessionals.length > 0 && (
        <div className="text-center">
          <Button onClick={handleLoadMore} variant="outline" size="lg">
            Load More Professionals
          </Button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && sortedProfessionals.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading more professionals...</span>
          </div>
        </div>
      )}
    </div>
  );
}