import { getRequestProfile } from "@/lib/auth-server";

export async function GET(request) {
  const profile = await getRequestProfile(request);
  if (!profile.user) {
    return Response.json({ error: "sign in required" }, { status: 401 });
  }

  return Response.json({
    plan: profile.plan,
    email: profile.user.email,
    userId: profile.user.id,
  });
}