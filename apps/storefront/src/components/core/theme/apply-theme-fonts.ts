import {
  buildGoogleFontsStylesheetUrl,
  fontFamilyCss,
} from "@linq/site-config";

export function applyThemeFontsToDocument(settings: {
  displayFont: string;
  bodyFont: string;
}) {
  if (typeof document === "undefined") return;
  const href = buildGoogleFontsStylesheetUrl(
    settings.displayFont,
    settings.bodyFont,
  );
  let link = document.getElementById(
    "theme-google-fonts",
  ) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = "theme-google-fonts";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.getAttribute("href") !== href) {
    link.setAttribute("href", href);
  }
  const root = document.documentElement;
  root.style.setProperty("--font-syne", fontFamilyCss(settings.displayFont));
  root.style.setProperty("--font-figtree", fontFamilyCss(settings.bodyFont));
  root.style.setProperty(
    "--font-display-family",
    fontFamilyCss(settings.displayFont),
  );
  root.style.setProperty(
    "--font-sans-family",
    fontFamilyCss(settings.bodyFont),
  );
}
