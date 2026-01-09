export interface Category {
  _id: string;
  nameAr: string;
  nameEn: string;
  image?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryPayload {
  nameAr: string;
  nameEn: string;
  image: string;
  order?: number;
}
