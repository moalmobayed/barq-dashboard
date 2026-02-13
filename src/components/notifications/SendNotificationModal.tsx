"use client";

import React, { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { SendNotificationPayload } from "@/types/notification";

interface SendNotificationModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSend: (payload: SendNotificationPayload) => Promise<void>;
}

export default function SendNotificationModal({
  isOpen,
  closeModal,
  onSend,
}: SendNotificationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [titleArError, setTitleArError] = useState("");
  const [titleEnError, setTitleEnError] = useState("");
  const [contentArError, setContentArError] = useState("");
  const [contentEnError, setContentEnError] = useState("");

  const [formData, setFormData] = useState<SendNotificationPayload>({
    titleAr: "",
    titleEn: "",
    contentAr: "",
    contentEn: "",
  });

  const validateTitleAr = (value: string): string => {
    if (!value || value.trim() === "") {
      return "العنوان بالعربية مطلوب";
    }
    if (value.length < 3) {
      return "العنوان يجب أن يكون 3 أحرف على الأقل";
    }
    if (value.length > 100) {
      return "العنوان يجب أن لا يزيد عن 100 حرف";
    }
    return "";
  };

  const validateTitleEn = (value: string): string => {
    if (!value || value.trim() === "") {
      return "";
    }
    if (value.length < 3) {
      return "العنوان يجب أن يكون 3 أحرف على الأقل";
    }
    if (value.length > 100) {
      return "العنوان يجب أن لا يزيد عن 100 حرف";
    }
    return "";
  };

  const validateContentAr = (value: string): string => {
    if (!value || value.trim() === "") {
      return "المحتوى بالعربية مطلوب";
    }
    if (value.length < 10) {
      return "المحتوى يجب أن يكون 10 أحرف على الأقل";
    }
    if (value.length > 500) {
      return "المحتوى يجب أن لا يزيد عن 500 حرف";
    }
    return "";
  };

  const validateContentEn = (value: string): string => {
    if (!value || value.trim() === "") {
      return "";
    }
    if (value.length < 10) {
      return "المحتوى يجب أن يكون 10 أحرف على الأقل";
    }
    if (value.length > 500) {
      return "المحتوى يجب أن لا يزيد عن 500 حرف";
    }
    return "";
  };

  const handleTitleArChange = (value: string) => {
    const limitedValue = value.slice(0, 100);
    setFormData((prev) => ({ ...prev, titleAr: limitedValue }));
    const error = validateTitleAr(limitedValue);
    setTitleArError(error);
  };

  const handleTitleEnChange = (value: string) => {
    const limitedValue = value.slice(0, 100);
    setFormData((prev) => ({ ...prev, titleEn: limitedValue }));
    const error = validateTitleEn(limitedValue);
    setTitleEnError(error);
  };

  const handleContentArChange = (value: string) => {
    const limitedValue = value.slice(0, 500);
    setFormData((prev) => ({ ...prev, contentAr: limitedValue }));
    const error = validateContentAr(limitedValue);
    setContentArError(error);
  };

  const handleContentEnChange = (value: string) => {
    const limitedValue = value.slice(0, 500);
    setFormData((prev) => ({ ...prev, contentEn: limitedValue }));
    const error = validateContentEn(limitedValue);
    setContentEnError(error);
  };

  const handleSubmit = async () => {
    // Validate all fields
    const titleArErr = validateTitleAr(formData.titleAr);
    const titleEnErr = validateTitleEn(formData.titleEn);
    const contentArErr = validateContentAr(formData.contentAr);
    const contentEnErr = validateContentEn(formData.contentEn);

    setTitleArError(titleArErr);
    setTitleEnError(titleEnErr);
    setContentArError(contentArErr);
    setContentEnError(contentEnErr);

    if (titleArErr || titleEnErr || contentArErr || contentEnErr) {
      return;
    }

    // Fallback English values to Arabic if empty
    const finalPayload: SendNotificationPayload = {
      titleAr: formData.titleAr,
      titleEn: formData.titleEn.trim() || formData.titleAr,
      contentAr: formData.contentAr,
      contentEn: formData.contentEn.trim() || formData.contentAr,
    };

    setIsLoading(true);
    try {
      await onSend(finalPayload);
      handleClose();
    } catch (error) {
      console.error("Error sending notification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      titleAr: "",
      titleEn: "",
      contentAr: "",
      contentEn: "",
    });
    setTitleArError("");
    setTitleEnError("");
    setContentArError("");
    setContentEnError("");
    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="z-50 m-4 max-w-[700px] bg-black"
    >
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
            <div>
              <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
                إرسال إشعار جديد
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>
                    العنوان بالعربية <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="ادخل عنوان الإشعار بالعربية"
                    value={formData.titleAr}
                    onChange={(e) => handleTitleArChange(e.target.value)}
                    error={!!titleArError}
                    hint={titleArError || `${formData.titleAr.length}/100`}
                    required
                  />
                </div>

                <div>
                  <Label>العنوان بالإنجليزية</Label>
                  <Input
                    type="text"
                    placeholder="Enter notification title in English"
                    value={formData.titleEn}
                    onChange={(e) => handleTitleEnChange(e.target.value)}
                    error={!!titleEnError}
                    hint={titleEnError || `${formData.titleEn.length}/100`}
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label>
                    المحتوى بالعربية <span className="text-error-500">*</span>
                  </Label>
                  <textarea
                    className={`w-full rounded-lg border ${
                      contentArError
                        ? "border-error-500"
                        : "border-gray-300 dark:border-gray-700"
                    } focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-3 focus:outline-none dark:border-gray-700 dark:text-white dark:placeholder-gray-500`}
                    placeholder="ادخل محتوى الإشعار بالعربية"
                    value={formData.contentAr}
                    onChange={(e) => handleContentArChange(e.target.value)}
                    rows={4}
                    required
                  />
                  <p
                    className={`mt-1 text-xs ${
                      contentArError ? "text-error-500" : "text-gray-500"
                    }`}
                  >
                    {contentArError || `${formData.contentAr.length}/500`}
                  </p>
                </div>

                <div className="lg:col-span-2">
                  <Label>المحتوى بالإنجليزية</Label>
                  <textarea
                    className={`w-full rounded-lg border ${
                      contentEnError
                        ? "border-error-500"
                        : "border-gray-300 dark:border-gray-700"
                    } focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-3 focus:outline-none dark:border-gray-700 dark:text-white dark:placeholder-gray-500`}
                    placeholder="Enter notification content in English"
                    value={formData.contentEn}
                    onChange={(e) => handleContentEnChange(e.target.value)}
                    rows={4}
                  />
                  <p
                    className={`mt-1 text-xs ${
                      contentEnError ? "text-error-500" : "text-gray-500"
                    }`}
                  >
                    {contentEnError || `${formData.contentEn.length}/500`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "جاري الإرسال..." : "إرسال الإشعار"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
