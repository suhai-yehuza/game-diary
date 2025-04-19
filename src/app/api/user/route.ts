import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Use `currentUser()` to get the Backend API User object
  const user = await currentUser();

  // Add your Route Handler's logic with the returned `user` object
  return NextResponse.json({ user: user }, { status: 200 });
}
