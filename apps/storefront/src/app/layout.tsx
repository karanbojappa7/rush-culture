import type { Metadata } from "next";
import { Figtree, Syne } from "next/font/google";
import { brand } from "@linq/site-config";
import { CartProvider } from "@/components/cart-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { fetchCollections } from "@/lib/catalog";
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

export const metadata: Metadata = {
  title: {
    default: brand.meta.titleDefault,
    template: brand.meta.titleTemplate,
  },
  description: brand.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const collections = await fetchCollections();
  const collectionLinks = collections.map((collection) => ({
    href: `/collections/${collection.slug}`,
    label: collection.name,
  }));

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${syne.variable} ${figtree.variable} h-full`}
    >
      <body className="flex min-h-full flex-col font-sans antialiased">
        <CartProvider>
          <SiteHeader collectionLinks={collectionLinks} />
          <main className="flex-1">{children}</main>
          <SiteFooter collections={collections} />
        </CartProvider>
      </body>
    </html>
  );
}
