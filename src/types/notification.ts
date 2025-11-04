export interface Notification {
  _id: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  seen: boolean;
  metadata?: string;
  type: string;
  user: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  data: number;
}

export interface MarkSeenResponse {
  message: string;
}

export interface SendNotificationPayload {
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
}

export interface SendNotificationResponse {
  message: string;
}
