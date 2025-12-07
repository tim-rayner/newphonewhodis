import { AppLayout } from "@/shared/layout/AppLayout";
import { TRPCProvider } from "@/shared/providers";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NewPhoneWhoDis",
  description: "Phone number management app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <TRPCProvider>
          <AppLayout> {children}</AppLayout>
        </TRPCProvider>
      </body>
    </html>
  );
}
