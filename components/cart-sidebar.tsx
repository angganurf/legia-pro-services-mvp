"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Star,
  MapPin,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { useCartStore, CartItem } from "@/lib/cart-store";
import ProfessionalProfileModal from "./professional-profile-modal";

export default function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateItemNotes,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getEstimatedTotal,
  } = useCartStore();

  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleViewProfile = (professional: any) => {
    setSelectedProfessional(professional);
    setProfileModalOpen(true);
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = "/checkout";
  };

  const subtotal = getTotalPrice();
  const vat = subtotal * 0.12;
  const transactionFee = subtotal * 0.05;
  const total = getEstimatedTotal();

  return (
    <>
      <Sheet open={isOpen} onOpenChange={closeCart}>
        <SheetContent className="w-full sm:w-[500px] flex flex-col">
          <SheetHeader className="pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart ({getTotalItems()})
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                disabled={items.length === 0}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🛒</div>
                <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                <p className="text-muted-foreground mb-4">
                  Add professionals to your cart to get started
                </p>
                <Button onClick={closeCart} variant="outline">
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Cart Items */}
              <ScrollArea className="flex-1">
                <div className="space-y-4 pr-4">
                  {items.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onRemove={() => removeItem(item.id)}
                      onViewProfile={() => handleViewProfile(item.professional)}
                      onUpdateNotes={(notes) => updateItemNotes(item.id, notes)}
                    />
                  ))}
                </div>
              </ScrollArea>

              {/* Order Summary */}
              <div className="border-t pt-4 mt-4">
                <Card className="p-4 bg-gray-50 dark:bg-gray-800">
                  <h4 className="font-semibold mb-3">Order Summary</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT (12%)</span>
                      <span>${vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transaction Fee (5%)</span>
                      <span>${transactionFee.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Professional Profile Modal */}
      <ProfessionalProfileModal
        professional={selectedProfessional}
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}

interface CartItemCardProps {
  item: CartItem;
  onRemove: () => void;
  onViewProfile: () => void;
  onUpdateNotes: (notes: string) => void;
}

function CartItemCard({ item, onRemove, onViewProfile, onUpdateNotes }: CartItemCardProps) {
  const [notes, setNotes] = useState(item.notes || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const handleSaveNotes = () => {
    onUpdateNotes(notes);
    setIsEditingNotes(false);
  };

  const professional = item.professional;
  const rating = parseFloat(professional.averageRating || "0");

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <Avatar className="w-12 h-12 flex-shrink-0">
          <AvatarImage src={professional.user.image} />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            {professional.user.name?.charAt(0)?.toUpperCase() || "P"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0">
              <h4 className="font-semibold truncate">{professional.businessName}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{professional.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{rating.toFixed(1)}</span>
                </div>
                {professional.isVerified && (
                  <CheckCircle className="w-3 h-3 text-blue-500" />
                )}
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-red-500 hover:text-red-600 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Project Details */}
          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Project: {item.projectData.title}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300">
              {item.projectData.serviceType} • {item.projectData.location}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-3">
            {isEditingNotes ? (
              <div className="flex gap-2">
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for this professional..."
                  className="flex-1"
                  size="sm"
                />
                <Button size="sm" onClick={handleSaveNotes}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditingNotes(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div 
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setIsEditingNotes(true)}
              >
                {notes || (
                  <span className="italic">Click to add notes...</span>
                )}
              </div>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="font-semibold">
              ${item.estimatedPrice.toLocaleString()}
            </div>
            <Button variant="outline" size="sm" onClick={onViewProfile}>
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}