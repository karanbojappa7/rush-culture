"use client";

type QuerySlice = {
  key: string;
  label: string;
  value: number;
  color: string;
};

type BarPoint = {
  label: string;
  value: number;
  display?: string;
};

type Props = {
  querySlices: QuerySlice[];
  paymentBars: BarPoint[];
  revenueBars: BarPoint[];
  revenueMax: number;
  ordersTotal: number;
  pendingPayments: number;
};

const PAYMENT_TONES = [
  "var(--tone-a, var(--accent))",
  "var(--tone-b, var(--ink))",
  "var(--tone-c, var(--mute))",
  "var(--tone-d)",
  "var(--tone-e)",
  "var(--tone-f)",
];

const REVENUE_TONES = [
  "var(--accent)",
  "var(--ink)",
  "var(--mute)",
  "color-mix(in srgb, var(--mist) 25%, var(--ink))",
  "color-mix(in srgb, var(--accent) 55%, var(--mist))",
  "color-mix(in srgb, var(--ink) 50%, var(--mute))",
  "color-mix(in srgb, var(--accent) 70%, var(--ink))",
  "color-mix(in srgb, var(--mute) 60%, var(--bg))",
];

function paymentBarColor(label: string, index: number) {
  const key = label.toUpperCase();
  if (key.includes("CAPTURE") || key.includes("PAID") || key.includes("SUCCESS")) {
    return "var(--accent)";
  }
  if (key.includes("PENDING") || key.includes("COD")) {
    return "var(--mute)";
  }
  if (key.includes("FAIL") || key.includes("REFUND")) {
    return "var(--ink)";
  }
  return PAYMENT_TONES[index % PAYMENT_TONES.length];
}

export function OverviewCharts({
  querySlices,
  paymentBars,
  revenueBars,
  revenueMax,
  ordersTotal,
  pendingPayments,
}: Props) {
  const queryTotal = querySlices.reduce((sum, slice) => sum + slice.value, 0);
  const paidShare =
    ordersTotal === 0
      ? 0
      : Math.round(((ordersTotal - pendingPayments) / ordersTotal) * 100);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <section className="flex flex-col border border-line bg-panel p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold">Query health</h2>
            <p className="mt-1 text-sm text-mute">Status mix across all tickets</p>
          </div>
          <p className="shrink-0 font-display text-2xl font-extrabold tabular-nums text-ink">
            {queryTotal}
          </p>
        </div>
        <div className="mt-6 flex flex-1 flex-col items-center gap-5">
          <Donut slices={querySlices} total={queryTotal} />
          <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {querySlices.map((slice) => {
              const pct =
                queryTotal === 0
                  ? 0
                  : Math.round((slice.value / queryTotal) * 100);
              return (
                <li key={slice.key} className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ background: slice.color }}
                      aria-hidden
                    />
                    <span className="truncate">{slice.label}</span>
                  </div>
                  <p className="mt-0.5 pl-[1.125rem] tabular-nums text-mute">
                    {slice.value} · {pct}%
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="flex flex-col border border-line bg-panel p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold">Payment pulse</h2>
            <p className="mt-1 text-sm text-mute">Recent orders by payment state</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-2xl font-extrabold tabular-nums text-ink">
              {paidShare}%
            </p>
            <p className="text-[11px] tracking-[0.1em] uppercase text-mute">
              captured
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-1 flex-col justify-center space-y-4">
          {paymentBars.length === 0 ? (
            <p className="py-10 text-center text-sm text-mute">
              No recent orders yet.
            </p>
          ) : (
            paymentBars.map((bar, index) => {
              const max = Math.max(...paymentBars.map((item) => item.value), 1);
              const width = Math.max(6, Math.round((bar.value / max) * 100));
              const tone = paymentBarColor(bar.label, index);
              return (
                <div key={bar.label}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="truncate uppercase tracking-[0.06em]">
                      {bar.label}
                    </span>
                    <span className="shrink-0 tabular-nums text-mute">
                      {bar.value}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden bg-mist">
                    <div
                      className="chart-bar h-full"
                      style={{ width: `${width}%`, background: tone }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="flex flex-col border border-line bg-panel p-5 md:col-span-2 md:p-6 xl:col-span-1">
        <div>
          <h2 className="font-display text-lg font-bold">Recent revenue</h2>
          <p className="mt-1 text-sm text-mute">Latest order totals</p>
        </div>
        <div className="mt-6 flex flex-1 items-end">
          {revenueBars.length === 0 ? (
            <p className="w-full py-10 text-center text-sm text-mute">
              No revenue data yet.
            </p>
          ) : (
            <RevenueBars points={revenueBars} max={revenueMax} />
          )}
        </div>
      </section>
    </div>
  );
}

function Donut({ slices, total }: { slices: QuerySlice[]; total: number }) {
  const size = 132;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
        role="img"
        aria-label="Query status distribution"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="color-mix(in srgb, var(--line) 80%, var(--mist))"
          strokeWidth={stroke}
        />
        {total > 0 ? (
          <g transform={`rotate(-90 ${center} ${center})`}>
            {slices.map((slice) => {
              if (slice.value <= 0) return null;
              const length = (slice.value / total) * circumference;
              const node = (
                <circle
                  key={slice.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                  className="chart-arc"
                />
              );
              offset += length;
              return node;
            })}
          </g>
        ) : null}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-xl font-extrabold tabular-nums leading-none">
          {total}
        </span>
        <span className="mt-1 text-[10px] tracking-[0.12em] uppercase text-mute">
          total
        </span>
      </div>
    </div>
  );
}

function RevenueBars({ points, max }: { points: BarPoint[]; max: number }) {
  return (
    <div className="flex h-36 w-full items-end gap-1.5 sm:gap-2">
      {points.map((point, index) => {
        const heightPct =
          max <= 0 ? 0 : Math.max(12, Math.round((point.value / max) * 100));
        const tone = REVENUE_TONES[index % REVENUE_TONES.length];
        return (
          <div
            key={`${point.label}-${index}`}
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
            title={`${point.label}: ${point.display ?? point.value}`}
          >
            <div className="flex h-28 w-full items-end justify-center">
              <div
                className="chart-col w-full max-w-8"
                style={{ height: `${heightPct}%`, background: tone }}
              />
            </div>
            <span className="w-full truncate text-center text-[10px] tracking-[0.04em] text-mute uppercase">
              {point.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
