// types/customer.ts
export interface CreateCustomerPayload {
  name: string;
  mobile: string;
  profileImage?: string;
  defaultAddress: {
    addressLabel?: string;
    fullAddress?: string;
    location?: [number, number];
    town?: string;
  };
  isDefault: boolean;
}

export interface Customer {
  _id: string;
  name: string;
  mobile: string;
  defaultAddress: {
    addressLabel?: string;
    fullAddress?: string;
    location?: [number, number];
    town?: string;
  };
  loyalPoints: number;
  role: "customer";
}
