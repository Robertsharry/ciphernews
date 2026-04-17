import Link from "next/link";
import { SignUpForm } from "./sign-up-form";

export const metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← ciphernews
      </Link>
      <h1 className="mt-8 text-3xl font-semibold">Create an account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        One free report a day. Pay when you want the rest.
      </p>
      <SignUpForm />
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-foreground underline">
          Sign in
        </Link>
        .
      </p>
    </div>
  );
}
