import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { professional, user } from "@/db/schema/marketplace";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { eq, and, gte, lte, or, ilike, inArray } from "drizzle-orm";

const MatchProfessionalsSchema = z.object({
  projectData: z.object({
    serviceType: z.string().min(1),
    location: z.string().min(1),
    budget: z.number().positive(),
    landArea: z.number().positive().optional(),
    style: z.string().optional(),
  }),
  limit: z.number().min(1).max(50).default(10),
  offset: z.number().min(0).default(0),
});

interface ProfessionalMatch {
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
  matchScore: number;
  matchReasons: string[];
  distance?: number;
}

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
    const { projectData, limit, offset } = MatchProfessionalsSchema.parse(body);

    // Build the matching query
    const budgetNum = projectData.budget;
    const serviceType = projectData.serviceType.toLowerCase();
    const location = projectData.location.toLowerCase();

    // Get professionals with basic filters
    const professionals = await db
      .select({
        id: professional.id,
        businessName: professional.businessName,
        description: professional.description,
        location: professional.location,
        averageRating: professional.averageRating,
        totalReviews: professional.totalReviews,
        portfolioImages: professional.portfolioImages,
        hourlyRate: professional.hourlyRate,
        minimumBudget: professional.minimumBudget,
        maximumBudget: professional.maximumBudget,
        availability: professional.availability,
        isVerified: professional.isVerified,
        serviceCategories: professional.serviceCategories,
        latitude: professional.latitude,
        longitude: professional.longitude,
        user: {
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(professional)
      .leftJoin(user, eq(professional.userId, user.id))
      .where(
        and(
          eq(professional.availability, "available"),
          eq(professional.kycStatus, "verified"),
          // Filter by service category
          or(
            ilike(professional.serviceCategories::text, `%${serviceType}%`),
            ilike(professional.businessName, `%${serviceType}%`),
            ilike(professional.description, `%${serviceType}%`)
          ),
          // Filter by budget compatibility
          or(
            lte(professional.minimumBudget, budgetNum.toString()),
            eq(professional.minimumBudget, "")
          )
        )
      )
      .limit(limit * 2) // Get more to calculate match scores
      .offset(offset);

    // Calculate match scores and filter
    const matchedProfessionals: ProfessionalMatch[] = [];

    for (const prof of professionals) {
      let score = 0;
      const reasons: string[] = [];

      // Service type matching (40% weight)
      const serviceCategories = Array.isArray(prof.serviceCategories) 
        ? prof.serviceCategories 
        : JSON.parse(prof.serviceCategories || "[]");
      
      if (serviceCategories.some(cat => 
        typeof cat === "string" && cat.toLowerCase().includes(serviceType)
      )) {
        score += 40;
        reasons.push("Service category match");
      } else if (prof.businessName.toLowerCase().includes(serviceType) ||
                 prof.description.toLowerCase().includes(serviceType)) {
        score += 25;
        reasons.push("Service keyword match");
      }

      // Budget compatibility (25% weight)
      const minBudget = prof.minimumBudget ? parseFloat(prof.minimumBudget) : 0;
      const maxBudget = prof.maximumBudget ? parseFloat(prof.maximumBudget) : Infinity;
      
      if (budgetNum >= minBudget && budgetNum <= maxBudget) {
        score += 25;
        reasons.push("Budget compatible");
      } else if (budgetNum >= minBudget) {
        score += 15;
        reasons.push("Within minimum budget");
      }

      // Location proximity (20% weight)
      if (prof.location.toLowerCase().includes(location) || 
          location.includes(prof.location.toLowerCase())) {
        score += 20;
        reasons.push("Local professional");
      } else {
        score += 5;
        reasons.push("Available in your region");
      }

      // Rating and experience (15% weight)
      const rating = parseFloat(prof.averageRating || "0");
      const reviewCount = prof.totalReviews || 0;
      
      if (rating >= 4.5 && reviewCount >= 10) {
        score += 15;
        reasons.push("Top rated professional");
      } else if (rating >= 4.0 && reviewCount >= 5) {
        score += 10;
        reasons.push("Well rated");
      } else if (rating >= 3.5) {
        score += 5;
        reasons.push("Good reputation");
      }

      // Verification bonus
      if (prof.isVerified) {
        score += 10;
        reasons.push("Verified professional");
      }

      // Only include professionals with a decent match score
      if (score >= 30) {
        matchedProfessionals.push({
          id: prof.id,
          businessName: prof.businessName,
          description: prof.description || "",
          location: prof.location,
          averageRating: prof.averageRating || "0",
          totalReviews: prof.totalReviews || 0,
          portfolioImages: Array.isArray(prof.portfolioImages) 
            ? prof.portfolioImages 
            : JSON.parse(prof.portfolioImages || "[]"),
          hourlyRate: prof.hourlyRate || "0",
          minimumBudget: prof.minimumBudget || "0",
          maximumBudget: prof.maximumBudget || "0",
          availability: prof.availability,
          isVerified: prof.isVerified,
          user: prof.user!,
          matchScore: Math.min(score, 100),
          matchReasons: reasons,
        });
      }
    }

    // Sort by match score and paginate
    matchedProfessionals.sort((a, b) => b.matchScore - a.matchScore);
    const paginatedResults = matchedProfessionals.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      professionals: paginatedResults,
      total: matchedProfessionals.length,
      hasMore: matchedProfessionals.length > offset + limit,
      filters: {
        serviceType: projectData.serviceType,
        location: projectData.location,
        budget: projectData.budget,
      },
    });

  } catch (error) {
    console.error("Professional matching error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid request data",
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
        error: "Failed to match professionals",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("serviceType");
    const location = searchParams.get("location");
    limit = parseInt(searchParams.get("limit") || "10");
    offset = parseInt(searchParams.get("offset") || "0");

    // Simple listing endpoint for browsing
    const professionals = await db
      .select({
        id: professional.id,
        businessName: professional.businessName,
        description: professional.description,
        location: professional.location,
        averageRating: professional.averageRating,
        totalReviews: professional.totalReviews,
        portfolioImages: professional.portfolioImages,
        hourlyRate: professional.hourlyRate,
        minimumBudget: professional.minimumBudget,
        maximumBudget: professional.maximumBudget,
        availability: professional.availability,
        isVerified: professional.isVerified,
        serviceCategories: professional.serviceCategories,
        user: {
          name: user.name,
          email: user.email,
          image: user.image,
        },
      })
      .from(professional)
      .leftJoin(user, eq(professional.userId, user.id))
      .where(
        and(
          eq(professional.availability, "available"),
          eq(professional.kycStatus, "verified"),
          serviceType ? ilike(professional.serviceCategories::text, `%${serviceType}%`) : undefined,
          location ? ilike(professional.location, `%${location}%`) : undefined,
        ).filter(Boolean)
      )
      .limit(limit)
      .offset(offset);

    const formattedProfessionals = professionals.map(prof => ({
      ...prof,
      portfolioImages: Array.isArray(prof.portfolioImages) 
        ? prof.portfolioImages 
        : JSON.parse(prof.portfolioImages || "[]"),
      serviceCategories: Array.isArray(prof.serviceCategories) 
        ? prof.serviceCategories 
        : JSON.parse(prof.serviceCategories || "[]"),
    }));

    return NextResponse.json({
      success: true,
      professionals: formattedProfessionals,
      total: formattedProfessionals.length,
    });

  } catch (error) {
    console.error("Professional listing error:", error);

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch professionals",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}