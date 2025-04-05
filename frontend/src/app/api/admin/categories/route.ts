import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();
  const access_token = cookieStore.get("access_token");

  if (!access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/admin-panel/categories/`;
    console.log(`Fetching categories from: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${access_token.value}`
      },
      cache: "no-store"
    });

    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }

      console.error(`Failed to fetch categories: ${errorMessage}`);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();

    const categories = Array.isArray(data) ? data : data.results || [];

    interface CategoryResponse {
      id: number;
      name?: string;
      description?: string;
      image?: string | null;
      product_count?: number;
    }

    const validatedCategories = categories.map(
      (category: CategoryResponse) => ({
        id: category.id,
        name: category.name || "Unnamed Category",
        description: category.description || "",
        image: category.image || null,
        product_count: category.product_count || 0
      })
    );

    return NextResponse.json(validatedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.stack : undefined
      },
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
    console.log(
      "Creating category with data:",
      Object.fromEntries(formData.entries())
    );

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
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = JSON.stringify(errorData) || errorMessage;
      } catch (parseError) {
        console.error("Error parsing error response:", parseError);
      }

      console.error(`Failed to create category: ${errorMessage}`);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
