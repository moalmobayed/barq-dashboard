export interface Town {
  _id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  expectedTime?: number;
  commisionAmount?: number;
}

export interface CreateTownPayload {
  nameAr: string;
  nameEn: string;
  commisionAmount: number;
  expectedTime: number;
}
