"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  XCircle, 
  ArrowLeft, 
  Home,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentCancelledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card className="p-8 text-center">
          {/* Cancelled Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-red-900 mb-2">
            Payment Cancelled
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Your payment was cancelled. No charges were made to your account.
          </p>

          {/* Information */}
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  What happens now?
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Your order has been saved but not yet confirmed. You can try payment again 
                  or contact support if you encountered any issues.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => router.back()}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Payment Again
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push("/checkout")}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Checkout
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </div>

          {/* Support */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Need help? We're here to assist you.
            </p>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}