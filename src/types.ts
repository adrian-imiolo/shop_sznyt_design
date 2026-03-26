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

export type Order = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
};
