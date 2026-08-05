import { brand, withBrandName } from "./brand";

export type PolicySection = {
  title: string;
  body: string;
};

export type SizeGuideRow = {
  size: string;
  chest: string;
  length: string;
  shoulder: string;
};

export type PolicyDocument = {
  title: string;
  intro: string;
  sections: PolicySection[];
};

export type SizeGuideSettings = {
  title: string;
  intro: string;
  rows: SizeGuideRow[];
  note: string;
};

export type ContactTopicValue =
  | "SHIPPING"
  | "RETURNS"
  | "ORDER"
  | "PRODUCT"
  | "OTHER";

export type ContactTopic = {
  value: ContactTopicValue;
  label: string;
};

export type PoliciesSettings = {
  shipping: PolicyDocument;
  returns: PolicyDocument;
  sizeGuide: SizeGuideSettings;
  contactTopics: ContactTopic[];
  contactIntro: string;
};

const CONTACT_TOPIC_VALUES: ContactTopicValue[] = [
  "SHIPPING",
  "RETURNS",
  "ORDER",
  "PRODUCT",
  "OTHER",
];

const TOPIC_VALUE_SET = new Set<string>(CONTACT_TOPIC_VALUES);

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  if (value == null) return fallback;
  return String(value).trim();
}

function normalizeSection(
  value: unknown,
  fallback: PolicySection,
): PolicySection {
  if (!value || typeof value !== "object") return { ...fallback };
  const row = value as Partial<PolicySection>;
  return {
    title: asString(row.title, fallback.title) || fallback.title,
    body: asString(row.body, fallback.body) || fallback.body,
  };
}

function normalizeSections(
  value: unknown,
  fallback: PolicySection[],
): PolicySection[] {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback.map((section) => ({ ...section }));
  }
  return value.map((item, index) =>
    normalizeSection(item, fallback[index] ?? { title: "Section", body: "" }),
  );
}

function normalizePolicyDocument(
  value: unknown,
  fallback: PolicyDocument,
): PolicyDocument {
  if (!value || typeof value !== "object") {
    return {
      title: fallback.title,
      intro: fallback.intro,
      sections: fallback.sections.map((section) => ({ ...section })),
    };
  }
  const row = value as Partial<PolicyDocument>;
  return {
    title: asString(row.title, fallback.title) || fallback.title,
    intro: asString(row.intro, fallback.intro) || fallback.intro,
    sections: normalizeSections(row.sections, fallback.sections),
  };
}

function normalizeSizeRow(
  value: unknown,
  fallback: SizeGuideRow,
): SizeGuideRow {
  if (!value || typeof value !== "object") return { ...fallback };
  const row = value as Partial<SizeGuideRow>;
  return {
    size: asString(row.size, fallback.size) || fallback.size,
    chest: asString(row.chest, fallback.chest) || fallback.chest,
    length: asString(row.length, fallback.length) || fallback.length,
    shoulder: asString(row.shoulder, fallback.shoulder) || fallback.shoulder,
  };
}

function normalizeSizeGuide(
  value: unknown,
  fallback: SizeGuideSettings,
): SizeGuideSettings {
  if (!value || typeof value !== "object") {
    return {
      title: fallback.title,
      intro: fallback.intro,
      note: fallback.note,
      rows: fallback.rows.map((row) => ({ ...row })),
    };
  }
  const row = value as Partial<SizeGuideSettings>;
  const rowsInput = Array.isArray(row.rows) ? row.rows : null;
  return {
    title: asString(row.title, fallback.title) || fallback.title,
    intro: asString(row.intro, fallback.intro) || fallback.intro,
    note: asString(row.note, fallback.note) || fallback.note,
    rows: rowsInput && rowsInput.length > 0
      ? rowsInput.map((item, index) =>
          normalizeSizeRow(
            item,
            fallback.rows[index] ?? {
              size: "",
              chest: "",
              length: "",
              shoulder: "",
            },
          ),
        )
      : fallback.rows.map((item) => ({ ...item })),
  };
}

function normalizeContactTopics(value: unknown): ContactTopic[] {
  const defaults = defaultContactTopics();
  const labelByValue = new Map(
    defaults.map((topic) => [topic.value, topic.label] as const),
  );
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!item || typeof item !== "object") continue;
      const row = item as Partial<ContactTopic>;
      const rawValue = asString(row.value).toUpperCase();
      if (!TOPIC_VALUE_SET.has(rawValue)) continue;
      const label = asString(row.label);
      if (label) labelByValue.set(rawValue as ContactTopicValue, label);
    }
  }
  return CONTACT_TOPIC_VALUES.map((topicValue) => ({
    value: topicValue,
    label: labelByValue.get(topicValue) || topicValue,
  }));
}

function defaultContactTopics(): ContactTopic[] {
  return [
    { value: "SHIPPING", label: "Shipping" },
    { value: "RETURNS", label: "Returns" },
    { value: "ORDER", label: "Order" },
    { value: "PRODUCT", label: "Product" },
    { value: "OTHER", label: "Other" },
  ];
}

export function defaultPoliciesSettings(): PoliciesSettings {
  return {
    shipping: {
      title: "Shipping",
      intro: withBrandName(
        "{brand} ships across India. Most metro orders move within 2–4 working days after packing.",
      ),
      sections: [
        {
          title: "Delivery windows",
          body: "Metros: 2–4 working days after dispatch. Tier-2/3 cities: 4–7 working days. Remote pin codes may take longer during peak drops.",
        },
        {
          title: "Shipping charges",
          body: "Free shipping on orders ₹1,999 and above. Below that, a flat ₹99 shipping fee applies at checkout.",
        },
        {
          title: "Order tracking",
          body: "You get an email with your order number when the order is placed. Status updates show in admin as packed → shipped → delivered.",
        },
        {
          title: "Delays",
          body: "Courier partners can slip during festivals or weather. If your order is late, open a query from Contact — we track every request in admin.",
        },
      ],
    },
    returns: {
      title: "Returns",
      intro: withBrandName(
        "Changed your mind or wrong size? {brand} accepts returns within 7 days of delivery for unused pieces with tags on.",
      ),
      sections: [
        {
          title: "Eligible returns",
          body: "Unworn, unwashed items with original tags and packaging. Intimate wear and final-sale drops are not returnable.",
        },
        {
          title: "How to start a return",
          body: `Email ${brand.supportEmail} or submit a Contact query with your order number, SKU, and reason. We reply with pickup or drop instructions.`,
        },
        {
          title: "Refunds & exchanges",
          body: "Approved returns are refunded to the original payment method within 5–7 working days after we receive the piece. Size exchanges depend on stock.",
        },
        {
          title: "Damaged or wrong item",
          body: "Send photos within 48 hours of delivery. We arrange a free replacement or full refund — no restocking fee.",
        },
      ],
    },
    sizeGuide: {
      title: "Size guide",
      intro:
        "Fits run oversized by design. If you prefer a closer fit, size down once.",
      rows: [
        { size: "S", chest: "38–40", length: "27", shoulder: "20" },
        { size: "M", chest: "40–42", length: "28", shoulder: "21" },
        { size: "L", chest: "42–44", length: "29", shoulder: "22" },
        { size: "XL", chest: "44–46", length: "30", shoulder: "23" },
        { size: "XXL", chest: "46–48", length: "31", shoulder: "24" },
      ],
      note: "Measurements in inches, approximate. Waist sizes for bottoms use numbered fits (28–36).",
    },
    contactTopics: defaultContactTopics(),
    contactIntro:
      "Questions about shipping, returns, sizing, or an order? Send a note — we read every message.",
  };
}

export function normalizePoliciesSettings(
  input?: Partial<PoliciesSettings> | null,
): PoliciesSettings {
  const base = defaultPoliciesSettings();
  if (!input || typeof input !== "object") return base;
  return {
    shipping: normalizePolicyDocument(input.shipping, base.shipping),
    returns: normalizePolicyDocument(input.returns, base.returns),
    sizeGuide: normalizeSizeGuide(input.sizeGuide, base.sizeGuide),
    contactTopics: normalizeContactTopics(input.contactTopics),
    contactIntro:
      asString(input.contactIntro, base.contactIntro) || base.contactIntro,
  };
}

export const shippingPolicy = defaultPoliciesSettings().shipping;
export const returnsPolicy = defaultPoliciesSettings().returns;
export const sizeGuide = defaultPoliciesSettings().sizeGuide;
export const contactTopics = defaultPoliciesSettings().contactTopics;
