import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token")?.value;

  // No authentication available
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/api/dashboard/top-products/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });

    if (!response.ok) {
      console.error("API Error:", await response.text());
      throw new Error(`Failed to fetch top products: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching top products:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
