import type { Metadata } from "next";
import { Figtree, Syne } from "next/font/google";
import { brand } from "@linq/site-config";
import { ThemeBootstrap } from "@/components/core/theme/theme-bootstrap";
import { ThemeProvider } from "@/components/core/theme/theme-provider";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: brand.meta.adminTitleDefault,
    template: brand.meta.adminTitleTemplate,
  },
  description: brand.meta.adminDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme={brand.themeId}
      className={`${syne.variable} ${figtree.variable} h-full`}
    >
      <head>
        <ThemeBootstrap />
      </head>
      <body className="min-h-full font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
