import { Metadata } from "next";
import NotificationsContent from "@/components/notifications/NotificationsContent";

export const metadata: Metadata = {
  title: "الإشعارات | برق",
  description: "هذه هي صفحة الإشعارات حيث يمكنك إدارة إشعارات النظام.",
};

export default function NotificationsPage() {
  return <NotificationsContent />;
}
