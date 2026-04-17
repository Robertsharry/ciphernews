import Link from "next/link";
import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← ciphernews
      </Link>
      <h1 className="mt-8 text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Reports are waiting. Get in.
      </p>
      <SignInForm />
      <p className="mt-6 text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/sign-up" className="text-foreground underline">
          Create an account
        </Link>
        .
      </p>
    </div>
  );
}
