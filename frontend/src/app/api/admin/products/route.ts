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
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin-panel/products/`,
      {
        headers: {
          Authorization: `Bearer ${access_token.value}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching products:", error);
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
    
    // Basic validation to ensure required fields exist
    const name = formData.get('name');
    const price = formData.get('price');
    
    if (!name) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }
    
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin-panel/products/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token.value}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      // Handle different types of error responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error || JSON.stringify(errorData));
      } else {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}
