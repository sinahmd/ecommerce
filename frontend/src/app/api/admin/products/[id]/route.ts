import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const access_token = cookieStore.get("access_token");

  if (!access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin-panel/products/${params.id}/`,
      {
        headers: {
          Authorization: `Bearer ${access_token.value}`
        }
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch product");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const access_token = cookieStore.get("access_token");

  if (!access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin-panel/products/${params.id}/`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${access_token.value}`
        },
        body: formData
      }
    );

    if (!response.ok) {
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
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const access_token = cookieStore.get("access_token");

  if (!access_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin-panel/products/${params.id}/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${access_token.value}`
        }
      }
    );

    if (!response.ok) {
      // Try to parse error if it's JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete product");
      } else {
        throw new Error(`Failed to delete product: ${response.status}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error"
      },
      { status: 500 }
    );
  }
}
