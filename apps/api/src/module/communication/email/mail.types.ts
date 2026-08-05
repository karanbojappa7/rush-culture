export const EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION: 'order_confirmation',
} as const;

export type EmailTemplateKey =
  (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES];

export type RenderedMail = {
  subject: string;
  html: string;
  text: string;
};

export type SendMailRequest = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
  templateKey: EmailTemplateKey | string;
  relatedType?: string;
  relatedId?: string;
  meta?: Record<string, unknown>;
};

export type OrderConfirmationItem = {
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPriceInPaise: number;
  lineTotalInPaise: number;
};

export type OrderConfirmationMailData = {
  orderNumber: string;
  orderId: string;
  customerEmail: string;
  customerName: string;
  createdAt: Date;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentDetails: string | null;
  subtotalInPaise: number;
  shippingInPaise: number;
  totalInPaise: number;
  shippingFullName: string;
  shippingPhone: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  items: OrderConfirmationItem[];
  storeUrl: string;
};
