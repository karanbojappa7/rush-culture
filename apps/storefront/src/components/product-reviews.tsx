"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { emptyPage, type PageResult } from "@/lib/pagination";

type Review = {
  id: string;
  displayName: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  createdAt: string;
  customer?: { name: string | null; email: string } | null;
};

type Summary = {
  productId: string;
  count: number;
  average: number;
};

type Props = {
  productId: string;
  productName: string;
};

function Stars({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (next: number) => void;
  size?: "sm" | "md";
}) {
  const cls = size === "sm" ? "text-sm" : "text-xl";
  return (
    <div className={`flex items-center gap-0.5 ${cls}`} role="img" aria-label={`${value} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        if (!onChange) {
          return (
            <span key={star} className={active ? "text-ink" : "text-mist"}>
              ★
            </span>
          );
        }
        return (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star} stars`}
            onClick={() => onChange(star)}
            className={`cursor-pointer transition-colors ${
              active ? "text-ink" : "text-mist hover:text-ink/50"
            }`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export function ProductReviews({ productId, productName }: Props) {
  const [summary, setSummary] = useState<Summary>({
    productId,
    count: 0,
    average: 0,
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const [summaryRes, listRes] = await Promise.all([
      apiGet<Summary>(`/api/reviews/summary?productId=${productId}`),
      apiGet<PageResult<Review>>(
        `/api/reviews?productId=${productId}&page=1&limit=20`,
      ),
    ]);
    if (summaryRes.status_code === 200 && summaryRes.data) {
      setSummary(summaryRes.data);
    }
    setReviews(listRes.data?.items ?? emptyPage<Review>().items);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [productId]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);
    const res = await apiPost("/api/reviews", {
      productId,
      name: name.trim(),
      email: email.trim(),
      rating,
      title: title.trim() || undefined,
      body: body.trim() || undefined,
    });
    setSubmitting(false);
    if (res.status_code !== 200) {
      setError(res.message || "Could not submit review");
      return;
    }
    setMessage("Thanks — your review was submitted and is awaiting approval.");
    setTitle("");
    setBody("");
    setRating(5);
    void load();
  }

  return (
    <section className="border-t border-line pt-12 md:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
            Ratings & reviews
          </h2>
          <p className="mt-2 text-sm text-mute">
            What people are saying about {productName}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Stars value={Math.round(summary.average)} size="md" />
            <span className="font-display text-2xl font-extrabold tabular-nums">
              {summary.count === 0 ? "—" : summary.average.toFixed(1)}
            </span>
          </div>
          <p className="mt-1 text-xs tracking-[0.1em] text-mute uppercase">
            {summary.count} {summary.count === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-mute">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="border border-line bg-paper px-4 py-10 text-center text-sm text-mute">
              No approved reviews yet. Be the first to rate this piece.
            </p>
          ) : (
            reviews.map((review) => (
              <article
                key={review.id}
                className="border border-line bg-paper p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-ink">
                      {review.displayName ||
                        review.customer?.name ||
                        "Customer"}
                    </p>
                    <p className="mt-1 text-xs text-mute">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Stars value={review.rating} size="sm" />
                </div>
                {review.title ? (
                  <p className="mt-3 font-semibold text-ink">{review.title}</p>
                ) : null}
                {review.body ? (
                  <p className="mt-2 text-sm leading-relaxed text-mute">
                    {review.body}
                  </p>
                ) : null}
              </article>
            ))
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="border border-line bg-paper p-5 md:p-6"
        >
          <h3 className="font-display text-xl font-bold">Write a review</h3>
          <p className="mt-1 text-sm text-mute">
            Rating is required. Reviews appear after approval.
          </p>

          <div className="mt-5">
            <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-mute">
              Your rating
            </p>
            <div className="mt-2">
              <Stars value={rating} onChange={setRating} />
            </div>
          </div>

          <label className="mt-5 block text-[11px] font-medium tracking-[0.12em] uppercase text-mute">
            Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full border border-line bg-mist/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-ink"
            />
          </label>

          <label className="mt-4 block text-[11px] font-medium tracking-[0.12em] uppercase text-mute">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border border-line bg-mist/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-ink"
            />
          </label>

          <label className="mt-4 block text-[11px] font-medium tracking-[0.12em] uppercase text-mute">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="mt-2 w-full border border-line bg-mist/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-ink"
            />
          </label>

          <label className="mt-4 block text-[11px] font-medium tracking-[0.12em] uppercase text-mute">
            Comment
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={4000}
              className="mt-2 w-full resize-y border border-line bg-mist/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-ink"
            />
          </label>

          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="mt-4 text-sm text-ink">{message}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-6 w-full disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </form>
      </div>
    </section>
  );
}
