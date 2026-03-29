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

export type Order = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
};

export type Orders = {
  id: number;
  stripeSessionId: string;
  status: string;
  total: number;
  createdAt: string;
};

export type CartItem = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
};

export type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => boolean;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  totalItems: number;
};
