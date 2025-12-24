"use client";

import React, { useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Switch from "../form/switch/Switch";
import { CreateTownPayload, Town } from "@/types/town";
import { createTown, deleteTown, updateTown } from "@/lib/api/towns";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import Alert, { AlertProps } from "@/components/ui/alert/Alert";
import { AxiosError } from "axios";

export function AddTownModal({
  isOpen = false,
  closeModal = () => {},
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameArError, setNameArError] = useState<string>("");
  const [nameEnError, setNameEnError] = useState<string>("");
  const [formData, setFormData] = useState<{
    nameAr: string;
    nameEn: string;
    commisionAmount: number;
    expectedTime: number;
    isActive: boolean;
  }>({
    nameAr: "",
    nameEn: "",
    commisionAmount: 0,
    expectedTime: 0,
    isActive: true,
  });

  // Arabic name validation function
  const validateNameAr = (name: string): string => {
    // Remove extra spaces and normalize
    const normalizedName = name.replace(/\s+/g, " ").trim();

    // Check if only spaces
    if (name.trim() === "") {
      return "";
    }

    // Check minimum length (2 characters excluding spaces)
    const nameWithoutSpaces = normalizedName.replace(/\s/g, "");
    if (nameWithoutSpaces.length < 2) {
      return "يجب أن لا يقل الاسم عن حرفين";
    }

    // Check for invalid characters (only allow Arabic letters and spaces)
    const validPattern =
      /^[\u0600-\u06FF\s!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]+$/;
    if (!validPattern.test(normalizedName)) {
      return "الاسم يقبل الحروف العربية والمسافات فقط";
    }

    return "";
  };

  // English name validation function
  const validateNameEn = (name: string): string => {
    // Remove extra spaces and normalize
    const normalizedName = name.replace(/\s+/g, " ").trim();

    // Check if only spaces
    if (name.trim() === "") {
      return "";
    }

    // Check minimum length (2 characters excluding spaces)
    const nameWithoutSpaces = normalizedName.replace(/\s/g, "");
    if (nameWithoutSpaces.length < 2) {
      return "يجب أن لا يقل الاسم عن حرفين";
    }

    // Check for invalid characters (only allow English letters and spaces)
    const validPattern = /^[a-zA-Z\s!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]+$/;
    if (!validPattern.test(normalizedName)) {
      return "الاسم يقبل الحروف الإنجليزية والمسافات فقط";
    }

    return "";
  };

  const handleNameArChange = (value: string) => {
    // Limit to 30 characters
    const limitedValue = value.slice(0, 30);

    // Prevent multiple consecutive spaces
    let processedValue = limitedValue.replace(/\s{2,}/g, " ");

    // Prevent leading space
    if (processedValue.startsWith(" ")) {
      processedValue = processedValue.slice(1);
    }

    // Prevent trailing space
    if (processedValue.endsWith(" ") && processedValue.length > 1) {
      // Allow one space if user is typing, but prevent multiple trailing spaces
      const beforeLastChar = processedValue.slice(-2, -1);
      if (beforeLastChar === " ") {
        processedValue = processedValue.slice(0, -1);
      }
    }

    setFormData((prev) => ({ ...prev, nameAr: processedValue }));

    // Validate and set error
    const error = validateNameAr(processedValue);
    setNameArError(error);
  };

  const handleNameEnChange = (value: string) => {
    // Limit to 30 characters
    const limitedValue = value.slice(0, 30);

    // Prevent multiple consecutive spaces
    let processedValue = limitedValue.replace(/\s{2,}/g, " ");

    // Prevent leading space
    if (processedValue.startsWith(" ")) {
      processedValue = processedValue.slice(1);
    }

    // Prevent trailing space
    if (processedValue.endsWith(" ") && processedValue.length > 1) {
      // Allow one space if user is typing, but prevent multiple trailing spaces
      const beforeLastChar = processedValue.slice(-2, -1);
      if (beforeLastChar === " ") {
        processedValue = processedValue.slice(0, -1);
      }
    }

    setFormData((prev) => ({ ...prev, nameEn: processedValue }));

    // Validate and set error
    const error = validateNameEn(processedValue);
    setNameEnError(error);
  };

  const handleChange = (
    field: string,
    value: string | string[] | File | undefined,
  ) => {
    if (field === "nameAr" && typeof value === "string") {
      handleNameArChange(value);
    } else if (field === "nameEn" && typeof value === "string") {
      handleNameEnChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Validation for required fields
      if (!formData.nameAr) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "الاسم (بالعربية) مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      // Check for Arabic name validation errors
      const nameArValidationError = validateNameAr(formData.nameAr);
      if (nameArValidationError) {
        setToast({
          variant: "error",
          title: "خطأ في الاسم بالعربية",
          message: nameArValidationError,
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      // Check for English name validation errors if provided
      if (formData.nameEn.trim()) {
        const nameEnValidationError = validateNameEn(formData.nameEn);
        if (nameEnValidationError) {
          setToast({
            variant: "error",
            title: "خطأ في الاسم بالإنجليزية",
            message: nameEnValidationError,
          });
          setTimeout(() => setToast(null), 5000);
          return;
        }
      }

      // nameEn optional: fallback to nameAr if empty
      const effectiveNameEn = formData.nameEn?.trim()
        ? formData.nameEn.trim()
        : formData.nameAr.trim();

      const payloadRaw: CreateTownPayload = {
        nameAr: formData.nameAr,
        nameEn: effectiveNameEn,
        commisionAmount: formData.commisionAmount,
        expectedTime: formData.expectedTime,
        isActive: formData.isActive,
      };
      // Remove empty-string fields
      const payload = Object.fromEntries(
        Object.entries(payloadRaw).filter((entry) => {
          const v = entry[1] as unknown;
          return typeof v === "string" ? v.trim() !== "" : true;
        }),
      ) as CreateTownPayload;

      await createTown(payload);
      setToast({
        variant: "success",
        title: "نجح إنشاء المنطقة",
        message: "تم إنشاء المنطقة بنجاح",
      });
      setFormData({
        nameAr: "",
        nameEn: "",
        commisionAmount: 0,
        expectedTime: 0,
        isActive: true,
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في إنشاء المنطقة",
          message:
            err.response?.data?.message ||
            "فشل في إنشاء المنطقة. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to add town:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      nameAr: "",
      nameEn: "",
      commisionAmount: 0,
      expectedTime: 0,
      isActive: true,
    });
    setNameArError("");
    setNameEnError("");
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
                إضافة منطقة
              </h5>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Name (in Arabic) */}
                <div>
                  <Label>
                    الاسم (بالعربية) <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="ادخل اسم المنطقة بالعربي"
                    value={formData.nameAr}
                    onChange={(e) => handleChange("nameAr", e.target.value)}
                    error={!!nameArError}
                    hint={nameArError || `${formData.nameAr.length}/30`}
                    required
                  />
                </div>

                {/* Name (in English) */}
                <div>
                  <Label>الاسم (بالإنجليزية)</Label>
                  <Input
                    type="text"
                    placeholder="Enter the area name in English"
                    value={formData.nameEn}
                    onChange={(e) => handleChange("nameEn", e.target.value)}
                    error={!!nameEnError}
                    hint={nameEnError || `${formData.nameEn.length}/30`}
                    dir="ltr"
                  />
                </div>

                {/* Commission Amount */}
                <div>
                  <Label>
                    مبلغ التوصيل <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    defaultValue={formData.commisionAmount}
                    onChange={(e) =>
                      handleChange("commisionAmount", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Expected Time */}
                <div>
                  <Label>
                    الوقت المتوقع (بالدقائق){" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="0"
                    defaultValue={formData.expectedTime}
                    onChange={(e) =>
                      handleChange("expectedTime", e.target.value)
                    }
                    required
                  />
                </div>

                {/* Active */}
                <div>
                  <Label>نشط</Label>
                  <Switch
                    label=""
                    defaultChecked={formData.isActive}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: !prev.isActive,
                      }))
                    }
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
      {/* Toast Notification */}
      {toast && (
        <div className="fixed end-4 top-4 max-w-sm">
          <Alert {...toast} />
        </div>
      )}
    </Modal>
  );
}

export function AddTownButton({ onSuccess }: { onSuccess?: () => void }) {
  const { isOpen, openModal, closeModal } = useModal();

  const handleAfterCreate = async () => {
    onSuccess?.(); // call parent's refetch
    closeModal();
  };

  return (
    <>
      <Button size="md" variant="primary" onClick={openModal}>
        + أضف منطقة
      </Button>
      <AddTownModal
        isOpen={isOpen}
        closeModal={closeModal}
        onSuccess={handleAfterCreate}
      />
    </>
  );
}

export function EditTownModal({
  isOpen = false,
  closeModal = () => {},
  town = {} as Town,
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameArError, setNameArError] = useState<string>("");
  const [nameEnError, setNameEnError] = useState<string>("");
  const [formData, setFormData] = useState<{
    nameAr: string;
    nameEn: string;
    commisionAmount: number;
    expectedTime: number;
    isActive: boolean;
  }>({
    nameAr: town.nameAr || "",
    nameEn: town.nameEn || "",
    commisionAmount: town.commisionAmount || 0,
    expectedTime: town.expectedTime || 0,
    isActive: town.isActive !== undefined ? town.isActive : true,
  });

  // Arabic name validation function
  const validateNameAr = (name: string): string => {
    // Remove extra spaces and normalize
    const normalizedName = name.replace(/\s+/g, " ").trim();

    // Check if only spaces
    if (name.trim() === "") {
      return "";
    }

    // Check minimum length (2 characters excluding spaces)
    const nameWithoutSpaces = normalizedName.replace(/\s/g, "");
    if (nameWithoutSpaces.length < 2) {
      return "يجب أن لا يقل الاسم عن حرفين";
    }

    // Check for invalid characters (only allow Arabic letters and spaces)
    const validPattern =
      /^[\u0600-\u06FF\s!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]+$/;
    if (!validPattern.test(normalizedName)) {
      return "الاسم يقبل الحروف العربية والمسافات فقط";
    }

    return "";
  };

  // English name validation function
  const validateNameEn = (name: string): string => {
    // Remove extra spaces and normalize
    const normalizedName = name.replace(/\s+/g, " ").trim();

    // Check if only spaces
    if (name.trim() === "") {
      return "";
    }

    // Check minimum length (2 characters excluding spaces)
    const nameWithoutSpaces = normalizedName.replace(/\s/g, "");
    if (nameWithoutSpaces.length < 2) {
      return "يجب أن لا يقل الاسم عن حرفين";
    }

    // Check for invalid characters (only allow English letters and spaces)
    const validPattern = /^[a-zA-Z\s!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]+$/;
    if (!validPattern.test(normalizedName)) {
      return "الاسم يقبل الحروف الإنجليزية والمسافات فقط";
    }

    return "";
  };

  const handleNameArChange = (value: string) => {
    // Limit to 30 characters
    const limitedValue = value.slice(0, 30);

    // Prevent multiple consecutive spaces
    let processedValue = limitedValue.replace(/\s{2,}/g, " ");

    // Prevent leading space
    if (processedValue.startsWith(" ")) {
      processedValue = processedValue.slice(1);
    }

    // Prevent trailing space
    if (processedValue.endsWith(" ") && processedValue.length > 1) {
      // Allow one space if user is typing, but prevent multiple trailing spaces
      const beforeLastChar = processedValue.slice(-2, -1);
      if (beforeLastChar === " ") {
        processedValue = processedValue.slice(0, -1);
      }
    }

    setFormData((prev) => ({ ...prev, nameAr: processedValue }));

    // Validate and set error
    const error = validateNameAr(processedValue);
    setNameArError(error);
  };

  const handleNameEnChange = (value: string) => {
    // Limit to 30 characters
    const limitedValue = value.slice(0, 30);

    // Prevent multiple consecutive spaces
    let processedValue = limitedValue.replace(/\s{2,}/g, " ");

    // Prevent leading space
    if (processedValue.startsWith(" ")) {
      processedValue = processedValue.slice(1);
    }

    // Prevent trailing space
    if (processedValue.endsWith(" ") && processedValue.length > 1) {
      // Allow one space if user is typing, but prevent multiple trailing spaces
      const beforeLastChar = processedValue.slice(-2, -1);
      if (beforeLastChar === " ") {
        processedValue = processedValue.slice(0, -1);
      }
    }

    setFormData((prev) => ({ ...prev, nameEn: processedValue }));

    // Validate and set error
    const error = validateNameEn(processedValue);
    setNameEnError(error);
  };

  const handleChange = (
    field: string,
    value: string | string[] | File | undefined,
  ) => {
    if (field === "nameAr" && typeof value === "string") {
      handleNameArChange(value);
    } else if (field === "nameEn" && typeof value === "string") {
      handleNameEnChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Check for Arabic name validation errors
      if (formData.nameAr.trim()) {
        const nameArValidationError = validateNameAr(formData.nameAr);
        if (nameArValidationError) {
          setToast({
            variant: "error",
            title: "خطأ في الاسم بالعربية",
            message: nameArValidationError,
          });
          setTimeout(() => setToast(null), 5000);
          setIsLoading(false);
          return;
        }
      }

      // Check for English name validation errors if provided
      if (formData.nameEn.trim()) {
        const nameEnValidationError = validateNameEn(formData.nameEn);
        if (nameEnValidationError) {
          setToast({
            variant: "error",
            title: "خطأ في الاسم بالإنجليزية",
            message: nameEnValidationError,
          });
          setTimeout(() => setToast(null), 5000);
          setIsLoading(false);
          return;
        }
      }

      const payloadRaw: Partial<CreateTownPayload> = {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn?.trim()
          ? formData.nameEn.trim()
          : formData.nameAr.trim(),
        commisionAmount: formData.commisionAmount,
        expectedTime: formData.expectedTime,
        isActive: formData.isActive,
      };
      // Remove empty-string fields
      const payload = Object.fromEntries(
        Object.entries(payloadRaw).filter((entry) => {
          const v = entry[1] as unknown;
          return typeof v === "string" ? v.trim() !== "" : true;
        }),
      ) as Partial<CreateTownPayload>;

      await updateTown(town._id, payload);
      setToast({
        variant: "success",
        title: "نجح تحديث المنطقة",
        message: "تم تحديث المنطقة بنجاح",
      });

      // Auto hide toast after 5 seconds
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في تحديث المنطقة",
          message:
            err.response?.data?.message ||
            "فشل في تحديث المنطقة. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to update town:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      nameAr: town.nameAr || "",
      nameEn: town.nameEn || "",
      commisionAmount: town.commisionAmount || 0,
      expectedTime: town.expectedTime || 0,
      isActive: town.isActive !== undefined ? town.isActive : true,
    });
    setNameArError("");
    setNameEnError("");
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
                معلومات المنطقة
              </h5>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Name (in Arabic) */}
                <div>
                  <Label>الاسم (بالعربية)</Label>
                  <Input
                    type="text"
                    placeholder="ادخل اسم المنطقة بالعربي"
                    value={formData.nameAr}
                    onChange={(e) => handleChange("nameAr", e.target.value)}
                    error={!!nameArError}
                    hint={nameArError || `${formData.nameAr.length}/30`}
                  />
                </div>

                {/* Name (in English) */}
                <div>
                  <Label>الاسم (بالإنجليزية)</Label>
                  <Input
                    type="text"
                    placeholder="Enter the area name in English"
                    value={formData.nameEn}
                    onChange={(e) => handleChange("nameEn", e.target.value)}
                    error={!!nameEnError}
                    hint={nameEnError || `${formData.nameEn.length}/30`}
                    dir="ltr"
                  />
                </div>

                {/* Commission Amount */}
                <div>
                  <Label>مبلغ التوصيل</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    defaultValue={formData.commisionAmount}
                    onChange={(e) =>
                      handleChange("commisionAmount", e.target.value)
                    }
                  />
                </div>

                {/* Expected Time */}
                <div>
                  <Label>الوقت المتوقع</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    defaultValue={formData.expectedTime}
                    onChange={(e) =>
                      handleChange("expectedTime", e.target.value)
                    }
                  />
                </div>

                {/* Active */}
                <div>
                  <Label>نشط</Label>
                  <Switch
                    label=""
                    defaultChecked={formData.isActive}
                    onChange={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: !prev.isActive,
                      }))
                    }
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
      {/* Toast Notification */}
      {toast && (
        <div className="fixed end-4 top-4 z-[9999] max-w-sm">
          <Alert {...toast} />
        </div>
      )}
    </Modal>
  );
}

export function EditTownButton({
  town,
  onSuccess,
}: {
  town: Town;
  onSuccess?: () => void;
}) {
  const { isOpen, openModal, closeModal } = useModal();

  const handleAfterEdit = async () => {
    onSuccess?.(); // call parent's refetch
    closeModal();
  };

  return (
    <>
      <button
        onClick={openModal}
        className="text-sm text-blue-500 hover:underline"
      >
        <FaPencilAlt />
      </button>
      <EditTownModal
        isOpen={isOpen}
        closeModal={closeModal}
        town={town}
        onSuccess={handleAfterEdit}
      />
    </>
  );
}

export function DeleteTownModal({
  isOpen = false,
  closeModal = () => {},
  town = "",
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const handleDelete = async () => {
    try {
      await deleteTown(town);
      setToast({
        variant: "success",
        title: "نجح حذف المنطقة",
        message: "تم حذف المنطقة بنجاح",
      });

      // Auto hide toast after 5 seconds
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في حذف المنطقة",
          message:
            err.response?.data?.message ||
            "فشل في حذف المنطقة. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }

      // Auto hide toast after 5 seconds
      setTimeout(() => setToast(null), 5000);

      console.error("Failed to delete town:", err);
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
            حذف المنطقة
          </h4>

          <p>هل أنت متأكد من حذف هذا المنطقة؟</p>

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
      {/* Toast Notification */}
      {toast && (
        <div className="fixed end-4 top-4 z-[9999] max-w-sm">
          <Alert {...toast} />
        </div>
      )}
    </Modal>
  );
}

export function DeleteTownButton({
  town,
  onSuccess,
}: {
  town: string;
  onSuccess?: () => void;
}) {
  const { isOpen, openModal, closeModal } = useModal();

  const handleAfterDelete = async () => {
    onSuccess?.(); // call parent's refetch
    closeModal();
  };

  return (
    <>
      <button
        onClick={openModal}
        className="text-sm text-red-500 hover:underline"
      >
        <FaTrashAlt />
      </button>
      <DeleteTownModal
        isOpen={isOpen}
        closeModal={closeModal}
        town={town}
        onSuccess={handleAfterDelete}
      />
    </>
  );
}
