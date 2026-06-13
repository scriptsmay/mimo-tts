import { NextResponse } from "next/server";

export async function GET() {
  const hasKey = !!process.env.MIMO_API_KEY;
  const hasUrl = !!process.env.MIMO_BASE_URL;

  return NextResponse.json({
    ready: hasKey && hasUrl,
    provider: hasUrl ? new URL(process.env.MIMO_BASE_URL!).hostname : null,
  });
}
