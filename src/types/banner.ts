export interface Banner {
  _id: string;
  image: string;
  bannerType: "Product" | "User" | "Offer" | "General";
  item?: string;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerPayload {
  image: string;
  bannerType: "Product" | "User" | "Offer" | "General";
  item?: string;
  order?: number;
}
