import type { Metadata } from "next";
import { Bitter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { GlobalNav } from "../components/global-nav";

const bitter = Bitter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChatBro",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bitter.className} antialiased`}>
        <ThemeProvider>
          <GlobalNav />
          <main className="min-h-screen">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
