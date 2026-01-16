import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  try {


    return NextResponse.json({
      success: true,
      data: {
        hasDbUrl: !!process.env.DATABASE_URL,
        dbUrlStart: process.env.DATABASE_URL || 'MISSING',
        nodeEnv: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch env"
    }, { status: 500 });
  }
}