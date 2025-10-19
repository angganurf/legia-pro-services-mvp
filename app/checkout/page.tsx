"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, 
  CreditCard, 
  Shield, 
  Truck, 
  Clock,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useCartStore, CartItem } from "@/lib/cart-store";
import { useRouter } from "next/navigation";
import { calculateFees, createPaymentTerms } from "@/lib/payment-gateways";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    projectData,
    clearCart,
    getTotalPrice,
    getEstimatedTotal,
  } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    // Contact Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    
    // Address
    address: "",
    city: "",
    postalCode: "",
    country: "Indonesia",
    
    // Project Details
    projectNotes: "",
    startDate: "",
    urgency: "normal",
    
    // Payment Terms
    paymentMethod: "full", // "full" or "installments"
    paymentProvider: "xendit", // "xendit", "midtrans", "tripay"
    customTerms: [
      { description: "Initial Deposit", percentage: 30, dueDays: 0 },
      { description: "Mid-Project Payment", percentage: 40, dueDays: 14 },
      { description: "Final Payment", percentage: 30, dueDays: 30 },
    ],
    
    // Agreement
    agreeToTerms: false,
    agreeToPrivacy: false,
  });

  const subtotal = getTotalPrice();
  const fees = calculateFees(subtotal);
  const total = fees.total;

  // Payment terms based on selection
  const paymentTerms = formData.paymentMethod === "installments" 
    ? createPaymentTerms(total, formData.customTerms)
    : [{ description: "Full Payment", amount: total, dueDate: new Date() }];

  useEffect(() => {
    if (items.length === 0) {
      router.push("/");
    }
  }, [items.length, router]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      // Validate contact info
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email format";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      
      // Validate address
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.postalCode.trim()) newErrors.postalCode = "Postal code is required";
    }

    if (currentStep === 2) {
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms";
      if (!formData.agreeToPrivacy) newErrors.agreeToPrivacy = "You must agree to the privacy policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setLoading(true);
    try {
      // Create order in backend
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map(item => ({
            professionalId: item.professional.id,
            estimatedPrice: item.estimatedPrice,
            notes: item.notes,
          })),
          projectData,
          customerInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          projectNotes: formData.projectNotes,
          startDate: formData.startDate,
          urgency: formData.urgency,
          paymentTerms,
          paymentMethod: formData.paymentMethod,
          paymentProvider: formData.paymentProvider,
          subtotal,
          fees,
          total,
        }),
      });

      const orderData = await orderResponse.json();

      if (orderData.success) {
        // Clear cart and redirect to payment
        clearCart();
        
        if (orderData.paymentUrl) {
          // Redirect to payment gateway
          window.location.href = orderData.paymentUrl;
        } else {
          // Redirect to order confirmation
          router.push(`/orders/${orderData.orderId}`);
        }
      } else {
        setErrors({ submit: orderData.error || "Failed to create order" });
      }
    } catch (error) {
      setErrors({ submit: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Button onClick={() => router.push("/")}>
            Continue Shopping
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/professionals")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Checkout</h1>
              <div className="flex items-center gap-2 mt-1">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      s <= step 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-200 text-gray-500"
                    }`}>
                      {s}
                    </div>
                    <span className={`text-sm ${
                      s <= step ? "text-blue-500" : "text-gray-500"
                    }`}>
                      {s === 1 && "Contact Info"}
                      {s === 2 && "Project Details"}
                      {s === 3 && "Payment"}
                      {s === 4 && "Review"}
                    </span>
                    {s < 4 && <div className="w-8 h-px bg-gray-300" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Contact Information */}
            {step === 1 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-4">Project Address</h3>
                
                <div className="mb-4">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className={errors.address ? "border-red-500" : ""}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className={errors.city ? "border-red-500" : ""}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      className={errors.postalCode ? "border-red-500" : ""}
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Indonesia">Indonesia</SelectItem>
                        <SelectItem value="Malaysia">Malaysia</SelectItem>
                        <SelectItem value="Singapore">Singapore</SelectItem>
                        <SelectItem value="Thailand">Thailand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 2: Project Details */}
            {step === 2 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Project Details</h2>
                
                <div className="mb-6">
                  <Label htmlFor="startDate">Preferred Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    className={errors.startDate ? "border-red-500" : ""}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                  )}
                </div>

                <div className="mb-6">
                  <Label>Project Urgency</Label>
                  <RadioGroup 
                    value={formData.urgency} 
                    onValueChange={(value) => handleInputChange("urgency", value)}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="low" />
                      <Label htmlFor="low">Low - Flexible timeline</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="normal" />
                      <Label htmlFor="normal">Normal - Standard timeline</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="high" />
                      <Label htmlFor="high">High - Urgent project</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="mb-6">
                  <Label htmlFor="projectNotes">Additional Notes</Label>
                  <Textarea
                    id="projectNotes"
                    placeholder="Any specific requirements, preferences, or additional information..."
                    value={formData.projectNotes}
                    onChange={(e) => handleInputChange("projectNotes", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                    Project Summary
                  </h3>
                  {projectData && (
                    <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                      <p><strong>Title:</strong> {projectData.title}</p>
                      <p><strong>Service:</strong> {projectData.serviceType}</p>
                      <p><strong>Location:</strong> {projectData.location}</p>
                      <p><strong>Budget:</strong> ${projectData.budget.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Checkbox 
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the Terms of Service and understand that this is a binding agreement for professional services.
                    </Label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>
                  )}
                  
                  <div className="flex items-start gap-2">
                    <Checkbox 
                      id="privacy"
                      checked={formData.agreeToPrivacy}
                      onCheckedChange={(checked) => handleInputChange("agreeToPrivacy", checked)}
                    />
                    <Label htmlFor="privacy" className="text-sm leading-relaxed">
                      I agree to the Privacy Policy and consent to the processing of my personal data.
                    </Label>
                  </div>
                  {errors.agreeToPrivacy && (
                    <p className="text-red-500 text-sm">{errors.agreeToPrivacy}</p>
                  )}
                </div>
              </Card>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
                
                <div className="mb-6">
                  <Label>Payment Terms</Label>
                  <RadioGroup 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => handleInputChange("paymentMethod", value)}
                    className="flex flex-col space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full" id="full" />
                      <Label htmlFor="full" className="flex-1">
                        <div>
                          <div className="font-medium">Full Payment</div>
                          <div className="text-sm text-muted-foreground">
                            Pay the full amount upfront - best value
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="installments" id="installments" />
                      <Label htmlFor="installments" className="flex-1">
                        <div>
                          <div className="font-medium">Installments</div>
                          <div className="text-sm text-muted-foreground">
                            Pay in multiple installments as project progresses
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.paymentMethod === "installments" && (
                  <div className="mb-6">
                    <Label>Payment Schedule</Label>
                    <div className="space-y-3 mt-2">
                      {formData.customTerms.map((term, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{term.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {term.dueDays === 0 ? "Due immediately" : `Due in ${term.dueDays} days`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">
                                ${((total * term.percentage) / 100).toFixed(2)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {term.percentage}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <Label>Payment Provider</Label>
                  <Select value={formData.paymentProvider} onValueChange={(value) => handleInputChange("paymentProvider", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xendit">Xendit - Secure Payments</SelectItem>
                      <SelectItem value="midtrans">Midtrans - Multiple Payment Options</SelectItem>
                      <SelectItem value="tripay">Tripay - Local Payment Methods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                        Secure Payment Processing
                      </h4>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                        Your payment information is encrypted and secure. Funds are held in escrow 
                        until project milestones are completed to your satisfaction.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Review Your Order</h2>
                
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div>
                    <h3 className="font-semibold mb-3">Customer Information</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Name:</span>
                          <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p className="font-medium">{formData.email}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Phone:</span>
                          <p className="font-medium">{formData.phone}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Start Date:</span>
                          <p className="font-medium">{formData.startDate}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="text-muted-foreground">Address:</span>
                        <p className="font-medium">
                          {formData.address}, {formData.city}, {formData.postalCode}, {formData.country}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Terms */}
                  <div>
                    <h3 className="font-semibold mb-3">Payment Terms</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <div className="mb-3">
                        <Badge variant={formData.paymentMethod === "full" ? "default" : "secondary"}>
                          {formData.paymentMethod === "full" ? "Full Payment" : "Installments"}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {paymentTerms.map((term, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="font-medium">{term.description}</span>
                              {term.dueDate && (
                                <span className="text-muted-foreground ml-2">
                                  (Due: {term.dueDate.toLocaleDateString()})
                                </span>
                              )}
                            </div>
                            <span className="font-semibold">${term.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100">
                          Ready to Proceed
                        </h4>
                        <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                          You've agreed to all terms and conditions. Click "Place Order" to create your project 
                          and proceed to secure payment.
                        </p>
                      </div>
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-red-900 dark:text-red-100">
                            Error
                          </h4>
                          <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                            {errors.submit}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                Back
              </Button>
              
              {step < 4 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                
                {/* Project Details */}
                {projectData && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-medium text-sm mb-1">{projectData.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {projectData.serviceType} • {projectData.location}
                    </div>
                  </div>
                )}

                {/* Cart Items */}
                <div className="space-y-3 mb-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.professional.businessName}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.projectData.serviceType}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">${item.estimatedPrice.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Pricing */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (12%)</span>
                    <span>${fees.vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction Fee (5%)</span>
                    <span>${fees.transactionFee.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    <span>Secure & Escrow Protected</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}