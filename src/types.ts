export type Product = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  price: number;
  imageUrl: string;
  lifestyleImageUrl: string;
  stock: number;
};

export type ProductSectionProps = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  price: number;
  imageUrl: string;
  lifestyleImageUrl: string;
  reverse?: boolean;
  stock: number;
};

export type OrderItem = {
  id: number;
  quantity: number;
  price: number;
  productId: number | null;
  product: {
    name: string;
    imageUrl: string;
  } | null;
};

export type Order = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  shippingMethod: string | null;
  shippingAddress: Record<string, string> | null;
  paymentMethod: string | null;
  fulfillmentStatus: string;
  trackingNumber: string | null;
  items: OrderItem[];
};

export type AdminOrder = {
  id: number;
  stripeSessionId: string;
  status: string;
  total: number;
  createdAt: string;
  customerEmail: string | null;
  shippingMethod: string | null;
  shippingAddress: Record<string, string> | null;
  fulfillmentStatus: string;
  trackingNumber: string | null;
};

export type CartItem = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
};

export type ShippingMethod = "paczkomat" | "inpost_kurier" | "dpd";

export type CourierAddress = {
  firstName: string;
  lastName: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
};

export type PaczkomatPoint = {
  code: string;
  name: string;
  city?: string;
};

export type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => boolean;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  totalItems: number;
};
