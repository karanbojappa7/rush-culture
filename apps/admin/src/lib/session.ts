import { apiGet } from "@/lib/api-server";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  roleCode: string;
};

export async function getSessionUser() {
  const res = await apiGet<SessionUser>("/api/auth/me");
  if (res.status_code !== 200 || !res.data) return null;
  return res.data;
}

export function sessionLabel(user: SessionUser | null) {
  if (!user) return undefined;
  return user.name ? `${user.name} · ${user.roleCode}` : user.email;
}
