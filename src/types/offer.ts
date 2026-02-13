import { Product } from "./product";
import { Vendor } from "./vendor";

export type OfferType = "single" | "package" | "delivery";

// types/offer.ts
export interface CreateOfferPayload {
  nameAr: string;
  nameEn: string;
  product: string;
  image: string;
  descriptionAr: string;
  descriptionEn: string;
  discount: number;
  startDate: Date;
  endDate: Date;
  shopId: string;
}

export interface CreatePackageOfferPayload {
  nameAr: string;
  nameEn: string;
  price: number;
  shopId: string;
  descriptionAr: string;
  descriptionEn: string;
  image: string;
  products: string[];
  startDate: Date;
  endDate: Date;
}

export interface CreateDeliveryOfferPayload {
  shopId: string;
  discount: number;
  startDate: Date;
  endDate: Date;
  descriptionAr: string;
  descriptionEn: string;
}

export interface Offer {
  _id: string;
  offerType?: OfferType;
  nameAr?: string;
  nameEn?: string;
  shopId: Vendor | string;
  product?: Product; // For single product offers
  products?: Product[]; // For package offers
  productType?: string; // "package" for package offers
  price?: number; // For package offers
  image?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  discount?: number; // For single/delivery offers
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
  createdAt?: string;
}
