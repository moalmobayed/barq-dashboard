// types/customer.ts
export interface CreateCustomerPayload {
  name: string;
  mobile: string;
  profileImage?: string;
  location: [number, number];
  fullAddress: string;
  addressLabel: string;
  town: string;
  isDefault: boolean;
}

export interface Customer {
  _id: string;
  name: string;
  mobile: string;
  defaultAddress: string;
  loyalPoints: number;
  role: "customer";
}
