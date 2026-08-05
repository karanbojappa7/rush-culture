import Image from "next/image";
import Link from "next/link";
import { brand } from "@linq/site-config";

export function Hero() {
  const nameParts = brand.name.split(" ");

  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-mist">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2400&q=80"
          alt={`${brand.name} campaign look`}
          fill
          priority
          className="animate-drift object-cover object-[center_20%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/60 to-paper/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-paper/85 via-paper/25 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-5 pb-16 pt-28 md:justify-center md:px-8 md:pb-24 md:pt-20">
        <p className="animate-rise font-display text-[clamp(3.25rem,12vw,8.75rem)] leading-[0.88] font-extrabold tracking-[-0.045em] text-ink">
          {nameParts.map((part, index) => (
            <span key={part} className="block md:inline">
              {part}
              {index < nameParts.length - 1 ? (
                <span className="hidden md:inline"> </span>
              ) : null}
            </span>
          ))}
        </p>
        <div className="animate-draw mt-3 h-[3px] w-28 bg-volt md:w-40" />
        <h1 className="animate-rise-delay mt-6 max-w-xl font-display text-3xl leading-tight font-bold tracking-tight text-ink md:text-5xl">
          {brand.tagline}
        </h1>
        <p className="animate-rise-delay-2 mt-4 max-w-md text-base leading-relaxed text-mute md:text-lg">
          {brand.shortDescription}
        </p>
        <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
          <Link href="/shop" className="btn-primary">
            Shop now
          </Link>
          <Link href="/collections/drops" className="btn-secondary">
            New drops
          </Link>
        </div>
      </div>
    </section>
  );
}
