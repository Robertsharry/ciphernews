import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentSession } from "@/lib/auth/session";
import { OnboardingForm } from "./onboarding-form";

export const metadata = { title: "Get set up" };

export default async function OnboardingPage() {
  const { user, profile } = await getCurrentSession();
  if (!user) redirect("/sign-in");
  if (profile?.city) redirect("/dashboard");

  // Seed default city from Vercel geo headers (best-effort).
  const h = await headers();
  const cityHint = h.get("x-vercel-ip-city") ?? "";
  const regionHint = h.get("x-vercel-ip-country-region") ?? "";
  const countryHint = h.get("x-vercel-ip-country") ?? "";

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-semibold">Where are you?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We use this to pick your local news. Change it anytime in Settings.
      </p>
      <OnboardingForm
        defaults={{ city: cityHint, region: regionHint, country: countryHint }}
      />
    </div>
  );
}
