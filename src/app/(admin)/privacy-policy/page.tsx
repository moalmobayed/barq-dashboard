import React from "react";
import { Metadata } from "next";
import PrivacyPolicyComponent from "@/components/privacy-policy/PrivacyPolicy";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | برق",
  description:
    "هذه هي صفحة سياسة الخصوصية حيث يمكنك إدارة بيانات سياسة الخصوصية.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyComponent />;
}
