import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { order, orderTerm } from "@/db/schema/marketplace";
import { eq } from "drizzle-orm";
import { paymentGateway } from "@/lib/payment-gateways";
import { headers } from "next/headers";

// Xendit Webhook Handler
export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const body = await request.text();

    // Determine which provider sent the webhook
    const xenditToken = headersList.get("x-callback-token");
    const midtransSignature = headersList.get("x-signature-key");
    
    let webhookEvent;
    let provider;

    if (xenditToken) {
      // Xendit webhook
      provider = paymentGateway.getProvider("xendit");
      webhookEvent = await provider.verifyWebhook(headersList, body);
    } else if (midtransSignature) {
      // Midtrans webhook
      provider = paymentGateway.getProvider("midtrans");
      webhookEvent = await provider.verifyWebhook(headersList, body);
    } else {
      return NextResponse.json(
        { error: "Unknown webhook provider" },
        { status: 400 }
      );
    }

    console.log("Webhook received:", webhookEvent);

    // Process the webhook event
    await processWebhookEvent(webhookEvent, provider.name);

    return NextResponse.json({ 
      success: true, 
      message: "Webhook processed successfully" 
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to process webhook",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

async function processWebhookEvent(event: any, providerName: string) {
  const webhookData = event.data;
  
  if (providerName === "xendit") {
    await processXenditWebhook(webhookData);
  } else if (providerName === "midtrans") {
    await processMidtransWebhook(webhookData);
  }
}

async function processXenditWebhook(data: any) {
  const { status, external_id, payment_method, paid_at } = data;

  if (status === "PAID") {
    // Find order(s) by payment intent ID or external ID
    const orders = await db
      .select()
      .from(order)
      .where(eq(order.paymentIntentId, external_id));

    for (const orderRecord of orders) {
      await db.update(order)
        .set({
          paymentStatus: "paid",
          orderStatus: "accepted", // Move to accepted when payment is confirmed
          updatedAt: new Date(),
        })
        .where(eq(order.id, orderRecord.id));

      // TODO: Send notifications to client and professional
      console.log(`Payment confirmed for order ${orderRecord.id}`);
    }
  } else if (status === "EXPIRED" || status === "FAILED") {
    // Handle payment failure
    const orders = await db
      .select()
      .from(order)
      .where(eq(order.paymentIntentId, external_id));

    for (const orderRecord of orders) {
      await db.update(order)
        .set({
          paymentStatus: "failed",
          updatedAt: new Date(),
        })
        .where(eq(order.id, orderRecord.id));

      // TODO: Send failure notifications
      console.log(`Payment failed for order ${orderRecord.id}`);
    }
  }
}

async function processMidtransWebhook(data: any) {
  const { transaction_status, order_id, payment_type, transaction_time } = data;

  if (transaction_status === "settlement" || transaction_status === "capture") {
    // Payment successful
    const orderIds = order_id.split("-"); // Handle composite order IDs
    
    for (const orderId of orderIds) {
      await db.update(order)
        .set({
          paymentStatus: "paid",
          orderStatus: "accepted",
          updatedAt: new Date(),
        })
        .where(eq(order.id, parseInt(orderId)));

      console.log(`Midtrans payment confirmed for order ${orderId}`);
    }
  } else if (transaction_status === "deny" || transaction_status === "expire" || transaction_status === "cancel") {
    // Payment failed
    const orderIds = order_id.split("-");
    
    for (const orderId of orderIds) {
      await db.update(order)
        .set({
          paymentStatus: "failed",
          updatedAt: new Date(),
        })
        .where(eq(order.id, parseInt(orderId)));

      console.log(`Midtrans payment failed for order ${orderId}`);
    }
  }
}

// Webhook verification utilities
export async function GET(request: NextRequest) {
  // Simple health check endpoint for webhooks
  return NextResponse.json({
    status: "webhook endpoint active",
    providers: paymentGateway.getAvailableProviders(),
  });
}