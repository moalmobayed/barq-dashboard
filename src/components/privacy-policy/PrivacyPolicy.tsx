"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import HTMLEditor from "@/components/form/HTMLEditor";
import Alert, { AlertProps } from "@/components/ui/alert/Alert";
import { getTerms, updateTerms, UpdateTermsPayload } from "@/lib/api/terms";
import { AxiosError } from "axios";
import PageBreadcrumb from "../common/PageBreadCrumb";

export default function PrivacyPolicyComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [formData, setFormData] = useState<UpdateTermsPayload>({
    termAr: "",
    termEn: "",
    descriptionAr: "",
    descriptionEn: "",
  });

  // Load existing terms data
  useEffect(() => {
    const loadTermsData = async () => {
      setIsLoading(true);
      try {
        const response = await getTerms();
        setFormData({
          termAr: response.data.termAr || "",
          termEn: response.data.termEn || "",
          descriptionAr: response.data.descriptionAr || "",
          descriptionEn: response.data.descriptionEn || "",
        });
      } catch (err) {
        console.error("Failed to load terms data:", err);
        setToast({
          variant: "error",
          title: "خطأ في تحميل البيانات",
          message: "فشل في تحميل بيانات سياسة الخصوصية",
        });
        setTimeout(() => setToast(null), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    loadTermsData();
  }, []);

  const handleFieldChange = (
    field: keyof UpdateTermsPayload,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Filter out empty fields
      const payload = Object.fromEntries(
        Object.entries(formData).filter(
          ([, value]) => typeof value === "string" && value.trim() !== "",
        ),
      ) as UpdateTermsPayload;

      if (Object.keys(payload).length === 0) {
        setToast({
          variant: "error",
          title: "حقول مطلوبة",
          message: "يرجى ملء حقل واحد على الأقل",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      await updateTerms(payload);
      setToast({
        variant: "success",
        title: "تم الحفظ بنجاح",
        message: "تم تحديث سياسة الخصوصية والشروط بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في الحفظ",
          message:
            err.response?.data?.message ||
            "فشل في حفظ التغييرات. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to save terms:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="border-brand-500 mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            جاري تحميل البيانات...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageBreadcrumb pageTitle="سياسة الخصوصية والشروط والأحكام" />

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          )}
          حفظ التغييرات
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Arabic Section */}
        <Card className="space-y-6 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            النسخة العربية
          </h2>

          {/* Arabic Title */}
          <div className="space-y-2">
            <Label htmlFor="termAr">العنوان بالعربية</Label>
            <HTMLEditor
              value={formData.termAr}
              onChange={(value) => handleFieldChange("termAr", value)}
              placeholder="أدخل عنوان سياسة الخصوصية بالعربية..."
              isRTL={true}
            />
          </div>

          {/* Arabic Description */}
          <div className="space-y-2">
            <Label htmlFor="descriptionAr">المحتوى بالعربية</Label>
            <HTMLEditor
              value={formData.descriptionAr}
              onChange={(value) => handleFieldChange("descriptionAr", value)}
              placeholder="أدخل محتوى سياسة الخصوصية بالعربية..."
              isRTL={true}
            />
          </div>
        </Card>

        {/* English Section */}
        <Card className="space-y-6 p-6">
          <h2 className="text-end text-xl font-semibold text-gray-900 dark:text-white">
            English Version
          </h2>

          {/* English Title */}
          <div className="space-y-2">
            <Label htmlFor="termEn" className="text-end">
              Title in English
            </Label>
            <HTMLEditor
              value={formData.termEn}
              onChange={(value) => handleFieldChange("termEn", value)}
              placeholder="Enter privacy policy title in English..."
            />
          </div>

          {/* English Description */}
          <div className="space-y-2">
            <Label htmlFor="descriptionEn" className="text-end">
              Content in English
            </Label>
            <HTMLEditor
              value={formData.descriptionEn}
              onChange={(value) => handleFieldChange("descriptionEn", value)}
              placeholder="Enter privacy policy content in English..."
            />
          </div>
        </Card>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed end-4 bottom-4 z-[9999] max-w-sm">
          <Alert {...toast} />
        </div>
      )}
    </div>
  );
}
