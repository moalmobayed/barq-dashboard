"use client";
import React, { useState, useEffect } from "react";
import { useProfile } from "../../hooks/useProfile";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Alert, { AlertProps } from "../ui/alert/Alert";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { profile, loading, updateProfile, error } = useProfile();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<AlertProps | null>(null);
  const [nameError, setNameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  // Name validation function
  const validateName = (name: string): string => {
    if (!name.trim()) {
      return "";
    }

    if (name.length < 2) {
      return "يجب أن لا يقل الاسم عن حرفين";
    }

    if (name.length > 30) {
      return "الاسم طويل جداً";
    }

    // Check for only Arabic, English, numbers, and spaces
    const validPattern =
      /^[\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9\s!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]+$/;
    if (!validPattern.test(name)) {
      return "الاسم يقبل حروف وأرقام ومسافات فقط";
    }

    // Check for leading or trailing spaces
    if (name.startsWith(" ") || name.endsWith(" ")) {
      return "لا يمكن أن يبدأ أو ينتهي الاسم بمسافة";
    }

    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(name)) {
      return "مسافة واحدة فقط بين الكلمات";
    }

    // Check if it's only spaces
    if (name.trim() === "") {
      return "الاسم لا يمكن أن يكون مسافات فقط";
    }

    return "";
  };

  // Email validation function
  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return "";
    }

    // Basic email pattern with at least 2 characters after the last dot
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(email)) {
      return "يرجى ادخال بريد إلكتروني صحيح";
    }

    return "";
  };

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
      });
      // Clear errors when profile loads
      setNameError("");
      setEmailError("");
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle name field validation
    if (name === "name") {
      // Limit to 30 characters
      if (value.length > 30) {
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setNameError(validateName(value));
    }
    // Handle email field validation
    else if (name === "email") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setEmailError(validateEmail(value));
    }
    // Handle other fields
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      // Validate all fields before submission
      const nameValidationError = validateName(formData.name);
      const emailValidationError = validateEmail(formData.email);

      setNameError(nameValidationError);
      setEmailError(emailValidationError);

      // Check if there are any validation errors
      if (nameValidationError || emailValidationError) {
        setIsSubmitting(false);
        return;
      }

      await updateProfile(formData);

      // Show success message
      setSuccessMessage({
        variant: "success",
        title: "نجح التحديث",
        message: "تم تحديث البيانات بنجاح",
      });

      // Auto hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);

      closeModal();
    } catch {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
        <div className="flex h-20 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4">
          <Alert {...successMessage} />
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
            المعلومات الشخصية
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                الاسم
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profile?.name || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                الدور
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profile?.role || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                البريد الالكتروني
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profile?.email || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                تاريخ الإنشاء
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("ar-EG")
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          تعديل
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[700px]">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
          <div className="px-2 pe-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              تعديل البيانات الشخصية
            </h4>
            <p className="mb-6 text-sm text-gray-500 lg:mb-7 dark:text-gray-400">
              قم بتحديث بياناتك لإبقاء ملفك الشخصي محدثًا.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[350px] overflow-y-auto px-2 pb-3">
              {error && (
                <div className="mb-4 rounded-lg border border-red-400 bg-red-100 p-3 text-red-700">
                  {error}
                </div>
              )}

              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
                  البيانات الأساسية
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                  <div>
                    <Label>الاسم</Label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="ادخل اسم المشرف"
                      error={!!nameError}
                      hint={nameError || `${formData.name.length}/30`}
                    />
                  </div>

                  <div>
                    <Label>البريد الالكتروني</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="ادخل البريد الإلكتروني للمشرف"
                      error={!!emailError}
                      hint={emailError || `${formData.email.length} حرف`}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                إغلاق
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
