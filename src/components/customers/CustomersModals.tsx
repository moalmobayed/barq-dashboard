// components/customers/AddCustomerModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import FileInput from "../form/input/FileInput";
import { useModal } from "@/hooks/useModal";
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from "@/lib/api/customers";
import { uploadImage } from "@/lib/api/uploadImage";
import { getAllTowns } from "@/lib/api/towns";
import { CreateCustomerPayload, Customer } from "@/types/customer";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import Alert, { AlertProps } from "@/components/ui/alert/Alert";
import { AxiosError } from "axios";
import Select from "../form/Select";
import { Town } from "@/types/town";

const ADDRESS_ALLOWED_PATTERN = /^[\u0600-\u06FFa-zA-Z0-9\s.,#\/\-]+$/;

const sanitizeAddressInput = (value: string, maxLength = 50): string => {
  const limitedValue = value.slice(0, maxLength);

  let processedValue = limitedValue.replace(/\s{2,}/g, " ");

  if (processedValue.startsWith(" ")) {
    processedValue = processedValue.slice(1);
  }

  if (processedValue.endsWith(" ") && processedValue.length > 1) {
    const beforeLastChar = processedValue.slice(-2, -1);
    if (beforeLastChar === " ") {
      processedValue = processedValue.slice(0, -1);
    }
  }

  return processedValue;
};

const validateDefaultAddressValue = (address: string): string => {
  const normalizedAddress = address.replace(/\s+/g, " ").trim();

  if (normalizedAddress === "") {
    return "";
  }

  if (normalizedAddress.replace(/\s/g, "").length < 5) {
    return "يجب أن لا يقل العنوان عن خمسة أحرف";
  }

  if (!ADDRESS_ALLOWED_PATTERN.test(normalizedAddress)) {
    return "العنوان يقبل الحروف، الأرقام وبعض الرموز مثل - / #";
  }

  return "";
};

export function AddCustomerModal({
  isOpen = false,
  closeModal = () => {},
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string>("");
  const [mobileError, setMobileError] = useState<string>("");
  const [fullAddressError, setFullAddressError] = useState<string>("");
  const [addressLabelError, setAddressLabelError] = useState<string>("");
  const [townError, setTownError] = useState<string>("");
  const [latitudeError, setLatitudeError] = useState<string>("");
  const [longitudeError, setLongitudeError] = useState<string>("");
  const [towns, setTowns] = useState<Town[]>([]);

  const [formData, setFormData] = useState<{
    name: string;
    mobile: string;
    profileImage: File;
    latitude: string;
    longitude: string;
    fullAddress: string;
    addressLabel: string;
    town: string;
  }>({
    name: "",
    mobile: "",
    profileImage: new File([], ""),
    latitude: "",
    longitude: "",
    fullAddress: "",
    addressLabel: "",
    town: "",
  });

  // Fetch towns on component mount
  useEffect(() => {
    const fetchTowns = async () => {
      try {
        const response = await getAllTowns();
        setTowns(response.data || []);
      } catch (error) {
        console.error("Failed to fetch towns:", error);
      }
    };
    fetchTowns();
  }, []);

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

  const handleDefaultAddressChange = (value: string) => {
    const processedValue = sanitizeAddressInput(value);

    setFormData((prev) => ({ ...prev, fullAddress: processedValue }));

    const error = validateDefaultAddressValue(processedValue);
    setFullAddressError(error);
  };

  const handleChange = (
    field: string,
    value: string | string[] | File | boolean | undefined,
  ) => {
    if (field === "name" && typeof value === "string") {
      handleNameChange(value);
    } else if (field === "mobile" && typeof value === "string") {
      handleMobileChange(value);
    } else if (field === "fullAddress" && typeof value === "string") {
      handleDefaultAddressChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    console.log(formData);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Validation for required fields
      if (!formData.name) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "اسم العميل مطلوب.",
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

      // Check if image is required
      if (!formData.profileImage || formData.profileImage.size === 0) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "صورة الملف الشخصي مطلوبة.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      if (!formData.fullAddress) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "العنوان الكامل مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      const fullAddressValidationError = validateDefaultAddressValue(
        formData.fullAddress,
      );
      if (fullAddressValidationError) {
        setToast({
          variant: "error",
          title: "خطأ في العنوان",
          message: fullAddressValidationError,
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      if (!formData.addressLabel) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "تسمية العنوان مطلوبة.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      if (!formData.town) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "المدينة مطلوبة.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      if (!formData.latitude || !formData.longitude) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "الإحداثيات مطلوبة.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      // Upload profile image (required)
      const uploaded = await uploadImage(formData.profileImage);
      const profileImageUrl = uploaded.data;

      const payload: CreateCustomerPayload = {
        name: formData.name,
        mobile: formData.mobile,
        profileImage: profileImageUrl,
        location: [
          parseFloat(formData.latitude),
          parseFloat(formData.longitude),
        ],
        fullAddress: formData.fullAddress,
        addressLabel: formData.addressLabel,
        town: formData.town,
        isDefault: true, // Always true
      };

      await createCustomer(payload);
      setToast({
        variant: "success",
        title: "نجح إنشاء العميل",
        message: "تم إنشاء العميل بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      setFormData({
        name: "",
        mobile: "",
        profileImage: new File([], ""),
        latitude: "",
        longitude: "",
        fullAddress: "",
        addressLabel: "",
        town: "",
      });
      setFullAddressError("");
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في إنشاء العميل",
          message:
            err.response?.data?.message ||
            "فشل في إنشاء العميل. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to add customer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      name: "",
      mobile: "",
      profileImage: new File([], ""),
      latitude: "",
      longitude: "",
      fullAddress: "",
      addressLabel: "",
      town: "",
    });
    setMobileError("");
    setNameError("");
    setFullAddressError("");
    setAddressLabelError("");
    setTownError("");
    setLatitudeError("");
    setLongitudeError("");
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
                إضافة عميل
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Name */}
                <div>
                  <Label>
                    الاسم <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="ادخل اسم العميل"
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
                    placeholder="ادخل رقم هاتف العميل"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    error={!!mobileError}
                    hint={mobileError || `${formData.mobile.length}/11`}
                    required
                  />
                </div>

                {/* Profile Image */}
                <div className="lg:col-span-2">
                  <Label>
                    صورة الملف الشخصي <span className="text-error-500">*</span>
                  </Label>
                  <FileInput
                    accept="image/*"
                    onChange={(e) =>
                      handleChange("profileImage", e.target.files?.[0])
                    }
                  />
                </div>

                {/* Full Address */}
                <div className="lg:col-span-2">
                  <Label>
                    العنوان الكامل <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="ادخل العنوان الكامل"
                    value={formData.fullAddress}
                    onChange={(e) =>
                      handleChange("fullAddress", e.target.value)
                    }
                    error={!!fullAddressError}
                    hint={
                      fullAddressError || `${formData.fullAddress.length}/50`
                    }
                    required
                  />
                </div>

                {/* Address Label */}
                <div>
                  <Label>
                    تسمية العنوان <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="مثال: المنزل، العمل، الشقة"
                    value={formData.addressLabel}
                    onChange={(e) =>
                      handleChange("addressLabel", e.target.value)
                    }
                    error={!!addressLabelError}
                    hint={addressLabelError}
                    required
                  />
                </div>

                {/* Town */}
                <div>
                  <Label>
                    المدينة <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    value={formData.town}
                    onChange={(value) => handleChange("town", value)}
                    options={towns.map((town) => ({
                      label: town.nameAr || town.nameEn,
                      value: town._id,
                    }))}
                    placeholder="اختر المدينة"
                  />
                  {townError && (
                    <p className="text-error-500 mt-1 text-xs">{townError}</p>
                  )}
                </div>

                {/* Latitude */}
                <div>
                  <Label>
                    خط العرض (Latitude){" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="مثال: 30.06263"
                    value={formData.latitude}
                    onChange={(e) => handleChange("latitude", e.target.value)}
                    error={!!latitudeError}
                    hint={latitudeError}
                    required
                  />
                </div>

                {/* Longitude */}
                <div>
                  <Label>
                    خط الطول (Longitude){" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="مثال: 31.24967"
                    value={formData.longitude}
                    onChange={(e) => handleChange("longitude", e.target.value)}
                    error={!!longitudeError}
                    hint={longitudeError}
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

export function AddCustomerButton({ onSuccess }: { onSuccess?: () => void }) {
  const { isOpen, openModal, closeModal } = useModal();

  const handleAfterCreate = async () => {
    onSuccess?.(); // call parent's refetch
    closeModal();
  };

  return (
    <>
      <Button size="md" variant="primary" onClick={openModal}>
        + إضافة عميل
      </Button>
      <AddCustomerModal
        isOpen={isOpen}
        closeModal={closeModal}
        onSuccess={handleAfterCreate}
      />
    </>
  );
}

export function EditCustomerModal({
  isOpen = false,
  closeModal = () => {},
  customer = {} as Customer,
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string>("");
  const [mobileError, setMobileError] = useState<string>("");
  const [fullAddressError, setFullAddressError] = useState<string>("");
  const [addressLabelError, setAddressLabelError] = useState<string>("");
  const [townError, setTownError] = useState<string>("");
  const [latitudeError, setLatitudeError] = useState<string>("");
  const [longitudeError, setLongitudeError] = useState<string>("");
  const [towns, setTowns] = useState<Town[]>([]);

  const [formData, setFormData] = useState<{
    name: string;
    mobile: string;
    role: "customer";
    fullAddress: string;
    addressLabel: string;
    town: string;
    latitude: string;
    longitude: string;
  }>({
    name: customer.name || "",
    mobile: customer.mobile || "",
    role: "customer",
    fullAddress: customer.defaultAddress?.fullAddress || "",
    addressLabel: customer.defaultAddress?.addressLabel || "",
    town: customer.defaultAddress?.town || "",
    latitude: customer.defaultAddress?.location?.[0]?.toString() || "",
    longitude: customer.defaultAddress?.location?.[1]?.toString() || "",
  });

  // Fetch towns on component mount
  useEffect(() => {
    const fetchTownsData = async () => {
      try {
        const response = await getAllTowns();
        setTowns(response.data || []);
      } catch (error) {
        console.error("Failed to fetch towns:", error);
      }
    };
    fetchTownsData();
  }, []);

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

  const handleFullAddressChange = (value: string) => {
    const processedValue = sanitizeAddressInput(value);

    setFormData((prev) => ({ ...prev, fullAddress: processedValue }));

    const error = validateDefaultAddressValue(processedValue);
    setFullAddressError(error);
  };

  const handleChange = (
    field: string,
    value: string | string[] | File | boolean | undefined,
  ) => {
    if (field === "name" && typeof value === "string") {
      handleNameChange(value);
    } else if (field === "mobile" && typeof value === "string") {
      handleMobileChange(value);
    } else if (field === "fullAddress" && typeof value === "string") {
      handleFullAddressChange(value);
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

      // Validate fullAddress if provided
      if (formData.fullAddress.trim()) {
        const fullAddressValidationError = validateDefaultAddressValue(
          formData.fullAddress,
        );
        if (fullAddressValidationError) {
          setFullAddressError(fullAddressValidationError);
          setToast({
            variant: "error",
            title: "خطأ في العنوان",
            message: fullAddressValidationError,
          });
          setTimeout(() => setToast(null), 5000);
          setIsLoading(false);
          return;
        }
      }

      const payload: Partial<CreateCustomerPayload> = {
        name: formData.name,
        mobile: formData.mobile,
        isDefault: true,
      };

      // Add location if both latitude and longitude are provided
      if (formData.latitude && formData.longitude) {
        payload.location = [
          parseFloat(formData.latitude),
          parseFloat(formData.longitude),
        ];
      }

      // Add fullAddress if provided
      if (formData.fullAddress.trim()) {
        payload.fullAddress = formData.fullAddress;
      }

      // Add addressLabel if provided
      if (formData.addressLabel.trim()) {
        payload.addressLabel = formData.addressLabel;
      }

      // Add town if provided
      if (formData.town.trim()) {
        payload.town = formData.town;
      }

      await updateCustomer(customer._id, payload);
      setToast({
        variant: "success",
        title: "نجح تحديث العميل",
        message: "تم تحديث العميل بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في تحديث العميل",
          message:
            err.response?.data?.message ||
            "فشل في تحديث العميل. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to update customer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      name: customer.name || "",
      mobile: customer.mobile || "",
      role: "customer",
      fullAddress: customer.defaultAddress?.fullAddress || "",
      addressLabel: customer.defaultAddress?.addressLabel || "",
      town: customer.defaultAddress?.town || "",
      latitude: customer.defaultAddress?.location?.[0]?.toString() || "",
      longitude: customer.defaultAddress?.location?.[1]?.toString() || "",
    });
    setMobileError("");
    setNameError("");
    setFullAddressError("");
    setAddressLabelError("");
    setTownError("");
    setLatitudeError("");
    setLongitudeError("");
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
                معلومات العميل
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Name */}
                <div>
                  <Label>الاسم</Label>
                  <Input
                    type="text"
                    placeholder="ادخل اسم العميل"
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
                    placeholder="ادخل رقم هاتف العميل"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    error={!!mobileError}
                    hint={mobileError || `${formData.mobile.length}/11`}
                    required
                  />
                </div>

                {/* Full Address */}
                <div className="lg:col-span-2">
                  <Label>العنوان الكامل</Label>
                  <Input
                    type="text"
                    placeholder="ادخل العنوان الكامل"
                    value={formData.fullAddress}
                    onChange={(e) =>
                      handleChange("fullAddress", e.target.value)
                    }
                    error={!!fullAddressError}
                    hint={
                      fullAddressError || `${formData.fullAddress.length}/50`
                    }
                  />
                </div>

                {/* Address Label */}
                <div>
                  <Label>تسمية العنوان</Label>
                  <Input
                    type="text"
                    placeholder="مثال: المنزل، العمل، الشقة"
                    value={formData.addressLabel}
                    onChange={(e) =>
                      handleChange("addressLabel", e.target.value)
                    }
                    error={!!addressLabelError}
                    hint={addressLabelError}
                  />
                </div>

                {/* Town */}
                <div>
                  <Label>المدينة</Label>
                  <Select
                    value={formData.town}
                    onChange={(value) => handleChange("town", value)}
                    options={towns.map((town) => ({
                      label: town.nameAr || town.nameEn,
                      value: town._id,
                    }))}
                    placeholder="اختر المدينة"
                  />
                  {townError && (
                    <span className="text-error-500 text-xs">{townError}</span>
                  )}
                </div>

                {/* Latitude */}
                <div>
                  <Label>
                    خط العرض (Latitude)
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="مثال: 30.06263"
                    value={formData.latitude}
                    onChange={(e) => handleChange("latitude", e.target.value)}
                    error={!!latitudeError}
                    hint={latitudeError}
                  />
                </div>

                {/* Longitude */}
                <div>
                  <Label>
                    خط الطول (Longitude)
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="مثال: 31.24967"
                    value={formData.longitude}
                    onChange={(e) => handleChange("longitude", e.target.value)}
                    error={!!longitudeError}
                    hint={longitudeError}
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

export function EditCustomerButton({
  customer,
  onSuccess,
}: {
  customer: Customer;
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
      <EditCustomerModal
        isOpen={isOpen}
        closeModal={closeModal}
        customer={customer}
        onSuccess={handleAfterEdit}
      />
    </>
  );
}

export function DeleteCustomerModal({
  isOpen = false,
  closeModal = () => {},
  customerId = "",
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const handleDelete = async () => {
    try {
      await deleteCustomer(customerId);
      setToast({
        variant: "success",
        title: "نجح حذف العميل",
        message: "تم حذف العميل بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
      closeModal();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في حذف العميل",
          message:
            err.response?.data?.message ||
            "فشل في حذف العميل. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to delete customer:", err);
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
            حذف العميل
          </h4>

          <p className="text-gray-800 dark:text-white/90">
            هل أنت متأكد أنك تريد حذف هذا العميل؟
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

export function DeleteCustomerButton({
  customerId,
  onSuccess,
}: {
  customerId: string;
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
      <DeleteCustomerModal
        isOpen={isOpen}
        closeModal={closeModal}
        customerId={customerId}
        onSuccess={handleAfterDelete}
      />
    </>
  );
}
