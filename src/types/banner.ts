export interface Banner {
  _id: string;
  image: string;
  bannerType: "Product" | "User" | "Offer" | "General";
  item?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBannerPayload {
  image: string;
  bannerType: "Product" | "User" | "Offer" | "General";
  item?: string;
}
