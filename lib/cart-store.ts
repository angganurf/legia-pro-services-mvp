import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Professional {
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

export interface ProjectData {
  title: string;
  serviceType: string;
  landArea?: number;
  description: string;
  location: string;
  budget: number;
  style?: string;
  schedule?: string;
}

export interface CartItem {
  id: string;
  professional: Professional;
  projectData: ProjectData;
  estimatedPrice: number;
  notes?: string;
  addedAt: Date;
}

interface CartState {
  items: CartItem[];
  projectData: ProjectData | null;
  isOpen: boolean;
  
  // Cart actions
  addItem: (professional: Professional, projectData: ProjectData, notes?: string) => void;
  removeItem: (itemId: string) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  
  // Project data
  setProjectData: (projectData: ProjectData) => void;
  clearProjectData: () => void;
  
  // UI state
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getEstimatedTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      projectData: null,
      isOpen: false,

      addItem: (professional, projectData, notes) => {
        set((state) => {
          // Check if professional already exists in cart
          const existingItemIndex = state.items.findIndex(
            (item) => item.professional.id === professional.id
          );

          if (existingItemIndex !== -1) {
            // Update existing item
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              projectData,
              notes,
              estimatedPrice: calculateEstimatedPrice(professional, projectData),
              addedAt: new Date(),
            };
            return { items: updatedItems };
          } else {
            // Add new item
            const newItem: CartItem = {
              id: `${professional.id}-${Date.now()}`,
              professional,
              projectData,
              estimatedPrice: calculateEstimatedPrice(professional, projectData),
              notes,
              addedAt: new Date(),
            };
            return { items: [...state.items, newItem] };
          }
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateItemNotes: (itemId, notes) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, notes } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      setProjectData: (projectData) => {
        set({ projectData });
      },

      clearProjectData: () => {
        set({ projectData: null });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      getTotalItems: () => {
        return get().items.length;
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.estimatedPrice, 0);
      },

      getEstimatedTotal: () => {
        const subtotal = get().getTotalPrice();
        const vat = subtotal * 0.12; // 12% VAT
        const transactionFee = subtotal * 0.05; // 5% transaction fee
        return subtotal + vat + transactionFee;
      },
    }),
    {
      name: "legia-cart-storage",
      partialize: (state) => ({
        items: state.items,
        projectData: state.projectData,
      }),
    }
  )
);

// Helper function to calculate estimated price
function calculateEstimatedPrice(professional: Professional, projectData: ProjectData): number {
  const hourlyRate = parseFloat(professional.hourlyRate) || 0;
  const minBudget = parseFloat(professional.minimumBudget) || 0;
  const maxBudget = parseFloat(professional.maximumBudget) || Infinity;
  
  // Base estimation using hourly rate and project complexity
  let estimatedHours = 40; // Base hours for typical project
  
  // Adjust based on project data
  if (projectData.landArea && projectData.landArea > 200) {
    estimatedHours *= 1.5; // Larger projects take more time
  }
  
  if (projectData.serviceType === "architecture") {
    estimatedHours *= 1.3; // Architecture is more complex
  } else if (projectData.serviceType === "interior design") {
    estimatedHours *= 1.1; // Interior design is moderately complex
  }
  
  const baseEstimate = hourlyRate * estimatedHours;
  
  // Ensure it's within the professional's budget range
  const finalEstimate = Math.max(minBudget, Math.min(maxBudget, baseEstimate));
  
  return Math.round(finalEstimate);
}

// Export cart store actions for easy access
export const {
  addItem,
  removeItem,
  updateItemNotes,
  clearCart,
  setProjectData,
  clearProjectData,
  openCart,
  closeCart,
  toggleCart,
  getTotalItems,
  getTotalPrice,
  getEstimatedTotal,
} = useCartStore.getState();