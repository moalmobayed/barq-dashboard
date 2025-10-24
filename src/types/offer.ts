import { Product } from "./product";
import { Vendor } from "./vendor";

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

export interface Offer {
  _id: string;
  nameAr: string;
  nameEn: string;
  shopId: Vendor;
  product: Product;
  image: string;
  descriptionAr: string;
  descriptionEn: string;
  discount: number;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
}
