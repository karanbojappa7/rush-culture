"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

type Props = {
  images: string[];
  alt: string;
};

const ZOOM = 2.5;
const LENS = 148;

export function ProductImageGallery({ images, alt }: Props) {
  const gallery = images.length > 0 ? images : [];
  const [active, setActive] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50, lensX: 0, lensY: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });

  const current = gallery[active] ?? "";
  const multi = gallery.length > 1;

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setStageSize({ w: rect.width, h: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setZooming(false);
  }, [active]);

  const go = useCallback(
    (next: number) => {
      if (!multi) return;
      setActive((next + gallery.length) % gallery.length);
    },
    [gallery.length, multi],
  );

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);
    const half = LENS / 2;
    setPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      lensX: Math.min(Math.max(x, half), rect.width - half),
      lensY: Math.min(Math.max(y, half), rect.height - half),
    });
    setZooming(true);
  }

  function onPointerLeave() {
    setZooming(false);
  }

  if (gallery.length === 0) {
    return <div className="aspect-[3/4] bg-mist" />;
  }

  return (
    <div className="relative z-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        {multi ? (
          <div className="order-2 flex gap-2 overflow-x-auto pb-1 lg:order-1 lg:w-[68px] lg:flex-col lg:overflow-visible lg:pb-0">
            {gallery.map((src, index) => {
              const selected = index === active;
              return (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setActive(index)}
                  onMouseEnter={() => {
                    if (window.matchMedia("(hover: hover)").matches) {
                      setActive(index);
                    }
                  }}
                  aria-label={`View image ${index + 1}`}
                  aria-current={selected}
                  className={`relative h-16 w-14 shrink-0 overflow-hidden bg-mist transition-[outline,opacity] lg:aspect-[3/4] lg:h-auto lg:w-full ${
                    selected
                      ? "outline outline-2 outline-offset-[-2px] outline-ink"
                      : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="68px"
                  />
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="order-1 min-w-0 flex-1 lg:order-2">
          <div
            ref={stageRef}
            className="relative aspect-[3/4] overflow-hidden bg-mist max-lg:touch-pan-y lg:cursor-crosshair"
            onPointerMove={onPointerMove}
            onPointerEnter={onPointerMove}
            onPointerLeave={onPointerLeave}
          >
            <Image
              src={current}
              alt={alt}
              fill
              priority
              className="pointer-events-none object-cover select-none"
              sizes="(max-width: 768px) 100vw, 45vw"
              draggable={false}
            />

            {multi ? (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(event) => {
                    event.stopPropagation();
                    go(active - 1);
                  }}
                  className="absolute top-1/2 left-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-paper/95 text-lg text-ink shadow-sm transition-colors hover:bg-paper"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(event) => {
                    event.stopPropagation();
                    go(active + 1);
                  }}
                  className="absolute top-1/2 right-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-paper/95 text-lg text-ink shadow-sm transition-colors hover:bg-paper"
                >
                  ›
                </button>
              </>
            ) : null}

            {zooming ? (
              <div
                aria-hidden
                className="pointer-events-none absolute z-20 hidden border border-ink/25 bg-volt/20 lg:block"
                style={{
                  width: LENS,
                  height: LENS,
                  left: pos.lensX - LENS / 2,
                  top: pos.lensY - LENS / 2,
                }}
              />
            ) : null}
          </div>

          {multi ? (
            <p className="mt-3 text-center text-xs tracking-[0.12em] text-mute uppercase lg:text-left">
              {active + 1} / {gallery.length}
            </p>
          ) : null}
        </div>
      </div>

      {zooming && stageSize.w > 0 ? (
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-[calc(100%+1rem)] z-40 hidden overflow-hidden border border-line bg-paper shadow-[0_20px_60px_rgba(14,14,14,0.14)] lg:block"
          style={{
            width: Math.min(stageSize.w, 440),
            height: Math.min(stageSize.h, 560),
            backgroundImage: `url(${JSON.stringify(current).slice(1, -1)})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${ZOOM * 100}% auto`,
            backgroundPosition: `${pos.x}% ${pos.y}%`,
          }}
        />
      ) : null}
    </div>
  );
}
