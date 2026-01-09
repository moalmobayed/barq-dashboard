import { Category } from "./category";
import { Subcategory } from "./subcategory";

// types/vendor.ts
export interface CreateVendorPayload {
  name: string;
  mobile: string;
  hotline?: string;
  location: string;
  workingHours: [string, string];
  status?: string;
  expectedTime: string;
  commissionRate: number;
  profileImage: string;
  coverImage?: string;
  category: string;
  subcategories: string[];
  role: string;
}

export interface Vendor {
  _id: string;
  name: string;
  mobile: string;
  hotline?: string;
  profileImage?: string;
  coverImage?: string;
  role: string;
  status?: string;
  location?: string;
  rating?: number;
  workingHours?: [string, string];
  expectedTime: string;
  commissionRate?: number;
  category?: Category;
  subcategories?: Subcategory[];
  reviewCount?: number;
}
