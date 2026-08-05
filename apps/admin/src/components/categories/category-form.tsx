"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPatch, apiPost } from "@/lib/api";

const fieldClass =
  "mt-2 w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-ink";

export type CategoryFormValue = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export function CategoryForm({
  category,
  cancelHref = "/categories",
}: {
  category?: CategoryFormValue | null;
  cancelHref?: string;
}) {
  const router = useRouter();
  const editing = Boolean(category?.id);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [imageUrl, setImageUrl] = useState(category?.imageUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(category?.name ?? "");
    setSlug(category?.slug ?? "");
    setDescription(category?.description ?? "");
    setImageUrl(category?.imageUrl ?? "");
    setError(null);
  }, [category?.id, category?.name, category?.slug, category?.description, category?.imageUrl]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const body = {
      name,
      slug: slug || undefined,
      description: description || undefined,
      imageUrl: imageUrl || undefined,
    };
    const res = editing
      ? await apiPatch(`/api/categories/${category!.id}`, body)
      : await apiPost("/api/categories", body);
    setSaving(false);
    if (res.status_code !== 200) {
      setError(res.message || "Save failed");
      return;
    }
    router.replace("/categories");
    router.refresh();
    if (!editing) {
      setName("");
      setSlug("");
      setDescription("");
      setImageUrl("");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-xl space-y-4 border border-line bg-panel p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-xl font-bold">
          {editing ? "Edit category" : "New category"}
        </p>
        {editing ? (
          <Link
            href={cancelHref}
            className="cursor-pointer text-[11px] font-semibold tracking-[0.1em] uppercase text-mute hover:text-ink"
          >
            Cancel
          </Link>
        ) : null}
      </div>
      <label className="block text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
        Name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
        Slug
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
        Description
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block text-[12px] font-medium tracking-[0.14em] uppercase text-mute">
        Image URL
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className={fieldClass}
        />
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={saving}
        className="cursor-pointer bg-ink px-4 py-2.5 text-[12px] font-semibold tracking-[0.12em] uppercase text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : editing ? "Update" : "Create"}
      </button>
    </form>
  );
}
