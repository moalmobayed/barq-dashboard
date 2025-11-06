export interface CreateProductPayload {
  nameAr: string;
  nameEn: string;
  price: number;
  amount?: number;
  shopId: string;
  descriptionEn: string;
  descriptionAr: string;
  category: string;
  image?: string;
  images?: string[];
}

export interface Product {
  _id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  amount: number;
  shopId: {
    _id: string;
    name: string;
    mobile: string;
    rating: number;
    profileImage: string;
  };
  descriptionEn: string;
  descriptionAr: string;
  category: {
    _id: string;
    nameAr: string;
    nameEn: string;
  };
  rating: number;
  image: string;
  images: string[];
  soldTimes: number;
  reviewCount: number;
  cartQuantity?: number;
  isInWishlist?: boolean;
  createdAt: string;
  updatedAt: string;
}
