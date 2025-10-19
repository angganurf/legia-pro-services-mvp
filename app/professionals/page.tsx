"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import ProfessionalList from "@/components/professional-list";
import ProfessionalProfileModal from "@/components/professional-profile-modal";
import { Professional } from "@/lib/cart-store";
import { useRouter } from "next/navigation";

export default function ProfessionalsPage() {
  const router = useRouter();
  const { 
    projectData, 
    addItem, 
    openCart 
  } = useCartStore();
  
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleAddToCart = (professional: Professional) => {
    if (projectData) {
      addItem(professional, projectData);
      openCart();
    }
  };

  const handleViewProfile = (professional: Professional) => {
    setSelectedProfessional(professional);
    setProfileModalOpen(true);
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold">Find Professionals</h1>
                {projectData && (
                  <p className="text-sm text-muted-foreground">
                    Matching professionals for "{projectData.title}" in {projectData.location}
                  </p>
                )}
              </div>
            </div>
            
            <Button onClick={openCart} className="flex items-center gap-2">
              View Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {projectData ? (
          <ProfessionalList
            projectData={projectData}
            onAddToCart={handleAddToCart}
            onViewProfile={handleViewProfile}
          />
        ) : (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🏗️</div>
            <h2 className="text-2xl font-bold mb-4">No Project Data Found</h2>
            <p className="text-muted-foreground mb-6">
              Please start a new project on the homepage to get matched with professionals.
            </p>
            <Button onClick={handleBack}>
              Start New Project
            </Button>
          </Card>
        )}
      </div>

      {/* Professional Profile Modal */}
      <ProfessionalProfileModal
        professional={selectedProfessional}
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}