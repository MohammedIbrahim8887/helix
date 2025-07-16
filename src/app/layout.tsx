import { Providers } from "@/utils/providers";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeSwitcher } from "@/components/toggles/theme-switch";
import { Manrope } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/layout/common/navbar";

const manrope = Manrope({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Helix",
  description:
    "Give words to your images, turn them into stories, and share them with the world",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased relative ${manrope.className}`}>
        <Providers>
          <Navbar />
          <div className="mt-32">{children}</div>
          <Toaster />
          <div className="fixed bottom-10 right-10">
            <ThemeSwitcher />
          </div>
        </Providers>
      </body>
    </html>
  );
}
