"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/utils";
import { signIn, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function register(prevState: { error: string } | null | undefined, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  if (!email.includes("@")) {
    return { error: "Invalid email format" };
  }

  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return { error: "Email already registered" };
  }

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({ name, email, passwordHash });

  redirect("/login");
}

export async function login(prevState: { error: string } | null | undefined, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error as { digest?: string }).digest?.includes("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return { error: "Invalid email or password" };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
