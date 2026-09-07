import { redirect } from "next/navigation";

export default function SignupPage({ searchParams }) {
  const city = searchParams?.city || "";
  const destination = searchParams?.redirect || "/dashboard";
  const params = new URLSearchParams({ mode: "signup" });
  if (city) params.set("city", city);
  if (destination.startsWith("/") && !destination.startsWith("//")) params.set("redirect", destination);
  redirect(`/login?${params.toString()}`);
}