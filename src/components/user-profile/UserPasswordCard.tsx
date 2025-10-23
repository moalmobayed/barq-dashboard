"use client";
import React, { useState } from "react";
import { useProfile } from "../../hooks/useProfile";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Alert, { AlertProps } from "../ui/alert/Alert";
import { getAdminData } from "@/lib/api/auth";
import { EyeCloseIcon, EyeIcon } from "../../../public/icons";

export default function UserPasswordCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { changePassword, error } = useProfile();
  const [formData, setFormData] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState<AlertProps | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const adminData = getAdminData();

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationError("");
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Check if all fields are filled
    if (!formData.currentPassword.trim()) {
      setValidationError("يرجى إدخال كلمة المرور الحالية");
      return;
    }

    if (!formData.password.trim()) {
      setValidationError("يرجى إدخال كلمة المرور الجديدة");
      return;
    }

    if (!formData.confirmPassword.trim()) {
      setValidationError("يرجى تأكيد كلمة المرور الجديدة");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("كلمة المرور الجديدة غير متطابقة");
      return;
    }

    if (formData.currentPassword === formData.password) {
      setValidationError(
        "كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية",
      );
      return;
    }

    if (formData.password.length < 6) {
      setValidationError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    try {
      setIsSubmitting(true);
      await changePassword({
        currentPassword: formData.currentPassword,
        password: formData.password,
      });
      setFormData({
        currentPassword: "",
        password: "",
        confirmPassword: "",
      });

      // Show success message
      setSuccessMessage({
        variant: "success",
        title: "نجح التحديث",
        message: "تم تغيير كلمة المرور بنجاح",
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

  return (
    <>
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
              كلمة المرور
            </h4>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  آخر تحديث لكلمة المرور:{" "}
                  <span className="text-gray-800 dark:text-white/90">
                    {adminData?.passwordChangedAt
                      ? new Date(
                          adminData.passwordChangedAt,
                        ).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "لم يتم تحديث كلمة المرور من قبل"}
                  </span>
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
                d="M9 0.75C4.44365 0.75 0.75 4.44365 0.75 9C0.75 13.5563 4.44365 17.25 9 17.25C13.5563 17.25 17.25 13.5563 17.25 9C17.25 4.44365 13.5563 0.75 9 0.75ZM2.25 9C2.25 5.27208 5.27208 2.25 9 2.25C12.7279 2.25 15.75 5.27208 15.75 9C15.75 12.7279 12.7279 15.75 9 15.75C5.27208 15.75 2.25 12.7279 2.25 9Z"
                fill=""
              />
              <path
                d="M11.25 6.75C11.6642 6.75 12 6.41421 12 6C12 5.58579 11.6642 5.25 11.25 5.25C10.8358 5.25 10.5 5.58579 10.5 6C10.5 6.41421 10.8358 6.75 11.25 6.75Z"
                fill=""
              />
              <path
                d="M11.25 12C11.6642 12 12 11.6642 12 11.25C12 10.8358 11.6642 10.5 11.25 10.5C10.8358 10.5 10.5 10.8358 10.5 11.25C10.5 11.6642 10.8358 12 11.25 12Z"
                fill=""
              />
            </svg>
            تغيير كلمة المرور
          </button>
        </div>

        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          className="m-4 max-w-[500px]"
        >
          <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-8 dark:bg-gray-900">
            <div className="px-2 pe-14">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                تغيير كلمة المرور
              </h4>
              <p className="mb-6 text-sm text-gray-500 lg:mb-7 dark:text-gray-400">
                قم بإدخال كلمة المرور الحالية والجديدة لتحديث كلمة المرور.
              </p>
            </div>
            <form className="flex flex-col" onSubmit={handleSave}>
              <div className="px-2 pb-3">
                {(error || validationError) && (
                  <div className="mb-4 rounded-lg border border-red-400 bg-red-100 p-3 text-red-700">
                    {validationError || error}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <Label>كلمة المرور الحالية</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="أدخل كلمة المرور الحالية"
                        className="pe-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPasswords.current ? (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label>كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.new ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="أدخل كلمة المرور الجديدة"
                        className="pe-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPasswords.new ? (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label>تأكيد كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="أعد إدخال كلمة المرور الجديدة"
                        className="pe-10"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPasswords.confirm ? (
                          <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                        ) : (
                          <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
                <Button size="sm" variant="outline" onClick={closeModal}>
                  إغلاق
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSave()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "جاري التحديث..." : "تحديث كلمة المرور"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </>
  );
}
