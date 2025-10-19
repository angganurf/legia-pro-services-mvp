"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  ArrowRight, 
  Home,
  Clock,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentId = searchParams.get("payment_id");
      const orderId = searchParams.get("order_id");
      
      if (!paymentId || !orderId) {
        router.push("/");
        return;
      }

      try {
        // Verify payment status with backend
        const response = await fetch(`/api/payments/verify?payment_id=${paymentId}&order_id=${orderId}`);
        const data = await response.json();

        if (data.success) {
          setOrderData(data.order);
        } else {
          // Handle payment verification failure
          router.push("/payment/failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        router.push("/payment/failed");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Verifying Payment...</h2>
          <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-green-900 mb-2">
              Payment Successful!
            </h1>
            
            <p className="text-lg text-green-700">
              Your project has been created and professionals have been notified.
            </p>
          </div>

          {/* Order Details */}
          {orderData && (
            <Card className="p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Order Details</h2>
                  <p className="text-muted-foreground">
                    Order ID: #{orderData.id}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(orderData.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  Payment Confirmed
                </Badge>
              </div>

              {/* Project Information */}
              {orderData.project && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-semibold mb-2">Project Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Project:</span>
                      <p className="font-medium">{orderData.project.title}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Service Type:</span>
                      <p className="font-medium">{orderData.project.serviceType}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <p className="font-medium">{orderData.project.location}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p className="font-medium">
                        <Badge variant="secondary">Pending Professional Acceptance</Badge>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Information */}
              {orderData.professional && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Professional</h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {orderData.professional.businessName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{orderData.professional.businessName}</p>
                      <p className="text-sm text-muted-foreground">
                        Rating: {orderData.professional.averageRating}★
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">What Happens Next?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-medium mb-2">Notification Sent</h4>
                    <p className="text-sm text-muted-foreground">
                      Professional has been notified of your project
                    </p>
                  </div>
                  
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-medium mb-2">Review & Accept</h4>
                    <p className="text-sm text-muted-foreground">
                      Professional will review and accept your project within 24-48 hours
                    </p>
                  </div>
                  
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-medium mb-2">Get Started</h4>
                    <p className="text-sm text-muted-foreground">
                      Once accepted, you can communicate and start the project
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => router.push("/dashboard")}
              className="flex-1"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Support Information */}
          <Card className="p-6 mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our support team is here to help you with any questions about your order.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Support
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}