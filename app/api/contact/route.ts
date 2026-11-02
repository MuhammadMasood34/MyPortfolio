import { NextRequest, NextResponse } from "next/server";
import { sendContactNotification } from "@/lib/mailer";

export const runtime = "nodejs";

// Simple in-memory rate limiting (Note: resets on serverless cold starts)
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5;

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Clean up expired entry
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // 1. IP extraction & Rate limiting
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : req.headers.get("x-real-ip") || "unknown";

    if (ip !== "unknown" && isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 2. Parse body safely
    let body: {
      name?: unknown;
      email?: unknown;
      message?: unknown;
      honeypot?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body." },
        { status: 400 }
      );
    }

    const { name, email, message, honeypot } = body;

    // 3. Honeypot check (bot prevention)
    if (honeypot && typeof honeypot === "string" && honeypot.trim() !== "") {
      // Silently discard and return generic success without sending email
      return NextResponse.json(
        { success: true, message: "Message sent successfully!" },
        { status: 200 }
      );
    }

    // 4. Server-side validation
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        { error: "All fields are required and must be valid text." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2 || trimmedName.length > 80) {
      return NextResponse.json(
        { error: "Name must be between 2 and 80 characters." },
        { status: 400 }
      );
    }

    // Email format and length (RFC max length is 254)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (trimmedEmail.length > 254 || !emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address (up to 254 characters)." },
        { status: 400 }
      );
    }

    if (trimmedMessage.length < 10 || trimmedMessage.length > 2000) {
      return NextResponse.json(
        { error: "Message must be between 10 and 2000 characters." },
        { status: 400 }
      );
    }

    // 5. Send Email directly to muhammadmasood2433@gmail.com
    const mailResult = await sendContactNotification({
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
    });

    if (mailResult.success) {
      return NextResponse.json(
        {
          success: true,
          message: "Thank you! Your message has been sent successfully.",
        },
        { status: 200 }
      );
    }

    console.error("[Contact API] Mail delivery failed:", mailResult.reason);
    return NextResponse.json(
      {
        error:
          "Unable to deliver your email at this time. Please try again later or reach out directly.",
      },
      { status: 500 }
    );
  } catch (error) {
    console.error(
      "Error processing contact submission:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
