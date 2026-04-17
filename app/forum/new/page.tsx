import { redirect } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { getCurrentSession, isSubscribed } from "@/lib/auth/session";
import { NewThreadForm } from "./new-thread-form";

export const metadata = { title: "New thread" };

export default async function NewThreadPage() {
  await connection();
  const { user, profile } = await getCurrentSession();
  if (!user || !profile) redirect("/sign-in");
  if (!isSubscribed(profile)) redirect("/billing");

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/forum" className="text-sm text-muted-foreground hover:text-foreground">
        ← Forum
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">New thread</h1>
      <NewThreadForm />
    </div>
  );
}
