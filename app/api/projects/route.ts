import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { project } from "@/db/schema/marketplace";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { eq } from "drizzle-orm";

const CreateProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  serviceType: z.string().min(1, "Service type is required"),
  landArea: z.number().positive().optional(),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  budget: z.number().positive("Budget must be positive"),
  style: z.string().optional(),
  schedule: z.string().optional(),
  aiGeneratedContent: z.object({
    projectOutline: z.object({
      title: z.string(),
      description: z.string(),
      keyFeatures: z.array(z.string()),
      estimatedTimeline: z.string(),
      recommendations: z.array(z.string()),
    }),
    roomSuggestions: z.array(z.object({
      roomType: z.string(),
      description: z.string(),
      estimatedSize: z.string(),
      keyFeatures: z.array(z.string()),
    })),
    budgetBreakdown: z.object({
      design: z.number(),
      materials: z.number(),
      labor: z.number(),
      contingency: z.number(),
    }),
  }).optional(),
  aiGeneratedImages: z.array(z.string()).optional(),
  userInputs: z.object({
    originalMessage: z.string(),
    extractedInfo: z.any(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
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
    const validatedData = CreateProjectSchema.parse(body);

    // Create the project
    const [newProject] = await db.insert(project)
      .values({
        userId: session.user.id,
        title: validatedData.title,
        serviceType: validatedData.serviceType,
        landArea: validatedData.landArea,
        description: validatedData.description,
        location: validatedData.location,
        budget: validatedData.budget.toString(),
        style: validatedData.style,
        schedule: validatedData.schedule,
        aiGeneratedContent: validatedData.aiGeneratedContent,
        aiGeneratedImages: validatedData.aiGeneratedImages || [],
        userInputs: validatedData.userInputs,
        status: "draft",
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      project: newProject,
      message: "Project created successfully"
    });

  } catch (error) {
    console.error("Project creation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid project data",
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
        error: "Failed to create project",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user's projects
    const userProjects = await db.select()
      .from(project)
      .where(eq(project.userId, session.user.id))
      .orderBy(project.updatedAt);

    return NextResponse.json({
      success: true,
      projects: userProjects,
      count: userProjects.length
    });

  } catch (error) {
    console.error("Project fetch error:", error);

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch projects",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}