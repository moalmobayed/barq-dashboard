import { Vendor } from "./vendor";
import { Product } from "./product";
import { SetStateAction } from "react";
import { Town } from "./town";

export type Coordinates = [number, number];

export interface OrderUserRef {
  _id: string;
  mobile: string;
  id: string;
  name: string;
}

export interface DeliveryAddress {
  _id: string;
  user: string; // user id
  location: Coordinates;
  fullAddress: string;
  addressLabel: string;
  town: string; // town id
}

export interface DeliveryAgent {
  _id: string;
  name: string;
  mobile: string;
  role: string;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  id: string;
}

export interface OrderItem {
  _id: string;
  itemId: Product; // reference to product with snapshot fields
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface Order {
  data: SetStateAction<Order | null>;
  _id: string;
  userId: OrderUserRef;
  shopId: Vendor;
  items: OrderItem[];
  totalAmount: number;
  totalDiscount: number;
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: "cash" | "card";
  orderStatus: "pending" | "processing" | "completed" | "cancelled" | "shipped";
  town: Town;
  deliveryAddress: DeliveryAddress;
  commisionAmount: number;
  deliveryAgent: DeliveryAgent;
  createdAt?: string;
  updatedAt?: string;
  orderNumber?: string;
  sumAmount?: number;
  deliveryFee?: number;
  agentCommissionRate: number;
  vendorCommissionRate: number;
  agentCommissionAmount: number;
  vendorCommissionAmount: number;
  agentEarn: number;
  vendorEarn: number;
  gainedPoints: number;
  redeemedPoints: number;
  isDeleted: boolean;
  pointsDiscount: number;
  review?: {
    content: string;
    rating: number;
  };
}
