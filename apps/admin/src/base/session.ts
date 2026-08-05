import { cache } from "react";
import { apiGet } from "@/base/api-server";
import type { SessionUser } from "@/base/session-shared";

export type { SessionUser } from "@/base/session-shared";
export { hasPermission, sessionLabel } from "@/base/session-shared";

function isSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.email === "string" &&
    typeof row.roleCode === "string"
  );
}

function unwrapSession(data: unknown): SessionUser | null {
  if (isSessionUser(data)) return data;
  if (data && typeof data === "object" && "data" in data) {
    const nested = (data as { data?: unknown }).data;
    if (isSessionUser(nested)) return nested;
  }
  return null;
}

export const getSessionUser = cache(async () => {
  const res = await apiGet<SessionUser>("/api/auth/me");
  if (res.status_code !== 200) return null;
  return unwrapSession(res.data);
});
