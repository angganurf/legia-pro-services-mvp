import { NextRequest, NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";

// Define the project data schema
const ProjectDataSchema = z.object({
  title: z.string().min(1),
  serviceType: z.string().min(1),
  landArea: z.number().optional(),
  description: z.string().min(1),
  location: z.string().min(1),
  budget: z.number().min(0),
  style: z.string().optional(),
  schedule: z.string().optional(),
});

// Define the AI response schema
const AIResponseSchema = z.object({
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
  imagePrompts: z.array(z.string()),
  budgetBreakdown: z.object({
    design: z.number(),
    materials: z.number(),
    labor: z.number(),
    contingency: z.number(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the input
    const { messages, conversationHistory } = z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })),
      conversationHistory: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).optional(),
    }).parse(body);

    // Extract user inputs from the conversation
    const userMessages = messages.filter(msg => msg.role === "user");
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || "";

    // System prompt for project analysis and generation
    const systemPrompt = `You are an AI assistant for Legia, a professional services marketplace for architecture, interior design, and construction services. 

Your task is to:
1. Analyze the user's requirements from their message
2. Extract key project information
3. Generate structured project data
4. Create image prompts for visualization
5. Provide budget estimates and breakdown

You MUST respond with a valid JSON object in this exact format:
{
  "projectOutline": {
    "title": "Brief project title",
    "description": "Detailed project description",
    "keyFeatures": ["feature1", "feature2", "feature3"],
    "estimatedTimeline": "e.g., 2-3 months",
    "recommendations": ["recommendation1", "recommendation2"]
  },
  "roomSuggestions": [
    {
      "roomType": "Living Room",
      "description": "Spacious open-concept living area",
      "estimatedSize": "25-30 sqm",
      "keyFeatures": ["natural lighting", "open layout", "modern design"]
    }
  ],
  "imagePrompts": [
    "Modern minimalist living room with natural lighting, open concept design, 25sqm, professional architectural visualization",
    "Contemporary kitchen with island, white cabinets, quartz countertops, 15sqm interior design render"
  ],
  "budgetBreakdown": {
    "design": 0.15,
    "materials": 0.45,
    "labor": 0.30,
    "contingency": 0.10
  }
}

Extract information about:
- Service type (architecture, interior design, construction, renovation)
- Land/property area in square meters
- Location/address
- Budget range
- Preferred style (modern, minimalist, traditional, etc.)
- Timeline/schedule
- Special requirements

If information is missing, provide reasonable estimates and clearly label them as assumptions.`;

    // Generate AI response
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-5) // Keep last 5 messages for context
      ],
      temperature: 0.7,
      maxTokens: 1500,
    });

    // Parse the AI response
    let aiResponse;
    try {
      aiResponse = JSON.parse(text);
      aiResponse = AIResponseSchema.parse(aiResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback response if JSON parsing fails
      aiResponse = {
        projectOutline: {
          title: "Custom Project",
          description: lastUserMessage,
          keyFeatures: ["Professional Design", "Quality Materials", "Expert Execution"],
          estimatedTimeline: "2-4 weeks",
          recommendations: ["Consult with professionals", "Set clear budget", "Define timeline"]
        },
        roomSuggestions: [],
        imagePrompts: [],
        budgetBreakdown: {
          design: 0.15,
          materials: 0.45,
          labor: 0.30,
          contingency: 0.10
        }
      };
    }

    // Extract project data from AI response
    const projectData = {
      title: aiResponse.projectOutline.title,
      serviceType: extractServiceType(lastUserMessage),
      description: aiResponse.projectOutline.description,
      location: extractLocation(lastUserMessage),
      budget: extractBudget(lastUserMessage),
      style: extractStyle(lastUserMessage),
      landArea: extractLandArea(lastUserMessage),
      schedule: extractSchedule(lastUserMessage),
    };

    return NextResponse.json({
      success: true,
      aiResponse,
      projectData,
      conversationSummary: {
        lastUserMessage,
        extractedInfo: projectData,
        aiGenerated: aiResponse.projectOutline,
      }
    });

  } catch (error) {
    console.error("AI generation error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid input data",
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to generate project data",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Helper functions to extract specific information from user messages
function extractServiceType(message: string): string {
  const serviceTypes = ["architecture", "interior design", "construction", "renovation", "landscape", "furniture"];
  const lowerMessage = message.toLowerCase();
  
  for (const service of serviceTypes) {
    if (lowerMessage.includes(service)) {
      return service;
    }
  }
  
  return "general consulting";
}

function extractLocation(message: string): string {
  // Simple location extraction - in production, you'd use more sophisticated NLP
  const locationPatterns = [
    /(?:in|at|located in?)\s+([A-Za-z\s]+?)(?:,|$|\.)/i,
    /(?:address|location)[:]\s*([A-Za-z0-9\s,]+)/i,
  ];
  
  for (const pattern of locationPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return "To be determined";
}

function extractBudget(message: string): number {
  const budgetPatterns = [
    /(?:budget|price|cost)[:\s]*\$?(\d+(?:,\d+)*(?:\.\d+)?)(?:\s*(million|k|thousand))/i,
    /\$?(\d+(?:,\d+)*(?:\.\d+)?)(?:\s*(million|k|thousand))/i,
  ];
  
  for (const pattern of budgetPatterns) {
    const match = message.match(pattern);
    if (match) {
      let amount = parseFloat(match[1].replace(/,/g, ""));
      const unit = match[2]?.toLowerCase();
      
      if (unit === "million") amount *= 1000000;
      else if (unit === "k" || unit === "thousand") amount *= 1000;
      
      return amount;
    }
  }
  
  return 50000; // Default budget
}

function extractStyle(message: string): string {
  const styles = ["modern", "minimalist", "traditional", "contemporary", "industrial", "scandinavian", "rustic"];
  const lowerMessage = message.toLowerCase();
  
  for (const style of styles) {
    if (lowerMessage.includes(style)) {
      return style;
    }
  }
  
  return "modern";
}

function extractLandArea(message: string): number {
  const areaPatterns = [
    /(\d+(?:\.\d+)?)\s*(?:sqm|square meters|m²|m2)/i,
    /(\d+(?:\.\d+)?)\s*(?:sqft|square feet|ft²|ft2)/i,
  ];
  
  for (const pattern of areaPatterns) {
    const match = message.match(pattern);
    if (match) {
      let area = parseFloat(match[1]);
      // Convert sqft to sqm if needed
      if (message.toLowerCase().includes("sqft") || message.toLowerCase().includes("square feet")) {
        area *= 0.092903; // 1 sqft = 0.092903 sqm
      }
      return Math.round(area);
    }
  }
  
  return 100; // Default area in sqm
}

function extractSchedule(message: string): string {
  const schedulePatterns = [
    /(\d+(?:\.\d+)?)\s*(?:weeks?|months?)/i,
    /(?:within|in)\s+(\d+(?:\.\d+)?)\s*(?:weeks?|months?)/i,
  ];
  
  for (const pattern of schedulePatterns) {
    const match = message.match(pattern);
    if (match) {
      return `${match[1]} ${match[1] === "1" ? "week" : "weeks"}`;
    }
  }
  
  return "4-6 weeks";
}