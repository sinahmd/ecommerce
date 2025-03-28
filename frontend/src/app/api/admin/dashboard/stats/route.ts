import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/dashboard/stats/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      credentials: "include",
      cache: "no-store"
    });

    if (!response.ok) {
      console.error("API Error:", await response.text());
      throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
