import React from "react";
import { Metadata } from "next";
import TermsComponent from "@/components/terms-and-conditions/Terms";

export const metadata: Metadata = {
  title: "الشروط والأحكام | برق",
  description:
    "هذه هي صفحة الشروط والأحكام حيث يمكنك إدارة نص الشروط والأحكام.",
};

export default function TermsPage() {
  return <TermsComponent />;
}
