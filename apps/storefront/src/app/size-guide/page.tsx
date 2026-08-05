import type { Metadata } from "next";
import Link from "next/link";
import { fetchPoliciesSettings } from "@/base/policies";
import { fetchSeoSettings, seoToPageMetadata } from "@/base/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [seo, policies] = await Promise.all([
    fetchSeoSettings(),
    fetchPoliciesSettings(),
  ]);
  return seoToPageMetadata(seo, {
    title: policies.sizeGuide.title,
    description: policies.sizeGuide.intro,
    path: "/size-guide",
  });
}

export default async function SizeGuidePage() {
  const policies = await fetchPoliciesSettings();
  const sizeGuide = policies.sizeGuide;

  return (
    <div className="mx-auto max-w-3xl px-5 pt-28 pb-20 md:px-8">
      <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
        Help
      </p>
      <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight text-ink md:text-6xl">
        {sizeGuide.title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-mute">{sizeGuide.intro}</p>

      <div className="mt-10 overflow-x-auto border border-line">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-[11px] tracking-[0.12em] uppercase text-mute">
            <tr>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Chest</th>
              <th className="px-4 py-3 font-medium">Length</th>
              <th className="px-4 py-3 font-medium">Shoulder</th>
            </tr>
          </thead>
          <tbody>
            {sizeGuide.rows.map((row) => (
              <tr key={row.size} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">{row.size}</td>
                <td className="px-4 py-3 text-mute">{row.chest}</td>
                <td className="px-4 py-3 text-mute">{row.length}</td>
                <td className="px-4 py-3 text-mute">{row.shoulder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-mute">{sizeGuide.note}</p>
      <p className="mt-10 text-sm text-mute">
        Still unsure?{" "}
        <Link href="/contact" className="text-ink underline">
          Ask us
        </Link>
        .
      </p>
    </div>
  );
}
