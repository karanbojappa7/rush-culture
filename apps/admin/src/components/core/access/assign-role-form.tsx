"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPatch } from "@/base/api";

type RoleOption = { code: string; name: string };

type Props = {
  userId: string;
  roleCode: string;
  roles: RoleOption[];
};

export function AssignRoleForm({ userId, roleCode, roles }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(roleCode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (value === roleCode) return;
    setBusy(true);
    setError("");
    const res = await apiPatch(`/api/users/${userId}`, { roleCode: value });
    setBusy(false);
    if (res.status_code !== 200) {
      setError(res.message || "Update failed");
      setValue(roleCode);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <select
          value={value}
          disabled={busy}
          onChange={(event) => setValue(event.target.value)}
          className="border border-line bg-panel px-2 py-1.5 text-xs text-ink outline-none focus:border-ink"
        >
          {roles.map((role) => (
            <option key={role.code} value={role.code}>
              {role.code}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={busy || value === roleCode}
          onClick={() => void save()}
          className="cursor-pointer bg-ink px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase text-white disabled:opacity-40"
        >
          Save
        </button>
      </div>
      {error ? <span className="text-[11px] text-red-700">{error}</span> : null}
    </div>
  );
}
