import "./globals.css";
import type { Metadata } from "next";
import { Inter, Lato, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/layout/sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-body",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Ahilyanagar District Dashboard",
  description:
    "Comprehensive livestock, dairy, infrastructure and funding analytics for Ahilyanagar District",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${lato.variable} ${playfair.variable} font-body antialiased`}
      >
        <div className="flex h-screen overflow-hidden bg-bg-light">
          {/* Desktop sidebar */}
          <Sidebar />

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
