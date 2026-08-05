import { brand, type PolicySection } from "@linq/site-config";
import Link from "next/link";

export function PolicyPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: PolicySection[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 pt-28 pb-20 md:px-8">
      <p className="text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
        Help
      </p>
      <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight text-ink md:text-6xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-mute">{intro}</p>

      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              {section.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-mute">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-14 border-t border-line pt-8">
        <p className="text-sm text-mute">
          Need help? Email{" "}
          <a
            href={`mailto:${brand.supportEmail}`}
            className="text-ink underline"
          >
            {brand.supportEmail}
          </a>{" "}
          or{" "}
          <Link href="/contact" className="text-ink underline">
            submit a query
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
