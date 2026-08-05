"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { apiPatch } from "@/base/api";

export type PermissionRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
};

type Props = {
  roleId: string;
  roleCode: string;
  locked?: boolean;
  permissions: PermissionRow[];
  selectedCodes: string[];
};

export function RolePermissionsForm({
  roleId,
  roleCode,
  locked = false,
  permissions,
  selectedCodes,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState(() => new Set(selectedCodes));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const byModule = useMemo(() => {
    const map = new Map<string, PermissionRow[]>();
    for (const permission of permissions) {
      const list = map.get(permission.module) ?? [];
      list.push(permission);
      map.set(permission.module, list);
    }
    return [...map.entries()];
  }, [permissions]);

  function toggle(code: string) {
    if (locked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
    setSaved(false);
  }

  async function save() {
    if (locked) return;
    setBusy(true);
    setError("");
    setSaved(false);
    const res = await apiPatch(`/api/access/roles/${roleId}/permissions`, {
      permissionCodes: [...selected],
    });
    setBusy(false);
    if (res.status_code !== 200) {
      setError(res.message || "Failed to save permissions");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {locked ? (
        <p className="text-sm text-mute">
          {roleCode} always has full access. Permission mapping is not editable.
        </p>
      ) : null}
      {byModule.map(([module, rows]) => (
        <section key={module}>
          <h3 className="font-display text-lg font-bold tracking-tight capitalize">
            {module}
          </h3>
          <ul className="mt-3 divide-y divide-line border border-line bg-panel">
            {rows.map((permission) => {
              const checked = selected.has(permission.code);
              return (
                <li key={permission.code}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 px-4 py-3 ${
                      locked ? "cursor-default opacity-80" : "hover:bg-ink/[0.02]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked || locked}
                      disabled={locked || busy}
                      onChange={() => toggle(permission.code)}
                    />
                    <span>
                      <span className="block text-sm font-semibold text-ink">
                        {permission.name}
                      </span>
                      <span className="mt-0.5 block font-mono text-[11px] text-mute">
                        {permission.code}
                      </span>
                      {permission.description ? (
                        <span className="mt-1 block text-xs text-mute">
                          {permission.description}
                        </span>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {!locked ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="cursor-pointer bg-ink px-4 py-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save mapping"}
          </button>
          {saved ? (
            <span className="text-xs font-medium text-mute">Saved</span>
          ) : null}
          {error ? <span className="text-xs text-red-700">{error}</span> : null}
        </div>
      ) : null}
    </div>
  );
}
