// components/vendors/AddVendorModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Switch from "../form/switch/Switch";
import FileInput from "../form/input/FileInput";
import { ChevronDownIcon } from "../../../public/icons";
import Select from "../form/Select";
import MultiSelect from "../form/MultiSelect";
import { Category } from "@/types/category";
import { Subcategory } from "@/types/subcategory";
import { useModal } from "@/hooks/useModal";
import { fetchSubcategoriesByCategory } from "@/lib/api/subcategories";
import { createVendor, deleteVendor, updateVendor } from "@/lib/api/vendors";
import { uploadImage } from "@/lib/api/uploadImage";
import { CreateVendorPayload, Vendor } from "@/types/vendor";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import Image from "next/image";
import { fetchCategories } from "@/lib/api/categories";
import Alert, { AlertProps } from "@/components/ui/alert/Alert";
import { AxiosError } from "axios";

export function AddVendorModal({
  isOpen = false,
  closeModal = () => {},
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string>("");
  const [mobileError, setMobileError] = useState<string>("");
  const [hotlineError, setHotlineError] = useState<string>("");
  const [locationError, setLocationError] = useState<string>("");
  const [expectedTimeError, setExpectedTimeError] = useState<string>("");
  const [formData, setFormData] = useState<{
    name: string;
    mobile: string;
    hotline: string;
    location: string;
    workingHours: [string, string];
    expectedTime: string;
    profileImage: File;
    coverImage: File;
    category: string;
    subcategories: string[];
  }>({
    name: "",
    mobile: "",
    hotline: "",
    location: "",
    workingHours: ["07:00", "15:00"],
    expectedTime: "",
    profileImage: new File([], ""), // Initialize with an empty file
    coverImage: new File([], ""), // Initialize with an empty file
    category: "",
    subcategories: [],
  });

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const { data: categories } = await fetchCategories();
        setCategories(categories);
        // Clear subcategories when modal opens
        setSubcategories([]);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [isOpen]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (!formData.category) {
      setSubcategories([]);
      setFormData((prev) => ({ ...prev, subcategories: [] }));
      return;
    }

    const fetchSubcategoriesForCategory = async () => {
      try {
        const { data: subcategories } = await fetchSubcategoriesByCategory(
          formData.category,
        );
        setSubcategories(subcategories);
        // Reset selected subcategories when category changes
        setFormData((prev) => ({ ...prev, subcategories: [] }));
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
        setSubcategories([]);
        setFormData((prev) => ({ ...prev, subcategories: [] }));
      }
    };

    fetchSubcategoriesForCategory();
  }, [formData.category]);

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

    // Check for invalid characters (only allow Arabic, English letters, numbers, and spaces)
    const validPattern = /^[\u0600-\u06FFa-zA-Z0-9\s]+$/;
    if (!validPattern.test(normalizedName)) {
      return "الاسم يقبل الحروف والأرقام والمسافات فقط";
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
    // Check length exactly 11 digits
    if (mobile.length !== 11) {
      return "يرجى ادخال رقم هاتف مكون من 11 رقمًا";
    }

    return "";
  };

  // Hotline validation function
  const validateHotline = (hotline: string): string => {
    // Check if empty
    if (!hotline || hotline.trim() === "") {
      return "";
    }

    // Check if only numbers
    const numbersOnly = /^[0-9]+$/;
    if (!numbersOnly.test(hotline)) {
      return "الخط الساخن يقبل الأرقام فقط";
    }

    // Check minimum length (5-11 digits)
    if (hotline.length < 5 || hotline.length > 11) {
      return "يرجى ادخال رقم الخط الساخن الصحيح (5-11 رقم)";
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

  const handleChange = (
    field: string,
    value: string | string[] | File | undefined,
  ) => {
    if (field === "name" && typeof value === "string") {
      handleNameChange(value);
    } else if (field === "mobile" && typeof value === "string") {
      handleMobileChange(value);
    } else if (field === "hotline" && typeof value === "string") {
      handleHotlineChange(value);
    } else if (field === "location" && typeof value === "string") {
      handleLocationChange(value);
    } else if (field === "expectedTime" && typeof value === "string") {
      handleExpectedTimeChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
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

  const handleHotlineChange = (value: string) => {
    // Only allow numbers, limit to 11 digits
    const numbersOnly = value.replace(/[^0-9]/g, "");
    const limitedValue = numbersOnly.slice(0, 11);

    setFormData((prev) => ({ ...prev, hotline: limitedValue }));

    // Validate and set error
    const error = validateHotline(limitedValue);
    setHotlineError(error);
  };

  // Location validation function
  const validateLocation = (location: string): string => {
    // Remove extra spaces and normalize
    const normalizedLocation = location.replace(/\s+/g, " ").trim();

    // Check if only spaces
    if (location.trim() === "") {
      return "";
    }

    // Check minimum length (10 characters excluding spaces)
    const locationWithoutSpaces = normalizedLocation.replace(/\s/g, "");
    if (locationWithoutSpaces.length < 10) {
      return "يجب أن لا يقل العنوان عن 10 أحرف";
    }

    // Check for invalid characters (allow Arabic, English letters, numbers, spaces, and common address symbols)
    const validPattern = /^[\u0600-\u06FFa-zA-Z0-9\s.,#\/\-]+$/;
    if (!validPattern.test(normalizedLocation)) {
      return "العنوان يقبل الحروف والأرقام وبعض الرموز مثل - / # . ,";
    }

    return "";
  };

  const handleLocationChange = (value: string) => {
    // Limit to 100 characters
    const limitedValue = value.slice(0, 100);

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

    setFormData((prev) => ({ ...prev, location: processedValue }));

    // Validate and set error
    const error = validateLocation(processedValue);
    setLocationError(error);
  };

  // Expected Time validation function
  const validateExpectedTime = (time: string): string => {
    // Check if empty
    if (!time || time.trim() === "") {
      return "";
    }

    const timeNum = parseInt(time);

    // Check if it's a valid number
    if (isNaN(timeNum)) {
      return "يجب أن يكون وقت التحضير المتوقع رقماً";
    }

    // Check if it's a positive number
    if (timeNum <= 0) {
      return "يجب أن يكون وقت التحضير المتوقع أكبر من صفر";
    }

    // Check maximum reasonable time (e.g., 300 minutes = 5 hours)
    if (timeNum > 300) {
      return "يجب أن لا يزيد وقت التحضير المتوقع عن 300 دقيقة";
    }

    return "";
  };

  const handleExpectedTimeChange = (value: string) => {
    // Only allow numbers
    const numbersOnly = value.replace(/[^0-9]/g, "");
    // Limit to 3 digits (max 999)
    const limitedValue = numbersOnly.slice(0, 3);

    setFormData((prev) => ({ ...prev, expectedTime: limitedValue }));

    // Validate and set error
    const error = validateExpectedTime(limitedValue);
    setExpectedTimeError(error);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Validation for required fields
      if (!formData.name) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "اسم المتجر مطلوب.",
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

      // Check for hotline validation errors (optional field)
      if (formData.hotline) {
        const hotlineValidationError = validateHotline(formData.hotline);
        if (hotlineValidationError) {
          setToast({
            variant: "error",
            title: "خطأ في رقم الخط الساخن",
            message: hotlineValidationError,
          });
          setTimeout(() => setToast(null), 5000);
          return;
        }
      }

      // Check for location validation errors
      const locationValidationError = validateLocation(formData.location);
      if (locationValidationError) {
        setToast({
          variant: "error",
          title: "خطأ في العنوان",
          message: locationValidationError,
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      if (!formData.location) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "العنوان مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }
      if (
        !formData.workingHours ||
        !Array.isArray(formData.workingHours) ||
        formData.workingHours.length !== 2 ||
        !formData.workingHours[0] ||
        !formData.workingHours[1]
      ) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "ساعات العمل (بداية ونهاية) مطلوبة.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }
      if (!formData.expectedTime) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "متوسط وقت التحضير مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      // Check for expectedTime validation errors
      const expectedTimeValidationError = validateExpectedTime(
        formData.expectedTime,
      );
      if (expectedTimeValidationError) {
        setToast({
          variant: "error",
          title: "خطأ في وقت التحضير المتوقع",
          message: expectedTimeValidationError,
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }
      if (!formData.category) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "الفئة مطلوبة.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }
      if (
        !formData.profileImage ||
        !(formData.profileImage instanceof File) ||
        formData.profileImage.size === 0
      ) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "صورة الملف الشخصي مطلوبة.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      if (
        !formData.coverImage ||
        !(formData.coverImage instanceof File) ||
        formData.coverImage.size === 0
      ) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "صورة الغلاف مطلوبة.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      let profileImageUrl = "";
      if (
        formData.profileImage instanceof File &&
        formData.profileImage.size > 0
      ) {
        const uploaded = await uploadImage(formData.profileImage);
        profileImageUrl = uploaded.data;
      }

      let coverImageUrl = "";
      if (formData.coverImage instanceof File && formData.coverImage.size > 0) {
        const uploaded = await uploadImage(formData.coverImage);
        coverImageUrl = uploaded.data;
      }

      const payloadRaw: CreateVendorPayload = {
        name: formData.name,
        mobile: formData.mobile,
        hotline: formData.hotline,
        location: formData.location,
        workingHours: formData.workingHours,
        expectedTime: formData.expectedTime,
        profileImage: profileImageUrl,
        coverImage: coverImageUrl,
        category: formData.category,
        subcategories: formData.subcategories,
        role: "shop",
      };
      // Remove empty-string fields
      const payload = Object.fromEntries(
        Object.entries(payloadRaw).filter((entry) => {
          const v = entry[1] as unknown;
          return typeof v === "string" ? v.trim() !== "" : true;
        }),
      ) as CreateVendorPayload;

      await createVendor(payload);
      setToast({
        variant: "success",
        title: "نجح إنشاء المتجر",
        message: "تم إنشاء المتجر بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      setFormData({
        name: "",
        mobile: "",
        hotline: "",
        location: "",
        workingHours: ["07:00", "15:00"],
        expectedTime: "",
        profileImage: new File([], ""), // Initialize with an empty file
        coverImage: new File([], ""), // Initialize with an empty file
        category: "",
        subcategories: [],
      });
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في إنشاء المتجر",
          message:
            err.response?.data?.message ||
            "فشل في إنشاء المتجر. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to add vendor:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      name: "",
      mobile: "",
      hotline: "",
      location: "",
      workingHours: ["07:00", "15:00"],
      expectedTime: "",
      profileImage: new File([], ""), // Initialize with an empty file
      coverImage: new File([], ""), // Initialize with an empty file
      category: "",
      subcategories: [],
    });
    setNameError("");
    setMobileError("");
    setHotlineError("");
    setLocationError("");
    setExpectedTimeError("");
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
                إضافة متجر
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Profile Image */}
                <div>
                  <Label>
                    صورة الشعار (Logo) <span className="text-error-500">*</span>
                  </Label>
                  <FileInput
                    accept="image/*"
                    onChange={(e) =>
                      handleChange("profileImage", e.target.files?.[0])
                    }
                  />
                </div>

                {/* Cover Image */}
                <div>
                  <Label>
                    صورة الغلاف (Cover){" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <FileInput
                    accept="image/*"
                    onChange={(e) =>
                      handleChange("coverImage", e.target.files?.[0])
                    }
                  />
                </div>

                {/* Name */}
                <div>
                  <Label>
                    الاسم <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="ادخل اسم المتجر"
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
                    placeholder="ادخل رقم هاتف المتجر"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    error={!!mobileError}
                    hint={mobileError || `${formData.mobile.length}/11`}
                    required
                  />
                </div>

                {/* Hotline */}
                <div>
                  <Label>الخط الساخن</Label>
                  <Input
                    type="text"
                    placeholder="ادخل رقم الخط الساخن"
                    value={formData.hotline}
                    onChange={(e) => handleChange("hotline", e.target.value)}
                    error={!!hotlineError}
                    hint={hotlineError || `${formData.hotline.length}/11`}
                  />
                </div>

                {/* Location */}
                <div>
                  <Label>
                    العنوان <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="ادخل عنوان المتجر"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    error={!!locationError}
                    hint={locationError || `${formData.location.length}/100`}
                    required
                  />
                </div>

                {/* Working Hours */}
                <div>
                  <Label>
                    ساعات العمل <span className="text-error-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={formData.workingHours[0]}
                      onChange={(e) =>
                        handleChange("workingHours", [
                          e.target.value,
                          formData.workingHours[1],
                        ])
                      }
                      required
                    />

                    <span className="text-gray-500">إلى</span>
                    <Input
                      type="time"
                      value={formData.workingHours[1]}
                      onChange={(e) =>
                        handleChange("workingHours", [
                          formData.workingHours[0],
                          e.target.value,
                        ])
                      }
                      required
                    />
                  </div>
                </div>

                {/* Expected Time */}
                <div>
                  <Label>
                    متوسط وقت التحضير (بالدقائق){" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="مثال: 30"
                    value={formData.expectedTime}
                    onChange={(e) =>
                      handleChange("expectedTime", e.target.value)
                    }
                    error={!!expectedTimeError}
                    hint={expectedTimeError}
                    required
                    min="1"
                    max="300"
                  />
                </div>

                {/* Active */}
                <div>
                  <Label>
                    نشط <span className="text-error-500">*</span>
                  </Label>
                  <Switch label="" defaultChecked={true} />
                </div>
              </div>
            </div>

            <div className="mt-7">
              <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
                تفاصيل المتجر
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Category */}
                <div>
                  <Label>
                    الفئة <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      options={categories.map((cat) => ({
                        value: cat._id,
                        label: cat.nameAr,
                      }))}
                      placeholder="اختر الفئة"
                      onChange={(val) => handleChange("category", val)}
                      required
                    />
                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                {/* Subcategories */}
                <MultiSelect
                  key={formData.category || "no-category"} // Force re-render when category changes
                  label="الفئات الفرعية"
                  placeholder={
                    !formData.category
                      ? "يرجى اختيار فئة أولاً"
                      : subcategories.length === 0
                        ? "لا توجد فئات فرعية لهذه الفئة"
                        : "اختر الفئات الفرعية"
                  }
                  options={subcategories.map((sc) => ({
                    value: sc._id,
                    text: sc.nameAr,
                    selected: formData.subcategories.includes(sc._id),
                  }))}
                  onChange={(values) => handleChange("subcategories", values)}
                  disabled={!formData.category || subcategories.length === 0}
                  required
                />
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

export function AddVendorButton({ onSuccess }: { onSuccess?: () => void }) {
  const { isOpen, openModal, closeModal } = useModal();

  const handleAfterCreate = async () => {
    onSuccess?.(); // call parent's refetch
    closeModal();
  };

  return (
    <>
      <Button size="md" variant="primary" onClick={openModal}>
        + إضافة متجر
      </Button>
      <AddVendorModal
        isOpen={isOpen}
        closeModal={closeModal}
        onSuccess={handleAfterCreate}
      />
    </>
  );
}

export function EditVendorModal({
  isOpen = false,
  closeModal = () => {},
  vendor = {} as Vendor,
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string>("");
  const [mobileError, setMobileError] = useState<string>("");
  const [hotlineError, setHotlineError] = useState<string>("");
  const [locationError, setLocationError] = useState<string>("");
  const [expectedTimeError, setExpectedTimeError] = useState<string>("");

  const [formData, setFormData] = useState<{
    name: string;
    mobile: string;
    hotline: string;
    location: string;
    workingHours: [string, string];
    isActive: boolean;
    expectedTime: string;
    profileImage: File | string;
    coverImage: File | string;
    category: string;
    subcategories: string[];
  }>({
    name: vendor.name || "",
    mobile: vendor.mobile || "",
    hotline: vendor.hotline || "",
    location: vendor.location || "",
    workingHours:
      Array.isArray(vendor.workingHours) && vendor.workingHours.length === 2
        ? vendor.workingHours
        : ["07:00", "15:00"],
    isActive: vendor.isActive || true,
    expectedTime: vendor.expectedTime || "",
    profileImage: vendor.profileImage || "",
    coverImage: vendor.coverImage || "",
    category: vendor.category?._id || "",
    subcategories: vendor.subcategories?.map((sc) => sc._id) || [],
  });

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const { data: categories } = await fetchCategories();
        setCategories(categories);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [isOpen]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (!formData.category) {
      setSubcategories([]);
      setFormData((prev) => ({ ...prev, subcategories: [] }));
      return;
    }

    const fetchSubcategoriesForCategory = async () => {
      try {
        const { data: subcategories } = await fetchSubcategoriesByCategory(
          formData.category,
        );
        setSubcategories(subcategories);

        // Only reset subcategories if the category changed from a different value
        // (not on initial load when vendor data is set)
        if (vendor.category?._id !== formData.category) {
          setFormData((prev) => ({ ...prev, subcategories: [] }));
        }
      } catch (err) {
        console.error("Failed to fetch subcategories:", err);
        setSubcategories([]);
        setFormData((prev) => ({ ...prev, subcategories: [] }));
      }
    };

    fetchSubcategoriesForCategory();
  }, [formData.category, vendor.category?._id]);

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

    // Check for invalid characters (only allow Arabic, English letters, numbers, and spaces)
    const validPattern = /^[\u0600-\u06FFa-zA-Z0-9\s]+$/;
    if (!validPattern.test(normalizedName)) {
      return "الاسم يقبل الحروف والأرقام والمسافات فقط";
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

    // Check minimum length (11 digits)
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

  // Hotline validation function
  const validateHotline = (hotline: string): string => {
    // Hotline is optional, return no error if empty
    if (!hotline || hotline.trim() === "") {
      return "";
    }

    // Check if it contains only numbers
    if (!/^[0-9]+$/.test(hotline)) {
      return "الخط الساخن يقبل الأرقام فقط";
    }

    // Check length (5-11 digits)
    if (hotline.length < 5 || hotline.length > 11) {
      return "يرجى ادخال رقم الخط الساخن الصحيح (5-11 رقم)";
    }

    return "";
  };

  const handleHotlineChange = (value: string) => {
    // Only allow numbers, limit to 11 digits
    const numbersOnly = value.replace(/[^0-9]/g, "");
    const limitedValue = numbersOnly.slice(0, 11);

    setFormData((prev) => ({ ...prev, hotline: limitedValue }));

    // Validate and set error
    const error = validateHotline(limitedValue);
    setHotlineError(error);
  };

  // Location validation function
  const validateLocation = (location: string): string => {
    // Remove extra spaces and normalize
    const normalizedLocation = location.replace(/\s+/g, " ").trim();

    // Check if only spaces
    if (location.trim() === "") {
      return "";
    }

    // Check minimum length (10 characters excluding spaces)
    const locationWithoutSpaces = normalizedLocation.replace(/\s/g, "");
    if (locationWithoutSpaces.length < 10) {
      return "يجب أن لا يقل العنوان عن 10 أحرف";
    }

    // Check for invalid characters (allow Arabic, English letters, numbers, spaces, and common address symbols)
    const validPattern = /^[\u0600-\u06FFa-zA-Z0-9\s.,#\/\-]+$/;
    if (!validPattern.test(normalizedLocation)) {
      return "العنوان يقبل الحروف والأرقام وبعض الرموز مثل - / # . ,";
    }

    return "";
  };

  const handleLocationChange = (value: string) => {
    // Limit to 100 characters
    const limitedValue = value.slice(0, 100);

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

    setFormData((prev) => ({ ...prev, location: processedValue }));

    // Validate and set error
    const error = validateLocation(processedValue);
    setLocationError(error);
  };

  // Expected Time validation function
  const validateExpectedTime = (time: string): string => {
    const timeNum = parseInt(time);

    // Check if it's a valid number
    if (isNaN(timeNum)) {
      return "يجب أن يكون وقت التحضير المتوقع رقماً";
    }

    // Check if it's a positive number
    if (timeNum <= 0) {
      return "يجب أن يكون وقت التحضير المتوقع أكبر من صفر";
    }

    // Check maximum reasonable time (e.g., 300 minutes = 5 hours)
    if (timeNum > 300) {
      return "يجب أن لا يزيد وقت التحضير المتوقع عن 300 دقيقة";
    }

    return "";
  };

  const handleExpectedTimeChange = (value: string) => {
    // Only allow numbers
    const numbersOnly = value.replace(/[^0-9]/g, "");
    // Limit to 3 digits (max 999)
    const limitedValue = numbersOnly.slice(0, 3);

    setFormData((prev) => ({ ...prev, expectedTime: limitedValue }));

    // Validate and set error
    const error = validateExpectedTime(limitedValue);
    setExpectedTimeError(error);
  };

  const handleChange = (
    field: string,
    value: string | string[] | File | boolean | undefined,
  ) => {
    if (field === "name" && typeof value === "string") {
      handleNameChange(value);
    } else if (field === "mobile" && typeof value === "string") {
      handleMobileChange(value);
    } else if (field === "hotline" && typeof value === "string") {
      handleHotlineChange(value);
    } else if (field === "location" && typeof value === "string") {
      handleLocationChange(value);
    } else if (field === "expectedTime" && typeof value === "string") {
      handleExpectedTimeChange(value);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    console.log(field, value);
    console.log(formData);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
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

      // Check for hotline validation errors (if provided)
      if (formData.hotline && formData.hotline.trim() !== "") {
        const hotlineValidationError = validateHotline(formData.hotline);
        if (hotlineValidationError) {
          setToast({
            variant: "error",
            title: "خطأ في الخط الساخن",
            message: hotlineValidationError,
          });
          setTimeout(() => setToast(null), 5000);
          return;
        }
      }

      // Check for location validation errors
      const locationValidationError = validateLocation(formData.location);
      if (locationValidationError) {
        setToast({
          variant: "error",
          title: "خطأ في العنوان",
          message: locationValidationError,
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      // Check for expectedTime validation errors
      const expectedTimeValidationError = validateExpectedTime(
        formData.expectedTime,
      );
      if (expectedTimeValidationError) {
        setToast({
          variant: "error",
          title: "خطأ في وقت التحضير المتوقع",
          message: expectedTimeValidationError,
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      let profileImageUrl = "";

      if (formData.profileImage instanceof File) {
        const uploaded = await uploadImage(formData.profileImage);
        profileImageUrl = uploaded.data || uploaded.url;
      } else if (typeof formData.profileImage === "string") {
        profileImageUrl = formData.profileImage;
      }

      let coverImageUrl = "";

      if (formData.coverImage instanceof File) {
        const uploaded = await uploadImage(formData.coverImage);
        coverImageUrl = uploaded.data || uploaded.url;
      } else if (typeof formData.coverImage === "string") {
        coverImageUrl = formData.coverImage;
      }

      const payloadRaw: Partial<CreateVendorPayload> = {
        name: formData.name,
        ...(formData.mobile !== vendor.mobile && { mobile: formData.mobile }),
        hotline: formData.hotline,
        location: formData.location,
        workingHours: formData.workingHours,
        isActive: formData.isActive,
        expectedTime: formData.expectedTime,
        profileImage: profileImageUrl,
        coverImage: coverImageUrl,
        category: formData.category,
        subcategories: formData.subcategories,
        role: "shop",
      };
      // Remove empty-string fields
      const payload = Object.fromEntries(
        Object.entries(payloadRaw).filter((entry) => {
          const v = entry[1] as unknown;
          return typeof v === "string" ? v.trim() !== "" : true;
        }),
      ) as Partial<CreateVendorPayload>;

      await updateVendor(vendor._id, payload);
      setToast({
        variant: "success",
        title: "نجح تحديث المتجر",
        message: "تم تحديث المتجر بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في تحديث المتجر",
          message:
            err.response?.data?.message ||
            "فشل في تحديث المتجر. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to update vendor:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      name: vendor.name || "",
      mobile: vendor.mobile || "",
      hotline: vendor.hotline || "",
      location: vendor.location || "",
      workingHours:
        Array.isArray(vendor.workingHours) && vendor.workingHours.length === 2
          ? vendor.workingHours
          : ["07:00", "15:00"],
      isActive: vendor.isActive || true,
      expectedTime: vendor.expectedTime || "",
      profileImage: vendor.profileImage || "",
      coverImage: vendor.coverImage || "",
      category: vendor.category?._id || "",
      subcategories: vendor.subcategories?.map((sc) => sc._id) || [],
    });
    setNameError("");
    setMobileError("");
    setHotlineError("");
    setLocationError("");
    setExpectedTimeError("");
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
                معلومات المتجر
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>صورة الشعار (Logo)</Label>
                  {typeof formData.profileImage === "string" &&
                    formData.profileImage && (
                      <Image
                        src={formData.profileImage}
                        width={160}
                        height={160}
                        alt="Current Profile"
                        className="mb-4 justify-self-center"
                      />
                    )}
                  <FileInput
                    accept="image/*"
                    onChange={(e) =>
                      handleChange("profileImage", e.target.files?.[0])
                    }
                  />
                </div>
                <div>
                  <Label>صورة الغلاف (Cover)</Label>
                  {typeof formData.coverImage === "string" &&
                    formData.coverImage && (
                      <Image
                        src={formData.coverImage}
                        width={160}
                        height={90}
                        alt="Current Cover"
                        className="mb-4 justify-self-center"
                      />
                    )}
                  <FileInput
                    accept="image/*"
                    onChange={(e) =>
                      handleChange("coverImage", e.target.files?.[0])
                    }
                  />
                </div>
                <div>
                  <Label>الاسم</Label>
                  <Input
                    type="text"
                    placeholder="ادخل اسم المتجر"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    error={!!nameError}
                    hint={nameError || `${formData.name.length}/30`}
                    required
                  />
                </div>
                <div>
                  <Label>الهاتف</Label>
                  <Input
                    type="text"
                    placeholder="ادخل رقم هاتف المتجر"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    error={!!mobileError}
                    hint={mobileError || `${formData.mobile.length}/11`}
                    required
                  />
                </div>
                <div>
                  <Label>الخط الساخن</Label>
                  <Input
                    type="text"
                    placeholder="ادخل رقم الخط الساخن (5-11 رقم)"
                    value={formData.hotline}
                    onChange={(e) => handleChange("hotline", e.target.value)}
                    error={!!hotlineError}
                    hint={hotlineError || `${formData.hotline.length}/11`}
                  />
                </div>
                <div>
                  <Label>العنوان</Label>
                  <Input
                    type="text"
                    placeholder="مدينة نصر"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    error={!!locationError}
                    hint={locationError || `${formData.location.length}/100`}
                  />
                </div>
                <div>
                  <Label>ساعات العمل</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={formData.workingHours[0]}
                      onChange={(e) =>
                        handleChange("workingHours", [
                          e.target.value,
                          formData.workingHours[1],
                        ])
                      }
                      required
                    />
                    <span className="text-gray-500">إلى</span>
                    <Input
                      type="time"
                      value={formData.workingHours[1]}
                      onChange={(e) =>
                        handleChange("workingHours", [
                          formData.workingHours[0],
                          e.target.value,
                        ])
                      }
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>متوسط وقت التحضير (بالدقائق)</Label>
                  <Input
                    type="number"
                    placeholder="مثال: 30"
                    value={formData.expectedTime}
                    onChange={(e) =>
                      handleChange("expectedTime", e.target.value)
                    }
                    error={!!expectedTimeError}
                    hint={expectedTimeError}
                  />
                </div>
                <div>
                  <Label>نشط</Label>
                  <Switch
                    label=""
                    defaultChecked={formData.isActive}
                    onChange={() =>
                      handleChange("isActive", !formData.isActive)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-7">
              <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
                تفاصيل المتجر
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>الفئة</Label>
                  <div className="relative">
                    <Select
                      options={categories.map((cat) => ({
                        value: cat._id,
                        label: cat.nameAr,
                      }))}
                      placeholder="اختر الفئة"
                      value={formData.category}
                      onChange={(val) => handleChange("category", val)}
                    />
                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <MultiSelect
                  key={formData.category || "no-category"} // Force re-render when category changes
                  label="الفئات الفرعية"
                  placeholder={
                    !formData.category
                      ? "يرجى اختيار فئة أولاً"
                      : subcategories.length === 0
                        ? "لا توجد فئات فرعية لهذه الفئة"
                        : "اختر الفئات الفرعية"
                  }
                  options={subcategories.map((sc) => ({
                    value: sc._id,
                    text: sc.nameAr,
                    selected: formData.subcategories.includes(sc._id),
                  }))}
                  onChange={(values) => handleChange("subcategories", values)}
                  disabled={!formData.category || subcategories.length === 0}
                  defaultSelected={formData.subcategories}
                />
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

export function EditVendorButton({
  vendor,
  onSuccess,
}: {
  vendor: Vendor;
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
      <EditVendorModal
        isOpen={isOpen}
        closeModal={closeModal}
        vendor={vendor}
        onSuccess={handleAfterEdit}
      />
    </>
  );
}

export function DeleteVendorModal({
  isOpen = false,
  closeModal = () => {},
  vendorId = "",
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const handleDelete = async () => {
    try {
      await deleteVendor(vendorId);
      setToast({
        variant: "success",
        title: "نجح حذف المتجر",
        message: "تم حذف المتجر بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
      closeModal();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في حذف المتجر",
          message:
            err.response?.data?.message ||
            "فشل في حذف المتجر. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to delete vendor:", err);
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
            حذف المتجر
          </h4>

          <p className="text-gray-800 dark:text-white/90">
            هل أنت متأكد أنك تريد حذف هذا المتجر؟
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

export function DeleteVendorButton({
  vendorId,
  onSuccess,
}: {
  vendorId: string;
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
      <DeleteVendorModal
        isOpen={isOpen}
        closeModal={closeModal}
        vendorId={vendorId}
        onSuccess={handleAfterDelete}
      />
    </>
  );
}
