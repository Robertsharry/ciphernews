import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession } from "@/lib/auth/session";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { user, profile } = await getCurrentSession();
  if (!user || !profile) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <SettingsForm
        defaults={{
          city: profile.city ?? "",
          region: profile.region ?? "",
          country: profile.country ?? "",
          display_name: profile.display_name ?? "",
          clean_mode: profile.clean_mode,
        }}
      />
      <div className="mt-12 border-t border-border pt-6 text-sm">
        <Link href="/billing" className="text-muted-foreground hover:text-foreground">
          Manage billing →
        </Link>
      </div>
    </div>
  );
}
