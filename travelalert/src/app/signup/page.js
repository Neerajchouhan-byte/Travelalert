import { redirect } from "next/navigation";

export const metadata = {
  title: "Create your account | TravelRadar",
  description: "Sign up for TravelRadar and open your first destination briefing.",
};

export default async function SignupPage({ searchParams }) {
  const resolved = (await searchParams) || {};
  const city = resolved.city || "";
  const destination = resolved.redirect || "/dashboard";

  const params = new URLSearchParams({ mode: "signup" });
  if (city) params.set("city", city);
  if (destination.startsWith("/") && !destination.startsWith("//")) {
    params.set("redirect", destination);
  }

  redirect(`/login?${params.toString()}`);
}