// types/agent.ts
export interface CreateCustomerPayload {
  name: string;
  mobile: string;
  defaultAddress: string;
  role: "customer";
}

export interface Customer {
  _id: string;
  name: string;
  mobile: string;
  defaultAddress: string;
  loyalPoints: number;
  role: "customer";
}
