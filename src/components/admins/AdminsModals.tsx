// components/admins/AddAdminModal.tsx
"use client";

import React, { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { createAdmin, deleteAdmin, updateAdmin } from "@/lib/api/admins";
import { CreateAdminPayload, Admin } from "@/types/admin";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import Alert, { AlertProps } from "@/components/ui/alert/Alert";
import { useModal } from "@/hooks/useModal";
import { AxiosError } from "axios";
import { EyeCloseIcon, EyeIcon } from "../../../public/icons";

export function AddAdminModal({
  isOpen = false,
  closeModal = () => {},
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
  }>({
    name: "",
    email: "",
    password: "",
  });

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
    const validPattern = /^[\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9\s!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]+$/;
    if (!validPattern.test(name)) {
      return "الاسم يقبل حروف وأرقام ومسافات ورموز فقط";
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

  const handleChange = (
    field: string,
    value: string | string[] | File | undefined,
  ) => {
    if (typeof value === "string") {
      // Handle name field validation
      if (field === "name") {
        // Limit to 30 characters
        if (value.length > 30) {
          return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        setNameError(validateName(value));
      }
      // Handle email field validation
      else if (field === "email") {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setEmailError(validateEmail(value));
      }
      // Handle other fields
      else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Validate all fields before submission
      const nameValidationError = validateName(formData.name);
      const emailValidationError = validateEmail(formData.email);

      setNameError(nameValidationError);
      setEmailError(emailValidationError);

      // Check if there are any validation errors
      if (nameValidationError || emailValidationError) {
        setIsLoading(false);
        return;
      }

      // Validation for required fields
      if (!formData.name) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "اسم المشرف مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        setIsLoading(false);
        return;
      }
      if (!formData.email) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "البريد الإلكتروني مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        setIsLoading(false);
        return;
      }
      if (!formData.password) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "كلمة المرور مطلوبة.",
        });
        setTimeout(() => setToast(null), 5000);
        setIsLoading(false);
        return;
      }

      const payloadRaw: CreateAdminPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };
      // Remove empty-string fields
      const payload = Object.fromEntries(
        Object.entries(payloadRaw).filter((entry) => {
          const v = entry[1] as unknown;
          return typeof v === "string" ? v.trim() !== "" : true;
        }),
      ) as CreateAdminPayload;

      await createAdmin(payload);
      setToast({
        variant: "success",
        title: "نجح إنشاء المشرف",
        message: "تم إنشاء المشرف بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      setFormData({
        name: "",
        email: "",
        password: "",
      });
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في إنشاء المشرف",
          message:
            err.response?.data?.message ||
            "فشل في إنشاء المشرف. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
    });
    setEmailError("");
    setNameError("");
    setIsLoading(false);
    closeModal?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      className="z-50 m-4 max-w-[700px] bg-black"
    >
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
            <div>
              <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
                إضافة مشرف
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Name */}
                <div>
                  <Label>
                    الاسم <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="ادخل اسم المشرف"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    error={!!nameError}
                    hint={nameError || `${formData.name.length}/30`}
                    required
                  />
                </div>

                {/* البريد الإلكتروني */}
                <div>
                  <Label>
                    البريد الإلكتروني <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="ادخل البريد الإلكتروني للمشرف"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    error={!!emailError}
                    hint={emailError || `${formData.email.length} حرف`}
                    required
                  />
                </div>

                {/* كلمة المرور */}
                <div>
                  <Label>
                    كلمة المرور <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="ادخل كلمة المرور"
                      onChange={(e) => handleChange("password", e.target.value)}
                      className="pe-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showPassword ? (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="outline" onClick={handleModalClose}>
              إغلاق
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              {isLoading && (
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </div>
      {toast && (
        <div className="fixed end-4 top-4 z-[9999] max-w-sm">
          <Alert {...toast} />
        </div>
      )}
    </Modal>
  );
}

export function AddAdminButton({ onSuccess }: { onSuccess?: () => void }) {
  const { isOpen, openModal, closeModal } = useModal();

  const handleAfterCreate = async () => {
    onSuccess?.(); // call parent's refetch
    closeModal();
  };

  return (
    <>
      <Button size="md" variant="primary" onClick={openModal}>
        + إضافة مشرف
      </Button>
      <AddAdminModal
        isOpen={isOpen}
        closeModal={closeModal}
        onSuccess={handleAfterCreate}
      />
    </>
  );
}

export function EditAdminModal({
  isOpen = false,
  closeModal = () => {},
  admin = {} as Admin,
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
  }>({
    name: admin.name || "",
    email: admin.email || "",
    password: admin.password || "",
  });

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
    const validPattern = /^[\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9\s!@#$%^&*()_+={}\[\]|\\;:"'<>,.?/~`\-]+$/;
    if (!validPattern.test(name)) {
      return "الاسم يقبل حروف وأرقام ومسافات ورموز فقط";
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

  const handleChange = (
    field: string,
    value: string | string[] | File | undefined,
  ) => {
    if (typeof value === "string") {
      // Handle name field validation
      if (field === "name") {
        // Limit to 30 characters
        if (value.length > 30) {
          return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        setNameError(validateName(value));
      }
      // Handle email field validation
      else if (field === "email") {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setEmailError(validateEmail(value));
      }
      // Handle other fields
      else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Validate all fields before submission
      const nameValidationError = validateName(formData.name);
      const emailValidationError = validateEmail(formData.email);

      setNameError(nameValidationError);
      setEmailError(emailValidationError);

      // Check if there are any validation errors
      if (nameValidationError || emailValidationError) {
        setIsLoading(false);
        return;
      }

      const payloadRaw: Partial<CreateAdminPayload> = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };
      // Remove empty-string fields
      const payload = Object.fromEntries(
        Object.entries(payloadRaw).filter((entry) => {
          const v = entry[1] as unknown;
          return typeof v === "string" ? v.trim() !== "" : true;
        }),
      ) as Partial<CreateAdminPayload>;

      await updateAdmin(admin._id, payload);
      setToast({
        variant: "success",
        title: "نجح تحديث المشرف",
        message: "تم تحديث المشرف بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في تحديث المشرف",
          message:
            err.response?.data?.message ||
            "فشل في تحديث المشرف. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to update admin:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
   name: admin.name || "",
    email: admin.email || "",
    password: admin.password || "",
    });
    setEmailError("");
    setNameError("");
    setIsLoading(false);
    closeModal?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      className="z-50 m-4 max-w-[700px] bg-black"
    >
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
          <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
            <div>
              <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
                معلومات المشرف
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>الاسم</Label>
                  <Input
                    type="text"
                    placeholder="ادخل اسم المشرف"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    error={!!nameError}
                    hint={nameError || `${formData.name.length}/30`}
                    required
                  />
                </div>

                <div>
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    placeholder="ادخل البريد الإلكتروني للمشرف"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    error={!!emailError}
                    hint={emailError || `${formData.email.length} حرف`}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="outline" onClick={handleModalClose}>
              إغلاق
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              {isLoading && (
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              حفظ التغييرات
            </Button>
          </div>
        </form>
      </div>
      {toast && (
        <div className="fixed end-4 top-4 z-[9999] max-w-sm">
          <Alert {...toast} />
        </div>
      )}
    </Modal>
  );
}

export function EditAdminButton({
  admin,
  onSuccess,
}: {
  admin: Admin;
  onSuccess?: () => void;
}) {
  const { isOpen, openModal, closeModal } = useModal();

  const handleAfterEdit = async () => {
    onSuccess?.(); // call parent's refetch
    closeModal();
  };

  return (
    <>
      <button onClick={openModal} className="text-sm text-blue-500">
        <FaPencilAlt />
      </button>
      <EditAdminModal
        isOpen={isOpen}
        closeModal={closeModal}
        admin={admin}
        onSuccess={handleAfterEdit}
      />
    </>
  );
}

export function DeleteAdminModal({
  isOpen = false,
  closeModal = () => {},
  adminId = "",
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const handleDelete = async () => {
    try {
      await deleteAdmin(adminId);
      setToast({
        variant: "success",
        title: "نجح حذف المشرف",
        message: "تم حذف المشرف بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
      closeModal();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في حذف المشرف",
          message:
            err.response?.data?.message ||
            "فشل في حذف المشرف. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to delete admin:", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="z-50 m-4 max-w-[700px] bg-black"
    >
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
        <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
          <h4 className="mb-5 px-2 pb-3 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
            حذف المشرف
          </h4>

          <p className="text-gray-800 dark:text-white/90">
            هل أنت متأكد أنك تريد حذف هذا المشرف؟
          </p>

          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="outline" onClick={closeModal}>
              إغلاق
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              className="bg-error-500 hover:bg-error-700"
            >
              حذف
            </Button>
          </div>
        </form>
      </div>
      {toast && (
        <div className="fixed end-4 top-4 z-[9999] max-w-sm">
          <Alert {...toast} />
        </div>
      )}
    </Modal>
  );
}

export function DeleteAdminButton({
  adminId,
  onSuccess,
}: {
  adminId: string;
  onSuccess?: () => void;
}) {
  const { isOpen, openModal, closeModal } = useModal();

  const handleAfterDelete = async () => {
    onSuccess?.(); // call parent's refetch
    closeModal();
  };

  return (
    <>
      <button onClick={openModal} className="text-sm text-red-500">
        <FaTrashAlt />
      </button>
      <DeleteAdminModal
        isOpen={isOpen}
        closeModal={closeModal}
        adminId={adminId}
        onSuccess={handleAfterDelete}
      />
    </>
  );
}
