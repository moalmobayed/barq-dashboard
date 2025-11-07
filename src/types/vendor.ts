import { Category } from "./category";
import { Subcategory } from "./subcategory";

// types/vendor.ts
export interface CreateVendorPayload {
  name: string;
  mobile: string;
  hotline?: string;
  location: string;
  workingHours: [string, string];
  isActive?: boolean;
  expectedTime: string;
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
  isActive?: boolean;
  location?: string;
  rating?: number;
  workingHours?: [string, string];
  expectedTime: string;
  category?: Category;
  subcategories?: Subcategory[];
  reviewCount?: number;
}
