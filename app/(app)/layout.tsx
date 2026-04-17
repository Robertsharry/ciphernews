import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getCurrentSession, isSubscribed } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const { user, profile } = await getCurrentSession();
  if (!user) redirect("/sign-in");

  // Send users without a city through onboarding first.
  if (profile && !profile.city) redirect("/onboarding");

  const subscribed = isSubscribed(profile);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="font-semibold">
            ciphernews
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="hover:underline">
              Today
            </Link>
            <Link href="/archive" className="hover:underline">
              Archive
            </Link>
            <Link href="/forum" className="hover:underline">
              Forum
            </Link>
            <Link href="/settings" className="hover:underline">
              Settings
            </Link>
            {!subscribed && (
              <Link
                href="/billing"
                className="rounded-md bg-foreground px-3 py-1 text-background hover:opacity-90"
              >
                Subscribe
              </Link>
            )}
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
