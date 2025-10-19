import { pgTable, text, timestamp, integer, decimal, json, boolean, serial } from "drizzle-orm/pg-core";

export const project = pgTable("project", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  serviceType: text("service_type").notNull(),
  landArea: integer("land_area"), // in square meters
  description: text("description").notNull(),
  location: text("location").notNull(),
  budget: decimal("budget", { precision: 12, scale: 2 }).notNull(),
  style: text("style"),
  schedule: text("schedule"),
  aiGeneratedContent: json("ai_generated_content"), // AI-generated project outlines
  aiGeneratedImages: json("ai_generated_images"), // Array of AI-generated image URLs
  userInputs: json("user_inputs"), // Original user conversation data
  status: text("status").default("draft").notNull(), // draft, published, in_progress, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const professional = pgTable("professional", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  businessName: text("business_name").notNull(),
  serviceCategories: json("service_categories").notNull(), // Array of service categories
  description: text("description"),
  location: text("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").default(0),
  portfolioImages: json("portfolio_images"), // Array of portfolio image URLs
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  minimumBudget: decimal("minimum_budget", { precision: 12, scale: 2 }),
  maximumBudget: decimal("maximum_budget", { precision: 12, scale: 2 }),
  availability: text("availability").default("available"), // available, busy, unavailable
  kycStatus: text("kyc_status").default("pending"), // pending, verified, rejected
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const order = pgTable("order", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => project.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  professionalId: text("professional_id").notNull().references(() => professional.id, { onDelete: "cascade" }),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  vatAmount: decimal("vat_amount", { precision: 12, scale: 2 }).notNull(),
  transactionFee: decimal("transaction_fee", { precision: 12, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").default("pending").notNull(), // pending, paid, released, refunded
  orderStatus: text("order_status").default("pending").notNull(), // pending, accepted, rejected, in_progress, completed, cancelled
  paymentTerms: json("payment_terms"), // Payment term schedule
  contractDocuments: json("contract_documents"), // RAB/PKS document references
  address: text("address").notNull(),
  clientNotes: text("client_notes"),
  professionalNotes: text("professional_notes"),
  adminNotes: text("admin_notes"),
  paymentIntentId: text("payment_intent_id"),
  escrowReleasedAt: timestamp("escrow_released_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderTerm = pgTable("order_term", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => order.id, { onDelete: "cascade" }),
  termNumber: integer("term_number").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").default("pending").notNull(), // pending, submitted, approved, rejected
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  deliverables: json("deliverables"), // Array of deliverable descriptions and file references
  clientApproval: boolean("client_approval").default(false),
  professionalNotes: text("professional_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const chatMessage = pgTable("chat_message", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => order.id, { onDelete: "cascade" }),
  senderId: text("sender_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  messageType: text("message_type").default("text").notNull(), // text, file, image
  fileUrl: text("file_url"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cartItem = pgTable("cart_item", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  projectId: integer("project_id").notNull().references(() => project.id, { onDelete: "cascade" }),
  professionalId: text("professional_id").notNull().references(() => professional.id, { onDelete: "cascade" }),
  estimatedPrice: decimal("estimated_price", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRole = pgTable("user_role", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // client, professional, admin
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

// Import user from auth schema
import { user } from "./auth";