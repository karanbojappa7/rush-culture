import { brand, withBrandName } from "./brand";

export type PolicySection = {
  title: string;
  body: string;
};

export const shippingPolicy = {
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
  ] satisfies PolicySection[],
};

export const returnsPolicy = {
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
  ] satisfies PolicySection[],
};

export const sizeGuide = {
  title: "Size guide",
  intro: "Fits run oversized by design. If you prefer a closer fit, size down once.",
  rows: [
    { size: "S", chest: "38–40", length: "27", shoulder: "20" },
    { size: "M", chest: "40–42", length: "28", shoulder: "21" },
    { size: "L", chest: "42–44", length: "29", shoulder: "22" },
    { size: "XL", chest: "44–46", length: "30", shoulder: "23" },
    { size: "XXL", chest: "46–48", length: "31", shoulder: "24" },
  ],
  note: "Measurements in inches, approximate. Waist sizes for bottoms use numbered fits (28–36).",
};

export const contactTopics = [
  { value: "SHIPPING", label: "Shipping" },
  { value: "RETURNS", label: "Returns" },
  { value: "ORDER", label: "Order" },
  { value: "PRODUCT", label: "Product" },
  { value: "OTHER", label: "Other" },
] as const;
