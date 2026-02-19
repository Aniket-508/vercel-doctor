import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
  return NextResponse.json({ ok: true });
}
