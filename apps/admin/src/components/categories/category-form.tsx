"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

const fieldClass =
  "mt-2 w-full border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:border-ink";

export function CategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const res = await apiPost("/api/categories", {
      name,
      slug: slug || undefined,
      description: description || undefined,
      imageUrl: imageUrl || undefined,
    });
    setSaving(false);
    if (res.status_code !== 200) {
      setError(res.message || "Save failed");
      return;
    }
    router.refresh();
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4 border border-line bg-panel p-5">
      <p className="font-display text-xl font-bold">New category</p>
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
        {saving ? "Saving…" : "Create"}
      </button>
    </form>
  );
}
