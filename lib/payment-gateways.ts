// Payment Gateway Abstraction Layer
// Supports multiple providers: Xendit, Midtrans, Tripay

export interface PaymentProvider {
  name: string;
  createPaymentIntent: (data: PaymentData) => Promise<PaymentIntent>;
  verifyWebhook: (headers: Headers, body: string) => Promise<WebhookEvent>;
  getPaymentStatus: (paymentId: string) => Promise<PaymentStatus>;
  refundPayment: (paymentId: string, amount?: number) => Promise<RefundResult>;
}

export interface PaymentData {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  orderId: string;
  description: string;
  metadata?: Record<string, any>;
  paymentMethod?: string;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret?: string;
  redirectUrl?: string;
  qrCode?: string;
  virtualAccount?: VirtualAccount[];
  ewallet?: EWallet[];
  status: 'pending' | 'requires_action' | 'succeeded' | 'failed';
  amount: number;
  currency: string;
  expiresAt?: Date;
}

export interface VirtualAccount {
  bank: string;
  accountNumber: string;
  accountName: string;
}

export interface EWallet {
  provider: string;
  deepLink: string;
  phoneNumber?: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  processed: boolean;
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
  amount: number;
  currency: string;
  paidAt?: Date;
  failureCode?: string;
  failureMessage?: string;
}

export interface RefundResult {
  id: string;
  amount: number;
  status: 'pending' | 'succeeded' | 'failed';
  reason?: string;
}

// Xendit Implementation
class XenditProvider implements PaymentProvider {
  name = "xendit";
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createPaymentIntent(data: PaymentData): Promise<PaymentIntent> {
    try {
      // For demo purposes - in real implementation, call Xendit API
      const response = await fetch("https://api.xendit.co/v2/invoices", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(this.apiKey + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          external_id: data.orderId,
          amount: data.amount,
          description: data.description,
          payer_email: data.customerEmail,
          customer: {
            given_names: data.customerName,
            email: data.customerEmail,
          },
          success_redirect_url: data.returnUrl,
          failure_redirect_url: data.cancelUrl,
          currency: data.currency,
          fees: [
            {
              type: "FUEL",
              value: 0.05, // 5% transaction fee
            },
          ],
        }),
      });

      const invoice = await response.json();
      
      return {
        id: invoice.id,
        redirectUrl: invoice.invoice_url,
        status: "pending",
        amount: data.amount,
        currency: data.currency,
        expiresAt: new Date(invoice.expiry_date),
      };
    } catch (error) {
      console.error("Xendit payment creation error:", error);
      throw new Error("Failed to create Xendit payment");
    }
  }

  async verifyWebhook(headers: Headers, body: string): Promise<WebhookEvent> {
    const xenditToken = headers.get("x-callback-token");
    
    if (!xenditToken) {
      throw new Error("Missing Xendit webhook token");
    }

    // In production, verify the token with Xendit
    const event = JSON.parse(body);
    
    return {
      id: event.id,
      type: event.status,
      data: event,
      processed: false,
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`https://api.xendit.co/v2/invoices/${paymentId}`, {
        headers: {
          "Authorization": `Basic ${Buffer.from(this.apiKey + ":").toString("base64")}`,
        },
      });

      const invoice = await response.json();
      
      return {
        id: invoice.id,
        status: invoice.status === "PAID" ? "succeeded" : "pending",
        amount: invoice.amount,
        currency: invoice.currency,
        paidAt: invoice.paid_at ? new Date(invoice.paid_at) : undefined,
      };
    } catch (error) {
      console.error("Xendit status check error:", error);
      throw new Error("Failed to get payment status");
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    // Xendit refund implementation
    throw new Error("Refunds not implemented for Xendit yet");
  }
}

// Midtrans Implementation
class MidtransProvider implements PaymentProvider {
  name = "midtrans";
  private serverKey: string;
  private clientKey: string;

  constructor(serverKey: string, clientKey: string) {
    this.serverKey = serverKey;
    this.clientKey = clientKey;
  }

  async createPaymentIntent(data: PaymentData): Promise<PaymentIntent> {
    try {
      // For demo purposes - in real implementation, call Midtrans API
      const response = await fetch("https://api.sandbox.midtrans.com/v2/charge", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(this.serverKey + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_type: "bank_transfer",
          transaction_details: {
            order_id: data.orderId,
            gross_amount: data.amount,
          },
          customer_details: {
            first_name: data.customerName,
            email: data.customerEmail,
          },
          item_details: [
            {
              id: data.orderId,
              price: data.amount,
              quantity: 1,
              name: data.description,
            },
          ],
        }),
      });

      const charge = await response.json();
      
      return {
        id: charge.transaction_id,
        virtualAccount: [
          {
            bank: charge.va_numbers[0].bank,
            accountNumber: charge.va_numbers[0].va_number,
            accountName: data.customerName,
          },
        ],
        status: "pending",
        amount: data.amount,
        currency: data.currency,
        expiresAt: new Date(charge.expiry_time),
      };
    } catch (error) {
      console.error("Midtrans payment creation error:", error);
      throw new Error("Failed to create Midtrans payment");
    }
  }

  async verifyWebhook(headers: Headers, body: string): Promise<WebhookEvent> {
    // Midtrans webhook verification
    throw new Error("Webhook verification not implemented for Midtrans yet");
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    // Midtrans status check
    throw new Error("Status check not implemented for Midtrans yet");
  }

  async refundPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    // Midtrans refund
    throw new Error("Refunds not implemented for Midtrans yet");
  }
}

// Tripay Implementation
class TripayProvider implements PaymentProvider {
  name = "tripay";
  private apiKey: string;
  private privateKey: string;
  private merchantCode: string;

  constructor(apiKey: string, privateKey: string, merchantCode: string) {
    this.apiKey = apiKey;
    this.privateKey = privateKey;
    this.merchantCode = merchantCode;
  }

  async createPaymentIntent(data: PaymentData): Promise<PaymentIntent> {
    // Tripay implementation
    throw new Error("Tripay not implemented yet");
  }

  async verifyWebhook(headers: Headers, body: string): Promise<WebhookEvent> {
    // Tripay webhook verification
    throw new Error("Webhook verification not implemented for Tripay yet");
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    // Tripay status check
    throw new Error("Status check not implemented for Tripay yet");
  }

  async refundPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    // Tripay refund
    throw new Error("Refunds not implemented for Tripay yet");
  }
}

// Payment Gateway Factory
export class PaymentGatewayFactory {
  private providers: Map<string, PaymentProvider> = new Map();

  constructor() {
    // Initialize providers based on environment variables
    if (process.env.XENDIT_API_KEY) {
      this.providers.set("xendit", new XenditProvider(process.env.XENDIT_API_KEY));
    }
    
    if (process.env.MIDTRANS_SERVER_KEY && process.env.MIDTRANS_CLIENT_KEY) {
      this.providers.set("midtrans", new MidtransProvider(
        process.env.MIDTRANS_SERVER_KEY,
        process.env.MIDTRANS_CLIENT_KEY
      ));
    }
    
    if (process.env.TRIPAY_API_KEY && process.env.TRIPAY_PRIVATE_KEY && process.env.TRIPAY_MERCHANT_CODE) {
      this.providers.set("tripay", new TripayProvider(
        process.env.TRIPAY_API_KEY,
        process.env.TRIPAY_PRIVATE_KEY,
        process.env.TRIPAY_MERCHANT_CODE
      ));
    }
  }

  getProvider(name: string): PaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Payment provider '${name}' not found or not configured`);
    }
    return provider;
  }

  getDefaultProvider(): PaymentProvider {
    // Return first available provider
    const firstProvider = this.providers.values().next().value;
    if (!firstProvider) {
      throw new Error("No payment providers configured");
    }
    return firstProvider;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Singleton instance
export const paymentGateway = new PaymentGatewayFactory();

// Fee calculation utilities
export const calculateFees = (amount: number): { vat: number; transactionFee: number; total: number } => {
  const vat = amount * 0.12; // 12% VAT
  const transactionFee = amount * 0.05; // 5% transaction fee
  const total = amount + vat + transactionFee;
  
  return {
    vat: Math.round(vat * 100) / 100,
    transactionFee: Math.round(transactionFee * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

// Payment term utilities
export const createPaymentTerms = (
  totalAmount: number,
  terms: Array<{ description: string; percentage: number; dueDays?: number }>
): Array<{ description: string; amount: number; dueDate?: Date }> => {
  return terms.map((term) => ({
    description: term.description,
    amount: Math.round((totalAmount * term.percentage) * 100) / 100,
    dueDate: term.dueDays ? new Date(Date.now() + term.dueDays * 24 * 60 * 60 * 1000) : undefined,
  }));
};