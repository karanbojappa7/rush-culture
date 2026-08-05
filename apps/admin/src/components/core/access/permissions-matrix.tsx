"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiPatch } from "@/base/api";

export type MatrixRole = {
  id: string;
  code: string;
  name: string;
  isSystem: boolean;
};

export type MatrixPermission = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

export type MatrixGroup = {
  key: string;
  name: string;
  permissions: MatrixPermission[];
};

export type PermissionMatrixData = {
  roles: MatrixRole[];
  groups: MatrixGroup[];
  grants: Record<string, string[]>;
};

type Props = {
  initial: PermissionMatrixData;
};

export function PermissionsMatrix({ initial }: Props) {
  const router = useRouter();
  const [roles] = useState(initial.roles);
  const [groups] = useState(initial.groups);
  const [grants, setGrants] = useState<Record<string, Set<string>>>(() => {
    const next: Record<string, Set<string>> = {};
    for (const role of initial.roles) {
      next[role.id] = new Set(initial.grants[role.id] ?? []);
    }
    return next;
  });
  const [filter, setFilter] = useState("");
  const [showDescriptions, setShowDescriptions] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const filteredGroups = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (permission) =>
            permission.name.toLowerCase().includes(q) ||
            permission.code.toLowerCase().includes(q) ||
            (permission.description ?? "").toLowerCase().includes(q) ||
            group.name.toLowerCase().includes(q),
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [filter, groups]);

  function isChecked(roleId: string, permissionCode: string) {
    return grants[roleId]?.has(permissionCode) ?? false;
  }

  function isLocked(role: MatrixRole) {
    return role.code === "SUPER_ADMIN";
  }

  function toggle(role: MatrixRole, permissionCode: string) {
    if (isLocked(role)) return;
    setSaved(false);
    setGrants((prev) => {
      const next = { ...prev };
      const set = new Set(next[role.id] ?? []);
      if (set.has(permissionCode)) set.delete(permissionCode);
      else set.add(permissionCode);
      next[role.id] = set;
      return next;
    });
  }

  async function save() {
    setBusy(true);
    setError("");
    setSaved(false);
    const payload = {
      grants: roles
        .filter((role) => !isLocked(role))
        .map((role) => ({
          roleId: role.id,
          permissionCodes: [...(grants[role.id] ?? [])],
        })),
    };
    const res = await apiPatch("/api/access/matrix", payload);
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
      <div className="max-w-3xl space-y-2 text-sm text-mute">
        <p>
          Permissions define which parts of the admin each role can use.
          Columns are roles; check a box to grant that permission to that role.
        </p>
        <p>
          Super Admin always has full access and cannot be changed here.
          Catalog codes are defined in API YAML and synced on boot.
        </p>
        <button
          type="button"
          onClick={() => setShowDescriptions((value) => !value)}
          className="cursor-pointer text-xs font-semibold tracking-[0.08em] uppercase text-ink underline-offset-2 hover:underline"
        >
          {showDescriptions ? "Hide descriptions" : "Show descriptions"}
        </button>
      </div>

      <div className="flex flex-col gap-3 border border-line bg-panel p-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="block min-w-0 flex-1 text-xs">
          <span className="text-mute">Filter by permission name</span>
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="e.g. reviews, devices, orders"
            className="mt-1 w-full max-w-md border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void save()}
            className="cursor-pointer bg-ink px-4 py-2.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-white disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save permissions"}
          </button>
          {saved ? (
            <span className="text-xs font-medium text-mute">Saved</span>
          ) : null}
          {error ? <span className="text-xs text-red-700">{error}</span> : null}
        </div>
      </div>

      <div className="admin-table overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="sticky left-0 z-20 min-w-[220px] bg-[color-mix(in_srgb,var(--accent)_12%,var(--bg))] px-4 py-3 text-[11px] font-medium tracking-[0.12em] uppercase text-mute">
                Permission
              </th>
              {roles.map((role) => (
                <th
                  key={role.id}
                  className="min-w-[108px] px-3 py-3 text-center text-[11px] font-medium tracking-[0.08em] uppercase text-mute"
                  title={role.code}
                >
                  <span className="block max-w-[7.5rem] truncate font-semibold normal-case tracking-normal text-ink">
                    {role.name}
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] font-normal normal-case tracking-normal">
                    {role.code}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredGroups.length === 0 ? (
              <tr>
                <td
                  colSpan={roles.length + 1}
                  className="px-4 py-12 text-center text-mute"
                >
                  No permissions match your filter.
                </td>
              </tr>
            ) : (
              filteredGroups.map((group) => (
                <GroupRows
                  key={group.key}
                  group={group}
                  roles={roles}
                  showDescriptions={showDescriptions}
                  isChecked={isChecked}
                  isLocked={isLocked}
                  toggle={toggle}
                  colSpan={roles.length + 1}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GroupRows({
  group,
  roles,
  showDescriptions,
  isChecked,
  isLocked,
  toggle,
  colSpan,
}: {
  group: MatrixGroup;
  roles: MatrixRole[];
  showDescriptions: boolean;
  isChecked: (roleId: string, permissionCode: string) => boolean;
  isLocked: (role: MatrixRole) => boolean;
  toggle: (role: MatrixRole, permissionCode: string) => void;
  colSpan: number;
}) {
  return (
    <>
      <tr className="border-b border-line bg-bg/80">
        <td
          colSpan={colSpan}
          className="px-4 py-2.5 font-display text-sm font-bold tracking-tight"
        >
          {group.name}
        </td>
      </tr>
      {group.permissions.map((permission, index) => (
        <tr
          key={permission.code}
          className={`border-b border-line last:border-0 ${
            index % 2 === 0 ? "bg-panel" : "bg-bg/40"
          }`}
        >
          <td className="sticky left-0 z-[1] bg-inherit px-4 py-3 align-top">
            <p className="font-medium text-ink">{permission.name}</p>
            <p className="mt-0.5 font-mono text-[11px] text-mute">
              {permission.code}
            </p>
            {showDescriptions && permission.description ? (
              <p className="mt-1 max-w-md text-xs text-mute">
                {permission.description}
              </p>
            ) : null}
          </td>
          {roles.map((role) => {
            const locked = isLocked(role);
            const checked = locked || isChecked(role.id, permission.code);
            return (
              <td key={role.id} className="px-3 py-3 text-center align-middle">
                <label className="inline-flex cursor-pointer items-center justify-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-ink"
                    checked={checked}
                    disabled={locked}
                    onChange={() => toggle(role, permission.code)}
                    aria-label={`${permission.code} for ${role.code}`}
                  />
                </label>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
