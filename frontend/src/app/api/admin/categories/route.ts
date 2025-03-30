import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();
  const access_token = cookieStore.get("access_token");

  if (!access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin-panel/categories/`,
      {
        headers: {
          Authorization: `Bearer ${access_token.value}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const access_token = cookieStore.get("access_token");

  if (!access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin-panel/categories/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token.value}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create category");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}
