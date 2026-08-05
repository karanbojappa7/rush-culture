import type { Metadata } from "next";
import { Figtree, Syne } from "next/font/google";
import { brand } from "@linq/site-config";
import { CartProvider } from "@/components/cart-provider";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeBootstrap } from "@/components/theme/theme-bootstrap";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { fetchCollections } from "@/lib/catalog";
import { fetchSeoSettings, seoToRootMetadata } from "@/lib/seo";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSeoSettings();
  return seoToRootMetadata(settings);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collections, seo] = await Promise.all([
    fetchCollections(),
    fetchSeoSettings(),
  ]);
  const collectionLinks = collections.map((collection) => ({
    href: `/collections/${collection.slug}`,
    label: collection.name,
  }));

  return (
    <html
      lang={seo.locale.split("-")[0] || "en"}
      data-theme={brand.themeId}
      data-scroll-behavior="smooth"
      className={`${syne.variable} ${figtree.variable} h-full`}
    >
      <head>
        <ThemeBootstrap />
        <OrganizationJsonLd settings={seo} />
      </head>
      <body className="flex min-h-full flex-col font-sans antialiased">
        <ThemeProvider>
          <CartProvider>
            <SiteHeader collectionLinks={collectionLinks} />
            <main className="flex-1">{children}</main>
            <SiteFooter collections={collections} />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
