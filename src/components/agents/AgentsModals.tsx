// components/agents/AddAgentModal.tsx
"use client";

import React, { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useModal } from "@/hooks/useModal";
import { createAgent, deleteAgent, updateAgent } from "@/lib/api/agents";
import { CreateAgentPayload, Agent } from "@/types/agent";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import Alert, { AlertProps } from "@/components/ui/alert/Alert";
import { AxiosError } from "axios";
import Switch from "../form/switch/Switch";

export function AddAgentModal({
  isOpen = false,
  closeModal = () => {},
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string>("");
  const [mobileError, setMobileError] = useState<string>("");
  const [commissionRateError, setCommissionRateError] = useState<string>("");
  const [formData, setFormData] = useState<{
    name: string;
    mobile: string;
    commissionRate: number;
  }>({
    name: "",
    mobile: "",
    commissionRate: 0,
  });

  // Name validation function
  const validateName = (name: string): string => {
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

    // Check for invalid characters (only allow Arabic, English letters and spaces)
    const validPattern = /^[\u0600-\u06FFa-zA-Z\s]+$/;
    if (!validPattern.test(normalizedName)) {
      return "الاسم يقبل الحروف والمسافات فقط";
    }

    return "";
  };

  // Mobile validation function
  const validateMobile = (mobile: string): string => {
    // Check if empty
    if (!mobile || mobile.trim() === "") {
      return "";
    }

    // Check if only numbers
    const numbersOnly = /^[0-9]+$/;
    if (!numbersOnly.test(mobile)) {
      return "رقم الهاتف يقبل الأرقام فقط";
    }

    // Check minimum length (5-11 digits)
    if (mobile.length < 5 || mobile.length > 11) {
      return "يرجى ادخال رقم الهاتف الصحيح";
    }

    return "";
  };

  const handleNameChange = (value: string) => {
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

    setFormData((prev) => ({ ...prev, name: processedValue }));

    // Validate and set error
    const error = validateName(processedValue);
    setNameError(error);
  };

  const handleMobileChange = (value: string) => {
    // Only allow numbers, limit to 11 digits
    const numbersOnly = value.replace(/[^0-9]/g, "");
    const limitedValue = numbersOnly.slice(0, 11);

    setFormData((prev) => ({ ...prev, mobile: limitedValue }));

    // Validate and set error
    const error = validateMobile(limitedValue);
    setMobileError(error);
  };

  // Commission Rate validation function
  const validateCommissionRate = (rate: string): string => {
    if (!rate || rate.trim() === "") {
      return "";
    }

    const rateNum = parseFloat(rate);

    if (isNaN(rateNum)) {
      return "يجب أن تكون نسبة العمولة رقماً";
    }

    if (rateNum < 0) {
      return "يجب أن تكون نسبة العمولة صفر أو أكثر";
    }

    if (rateNum > 100) {
      return "يجب أن لا تزيد نسبة العمولة عن 100%";
    }

    return "";
  };

  const handleCommissionRateChange = (value: string) => {
    // Only allow integers (no decimal points)
    const numbersOnly = value.replace(/[^0-9]/g, "");
    // Limit to 3 digits (max 100)
    const limitedValue = numbersOnly.slice(0, 3);

    const numValue = parseInt(limitedValue) || 0;
    setFormData((prev) => ({ ...prev, commissionRate: numValue }));

    const error = validateCommissionRate(limitedValue);
    setCommissionRateError(error);
  };

  const handleChange = (
    field: string,
    value: string | string[] | File | undefined,
  ) => {
    if (field === "name" && typeof value === "string") {
      handleNameChange(value);
    } else if (field === "mobile" && typeof value === "string") {
      handleMobileChange(value);
    } else if (field === "commissionRate" && typeof value === "string") {
      handleCommissionRateChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Validation for required fields
      if (!formData.name) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "اسم عامل التوصيل مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      // Check for name validation errors
      const nameValidationError = validateName(formData.name);
      if (nameValidationError) {
        setToast({
          variant: "error",
          title: "خطأ في الاسم",
          message: nameValidationError,
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      if (!formData.mobile) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "رقم الهاتف مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      // Check for mobile validation errors
      const mobileValidationError = validateMobile(formData.mobile);
      if (mobileValidationError) {
        setToast({
          variant: "error",
          title: "خطأ في رقم الهاتف",
          message: mobileValidationError,
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      // Check for commissionRate validation errors
      const commissionRateValidationError = validateCommissionRate(
        formData.commissionRate.toString(),
      );
      if (commissionRateValidationError) {
        setToast({
          variant: "error",
          title: "خطأ في نسبة العمولة",
          message: commissionRateValidationError,
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      const payloadRaw: CreateAgentPayload = {
        name: formData.name,
        mobile: formData.mobile,
        commissionRate: formData.commissionRate,
        role: "delivery-agent",
      };
      // Remove empty-string fields
      const payload = Object.fromEntries(
        Object.entries(payloadRaw).filter((entry) => {
          const v = entry[1] as unknown;
          return typeof v === "string" ? v.trim() !== "" : true;
        }),
      ) as CreateAgentPayload;

      await createAgent(payload);
      setToast({
        variant: "success",
        title: "نجح إنشاء عامل التوصيل",
        message: "تم إنشاء عامل التوصيل بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      setFormData({
        name: "",
        mobile: "",
        commissionRate: 0,
      });
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في إنشاء عامل التوصيل",
          message:
            err.response?.data?.message ||
            "فشل في إنشاء عامل التوصيل. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to add agent:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      name: "",
      mobile: "",
      commissionRate: 0,
    });
    setMobileError("");
    setNameError("");
    setCommissionRateError("");
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
                إضافة عامل توصيل
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Name */}
                <div>
                  <Label>
                    الاسم <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="ادخل اسم عامل التوصيل"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    error={!!nameError}
                    hint={nameError || `${formData.name.length}/30`}
                    required
                  />
                </div>

                {/* Mobile */}
                <div>
                  <Label>
                    الهاتف <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="ادخل رقم هاتف عامل التوصيل"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    error={!!mobileError}
                    hint={mobileError || `${formData.mobile.length}/11`}
                    required
                  />
                </div>

                {/* Comission Rate */}
                <div>
                  <Label>معدل العمولة (%)</Label>
                  <Input
                    type="number"
                    placeholder="ادخل معدل العمولة"
                    value={formData.commissionRate}
                    onChange={(e) =>
                      handleChange("commissionRate", e.target.value)
                    }
                    error={!!commissionRateError}
                    hint={commissionRateError}
                    required
                    min="0"
                    max="100"
                    step={1}
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

export function AddAgentButton({ onSuccess }: { onSuccess?: () => void }) {
  const { isOpen, openModal, closeModal } = useModal();

  const handleAfterCreate = async () => {
    onSuccess?.(); // call parent's refetch
    closeModal();
  };

  return (
    <>
      <Button size="md" variant="primary" onClick={openModal}>
        + إضافة عامل توصيل
      </Button>
      <AddAgentModal
        isOpen={isOpen}
        closeModal={closeModal}
        onSuccess={handleAfterCreate}
      />
    </>
  );
}

export function EditAgentModal({
  isOpen = false,
  closeModal = () => {},
  agent = {} as Agent,
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string>("");
  const [mobileError, setMobileError] = useState<string>("");
  const [commissionRateError, setCommissionRateError] = useState<string>("");

  const [formData, setFormData] = useState<{
    name: string;
    mobile: string;
    role: "delivery-agent";
    isActive: boolean;
    commissionRate: number;
  }>({
    name: agent.name || "",
    mobile: agent.mobile || "",
    role: "delivery-agent",
    isActive: agent.isActive || true,
    commissionRate: agent.commissionRate || 0,
  });

  // Name validation function
  const validateName = (name: string): string => {
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

    // Check for invalid characters (only allow Arabic, English letters and spaces)
    const validPattern = /^[\u0600-\u06FFa-zA-Z\s]+$/;
    if (!validPattern.test(normalizedName)) {
      return "الاسم يقبل الحروف والمسافات فقط";
    }

    return "";
  };

  // Mobile validation function
  const validateMobile = (mobile: string): string => {
    // Check if empty
    if (!mobile || mobile.trim() === "") {
      return "";
    }

    // Check if only numbers
    const numbersOnly = /^[0-9]+$/;
    if (!numbersOnly.test(mobile)) {
      return "رقم الهاتف يقبل الأرقام فقط";
    }

    // Check minimum length (5-11 digits)
    if (mobile.length < 5 || mobile.length > 11) {
      return "يرجى ادخال رقم الهاتف الصحيح";
    }

    return "";
  };

  const handleNameChange = (value: string) => {
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

    setFormData((prev) => ({ ...prev, name: processedValue }));

    // Validate and set error
    const error = validateName(processedValue);
    setNameError(error);
  };

  const handleMobileChange = (value: string) => {
    // Only allow numbers, limit to 11 digits
    const numbersOnly = value.replace(/[^0-9]/g, "");
    const limitedValue = numbersOnly.slice(0, 11);

    setFormData((prev) => ({ ...prev, mobile: limitedValue }));

    // Validate and set error
    const error = validateMobile(limitedValue);
    setMobileError(error);
  };

  // Commission Rate validation function
  const validateCommissionRate = (rate: string): string => {
    if (!rate || rate.trim() === "") {
      return "";
    }

    const rateNum = parseFloat(rate);

    if (isNaN(rateNum)) {
      return "يجب أن تكون نسبة العمولة رقماً";
    }

    if (rateNum < 0) {
      return "يجب أن تكون نسبة العمولة صفر أو أكثر";
    }

    if (rateNum > 100) {
      return "يجب أن لا تزيد نسبة العمولة عن 100%";
    }

    return "";
  };

  const handleCommissionRateChange = (value: string) => {
    // Only allow integers (no decimal points)
    const numbersOnly = value.replace(/[^0-9]/g, "");
    // Limit to 3 digits (max 100)
    const limitedValue = numbersOnly.slice(0, 3);

    const numValue = parseInt(limitedValue) || 0;
    setFormData((prev) => ({ ...prev, commissionRate: numValue }));

    const error = validateCommissionRate(limitedValue);
    setCommissionRateError(error);
  };

  const handleChange = (
    field: string,
    value: string | string[] | File | boolean | undefined,
  ) => {
    if (field === "name" && typeof value === "string") {
      handleNameChange(value);
    } else if (field === "mobile" && typeof value === "string") {
      handleMobileChange(value);
    } else if (field === "commissionRate" && typeof value === "string") {
      handleCommissionRateChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Check for name validation errors
      if (formData.name.trim()) {
        const nameValidationError = validateName(formData.name);
        if (nameValidationError) {
          setToast({
            variant: "error",
            title: "خطأ في الاسم",
            message: nameValidationError,
          });
          setTimeout(() => setToast(null), 5000);
          setIsLoading(false);
          return;
        }
      }

      // Check for mobile validation errors if provided
      if (formData.mobile.trim()) {
        const mobileValidationError = validateMobile(formData.mobile);
        if (mobileValidationError) {
          setToast({
            variant: "error",
            title: "خطأ في رقم الهاتف",
            message: mobileValidationError,
          });
          setTimeout(() => setToast(null), 5000);
          setIsLoading(false);
          return;
        }
      }

      // Check for commissionRate validation errors
      const commissionRateValidationError = validateCommissionRate(
        formData.commissionRate.toString(),
      );
      if (commissionRateValidationError) {
        setToast({
          variant: "error",
          title: "خطأ في نسبة العمولة",
          message: commissionRateValidationError,
        });
        setTimeout(() => setToast(null), 5000);
        setIsLoading(false);
        return;
      }

      const payloadRaw: Partial<CreateAgentPayload> = {
        name: formData.name,
        mobile: formData.mobile,
        isActive: formData.isActive,
        commissionRate: formData.commissionRate,
        role: "delivery-agent",
      };
      // Remove empty-string fields
      const payload = Object.fromEntries(
        Object.entries(payloadRaw).filter((entry) => {
          const v = entry[1] as unknown;
          return typeof v === "string" ? v.trim() !== "" : true;
        }),
      ) as Partial<CreateAgentPayload>;

      await updateAgent(agent._id, payload);
      setToast({
        variant: "success",
        title: "نجح تحديث عامل التوصيل",
        message: "تم تحديث عامل التوصيل بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في تحديث عامل التوصيل",
          message:
            err.response?.data?.message ||
            "فشل في تحديث عامل التوصيل. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to update agent:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      name: agent.name || "",
      mobile: agent.mobile || "",
      role: "delivery-agent",
      isActive: agent.isActive || true,
      commissionRate: agent.commissionRate || 0,
    });
    setMobileError("");
    setNameError("");
    setCommissionRateError("");
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
                معلومات عامل التوصيل
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Name */}
                <div>
                  <Label>الاسم</Label>
                  <Input
                    type="text"
                    placeholder="ادخل اسم عامل التوصيل"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    error={!!nameError}
                    hint={nameError || `${formData.name.length}/30`}
                    required
                  />
                </div>
                {/* Mobile */}
                <div>
                  <Label>الهاتف</Label>
                  <Input
                    type="text"
                    placeholder="ادخل رقم هاتف عامل التوصيل"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    error={!!mobileError}
                    hint={mobileError || `${formData.mobile.length}/11`}
                    required
                  />
                </div>
                {/* Commission Rate */}
                <div>
                  <Label>معدل العمولة (%)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.commissionRate}
                    onChange={(e) =>
                      handleChange("commissionRate", e.target.value)
                    }
                    error={!!commissionRateError}
                    hint={commissionRateError}
                    required
                    min="0"
                    max="100"
                    step={1}
                  />
                </div>
                {/* Active */}
                <div>
                  <Label>
                    نشط <span className="text-error-500">*</span>
                  </Label>
                  <Switch
                    label=""
                    defaultChecked={agent.isActive}
                    onChange={() => handleChange("isActive", !agent.isActive)}
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

export function EditAgentButton({
  agent,
  onSuccess,
}: {
  agent: Agent;
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
      <EditAgentModal
        isOpen={isOpen}
        closeModal={closeModal}
        agent={agent}
        onSuccess={handleAfterEdit}
      />
    </>
  );
}

export function DeleteAgentModal({
  isOpen = false,
  closeModal = () => {},
  agentId = "",
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const handleDelete = async () => {
    try {
      await deleteAgent(agentId);
      setToast({
        variant: "success",
        title: "نجح حذف عامل التوصيل",
        message: "تم حذف عامل التوصيل بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
      closeModal();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في حذف عامل التوصيل",
          message:
            err.response?.data?.message ||
            "فشل في حذف عامل التوصيل. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to delete agent:", err);
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
            حذف عامل التوصيل
          </h4>

          <p className="text-gray-800 dark:text-white/90">
            هل أنت متأكد أنك تريد حذف هذا عامل التوصيل؟
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

export function DeleteAgentButton({
  agentId,
  onSuccess,
}: {
  agentId: string;
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
      <DeleteAgentModal
        isOpen={isOpen}
        closeModal={closeModal}
        agentId={agentId}
        onSuccess={handleAfterDelete}
      />
    </>
  );
}
