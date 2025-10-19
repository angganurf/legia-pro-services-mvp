import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { order, orderTerm, project, professional, user } from "@/db/schema/marketplace";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { paymentGateway, calculateFees } from "@/lib/payment-gateways";

const CreateOrderSchema = z.object({
  items: z.array(z.object({
    professionalId: z.string(),
    estimatedPrice: z.number(),
    notes: z.string().optional(),
  })),
  projectData: z.object({
    title: z.string(),
    serviceType: z.string(),
    landArea: z.number().optional(),
    description: z.string(),
    location: z.string(),
    budget: z.number(),
    style: z.string().optional(),
    schedule: z.string().optional(),
  }),
  customerInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  projectNotes: z.string().optional(),
  startDate: z.string(),
  urgency: z.enum(["low", "normal", "high"]),
  paymentTerms: z.array(z.object({
    description: z.string(),
    amount: z.number(),
    dueDate: z.date().optional(),
  })),
  paymentMethod: z.enum(["full", "installments"]),
  paymentProvider: z.string(),
  subtotal: z.number(),
  fees: z.object({
    vat: z.number(),
    transactionFee: z.number(),
    total: z.number(),
  }),
  total: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CreateOrderSchema.parse(body);

    // Start database transaction
    const result = await db.transaction(async (tx) => {
      // Create project record
      const [newProject] = await tx.insert(project)
        .values({
          userId: session.user.id,
          title: validatedData.projectData.title,
          serviceType: validatedData.projectData.serviceType,
          landArea: validatedData.projectData.landArea,
          description: validatedData.projectData.description,
          location: validatedData.projectData.location,
          budget: validatedData.projectData.budget.toString(),
          style: validatedData.projectData.style,
          schedule: validatedData.projectData.schedule,
          status: "published",
          updatedAt: new Date(),
        })
        .returning();

      let orderTotal = 0;
      const createdOrders = [];

      // Create orders for each professional
      for (const item of validatedData.items) {
        orderTotal += item.estimatedPrice;
        
        const fees = calculateFees(item.estimatedPrice);
        const orderTotalWithFees = fees.total;

        // Create order
        const [newOrder] = await tx.insert(order)
          .values({
            projectId: newProject.id,
            clientId: session.user.id,
            professionalId: item.professionalId,
            totalAmount: orderTotalWithFees.toString(),
            vatAmount: fees.vat.toString(),
            transactionFee: fees.transactionFee.toString(),
            paymentStatus: "pending",
            orderStatus: "pending",
            paymentTerms: JSON.stringify(validatedData.paymentTerms.filter(
              term => term.amount <= item.estimatedPrice
            )),
            address: `${validatedData.customerInfo.address}, ${validatedData.customerInfo.city}, ${validatedData.customerInfo.postalCode}, ${validatedData.customerInfo.country}`,
            clientNotes: item.notes,
            updatedAt: new Date(),
          })
          .returning();

        // Create order terms
        const termsForOrder = validatedData.paymentTerms.filter(
          term => term.amount <= item.estimatedPrice
        );

        for (const term of termsForOrder) {
          await tx.insert(orderTerm)
            .values({
              orderId: newOrder.id,
              termNumber: termsForOrder.indexOf(term) + 1,
              description: term.description,
              amount: term.amount.toString(),
              dueDate: term.dueDate,
              status: "pending",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
        }

        createdOrders.push(newOrder);
      }

      return { project: newProject, orders: createdOrders };
    });

    // Initiate payment with selected provider
    let paymentUrl = null;
    let paymentIntentId = null;

    try {
      const provider = paymentGateway.getProvider(validatedData.paymentProvider);
      
      // For multiple professionals, create a single payment for the total
      const paymentIntent = await provider.createPaymentIntent({
        amount: validatedData.total,
        currency: "IDR", // Default to Indonesian Rupiah
        customerEmail: validatedData.customerInfo.email,
        customerName: `${validatedData.customerInfo.firstName} ${validatedData.customerInfo.lastName}`,
        orderId: result.orders.map(order => order.id).join("-"), // Composite order ID
        description: `Payment for ${validatedData.projectData.title} - ${result.orders.length} professional(s)`,
        metadata: {
          orderIds: result.orders.map(order => order.id),
          projectId: result.project.id,
          userId: session.user.id,
        },
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`,
      });

      paymentIntentId = paymentIntent.id;
      paymentUrl = paymentIntent.redirectUrl;

      // Update orders with payment intent ID
      for (const order of result.orders) {
        await db.update(order)
          .set({ paymentIntentId: paymentIntentId })
          .where(eq(order.id, order.id));
      }

    } catch (paymentError) {
      console.error("Payment creation error:", paymentError);
      // Continue even if payment fails - user can retry later
    }

    // TODO: Send notifications to professionals
    // This would typically involve sending emails or push notifications
    console.log(`Notifications sent to ${result.orders.length} professionals`);

    return NextResponse.json({
      success: true,
      orderId: result.orders[0]?.id, // Primary order ID
      orderIds: result.orders.map(order => order.id),
      projectId: result.project.id,
      paymentUrl,
      paymentIntentId,
      total: validatedData.total,
      message: "Order created successfully",
    });

  } catch (error) {
    console.error("Order creation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid order data",
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create order",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = db
      .select({
        id: order.id,
        totalAmount: order.totalAmount,
        vatAmount: order.vatAmount,
        transactionFee: order.transactionFee,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        project: {
          title: project.title,
          serviceType: project.serviceType,
          location: project.location,
        },
        professional: {
          businessName: professional.businessName,
          averageRating: professional.averageRating,
        },
      })
      .from(order)
      .leftJoin(project, eq(order.projectId, project.id))
      .leftJoin(professional, eq(order.professionalId, professional.id))
      .where(eq(order.clientId, session.user.id));

    if (status) {
      query = query.where(eq(order.orderStatus, status));
    }

    const orders = await query
      .orderBy(order.createdAt)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
    });

  } catch (error) {
    console.error("Order fetch error:", error);

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch orders",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}