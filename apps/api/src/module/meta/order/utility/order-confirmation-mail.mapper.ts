import { OrderConfirmationMailData } from '../../../../common/email/mail.types';

type OrderWithItems = {
  id: string;
  orderNumber: string;
  customerEmail: string | null;
  shippingFullName: string;
  shippingPhone: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  paymentMethod: string | null;
  paymentDetails: string | null;
  paymentStatus: string;
  status: string;
  subtotalInPaise: number;
  shippingInPaise: number;
  totalInPaise: number;
  createdAt: Date;
  items: Array<{
    productName: string;
    size: string;
    color: string;
    quantity: number;
    unitPriceInPaise: number;
    lineTotalInPaise: number;
  }>;
};

export function toOrderConfirmationMailData(
  order: OrderWithItems,
  storeUrl: string,
): OrderConfirmationMailData {
  return {
    orderNumber: order.orderNumber,
    orderId: order.id,
    customerEmail: order.customerEmail || '',
    customerName: order.shippingFullName,
    createdAt: order.createdAt,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    paymentDetails: order.paymentDetails,
    subtotalInPaise: order.subtotalInPaise,
    shippingInPaise: order.shippingInPaise,
    totalInPaise: order.totalInPaise,
    shippingFullName: order.shippingFullName,
    shippingPhone: order.shippingPhone,
    shippingLine1: order.shippingLine1,
    shippingLine2: order.shippingLine2,
    shippingCity: order.shippingCity,
    shippingState: order.shippingState,
    shippingPostalCode: order.shippingPostalCode,
    shippingCountry: order.shippingCountry,
    storeUrl,
    items: order.items.map((item) => ({
      productName: item.productName,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPriceInPaise: item.unitPriceInPaise,
      lineTotalInPaise: item.lineTotalInPaise,
    })),
  };
}
