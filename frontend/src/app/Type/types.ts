export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

// Create a type for the frontend form submission (without `id` and `category`)
export type ProductForFrontend = Omit<Product, 'id' | 'category'>;
