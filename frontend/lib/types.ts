export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'VENDOR' | 'CUSTOMER';
  isActive: boolean;
  emailVerified: boolean;
  vendor?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    status?: string;
  } | null;
  createdAt?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPrice?: number | null;
  sku: string;
  brand: Brand;
  vendor: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
  sportCategory?: Category | null;
  productType?: Category | null;
  status: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isTrending: boolean;
  weight?: number;
  tags: string[];
  rating: number;
  reviewCount: number;
  salesCount: number;
  images: ProductImage[];
  variants?: ProductVariant[];
  _count?: {
    reviews: number;
    variants: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  color: string;
  size: string;
  sku: string;
  stock: number;
  price?: number | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  type: 'SPORT' | 'PRODUCT_TYPE';
  sortOrder: number;
  _count?: {
    sportProducts?: number;
    typeProducts?: number;
  };
}

export interface Vendor {
  id: string;
  userId: string;
  slug: string;
  name: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rating: number;
  totalSales: number;
  socialLinks?: {
    website?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
    reviews: number;
  };
}

export interface CartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  savedForLater: boolean;
  variant: ProductVariant & {
    product: Product;
  };
}

export interface Cart {
  items: CartItem[];
  savedForLater: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface WishlistItem {
  id: string;
  product: Product;
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: any;
  paymentMethod?: string;
  notes?: string;
  items: OrderItem[];
  payment?: Payment | null;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItem {
  id: string;
  product: Product;
  variant: ProductVariant;
  vendor: {
    id: string;
    name: string;
    slug: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: OrderStatus;
}

export interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  user: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  rating: number;
  title?: string;
  body: string;
  status: string;
  response?: {
    id: string;
    body: string;
    createdAt: string;
  } | null;
  createdAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface PaginatedResponse<T> {
  items?: T[];
  products?: T[];
  vendors?: T[];
  orders?: T[];
  reviews?: T[];
  users?: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
}
