export interface CreateProductPayload {
  nameAr: string;
  nameEn: string;
  price: number;
  amount: number;
  shopId: string;
  description: string;
  category: string;
  image?: string;
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
  description: string;
  category: {
    _id: string;
    nameAr: string;
    nameEn: string;
  };
  rating: number;
  image: string;
  soldTimes: number;
  reviewCount: number;
  cartQuantity?: number;
  isInWishlist?: boolean;
}
