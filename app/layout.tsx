import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ciphernews",
    template: "%s · ciphernews",
  },
  description:
    "Ten to twelve stories every six hours. No sides. Just what happened.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        <Suspense fallback={<PageFallback />}>{children}</Suspense>
      </body>
    </html>
  );
}

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
