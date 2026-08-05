import {
  defaultPoliciesSettings,
  type PoliciesSettings,
} from "@linq/site-config";
import { policiesController } from "@/module/index";

export async function fetchPoliciesSettings(): Promise<PoliciesSettings> {
  const res = await policiesController.getSettings();
  if (res.ok && res.data) return res.data;
  return defaultPoliciesSettings();
}
