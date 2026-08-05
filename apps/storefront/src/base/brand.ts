import {
  defaultBrandSettings,
  type BrandSettings,
} from "@linq/site-config";
import { brandController } from "@/module/index";

export async function fetchBrandSettings(): Promise<BrandSettings> {
  const res = await brandController.getSettings();
  if (res.ok && res.data) return res.data;
  return defaultBrandSettings();
}
