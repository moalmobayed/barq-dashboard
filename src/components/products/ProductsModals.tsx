"use client";

import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import FileInput from "../form/input/FileInput";
import { ChevronDownIcon } from "../../../public/icons";
import Select from "../form/Select";
import { Category } from "@/types/category";
import { uploadImage } from "@/lib/api/uploadImage";
import { CreateProductPayload, Product, Extension } from "@/types/product";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/api/products";
import {
  FaPencilAlt,
  FaTrashAlt,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import Image from "next/image";
import { fetchCategories } from "@/lib/api/categories";
import Alert, { AlertProps } from "@/components/ui/alert/Alert";
import { getAllVendors } from "@/lib/api/vendors";
import { Vendor } from "@/types/vendor";
import { fetchCategoryshopsByVendor } from "@/lib/api/categoryshop";
import { AxiosError } from "axios";

export function AddProductModal({
  isOpen = false,
  closeModal = () => {},
  onSuccess = () => {},
  vendorId,
}: {
  isOpen?: boolean;
  closeModal?: () => void;
  onSuccess?: () => void;
  vendorId?: string;
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nameArError, setNameArError] = useState<string>("");
  const [nameEnError, setNameEnError] = useState<string>("");
  const [priceError, setPriceError] = useState<string>("");
  const [descriptionArError, setDescriptionArError] = useState<string>("");
  const [descriptionEnError, setDescriptionEnError] = useState<string>("");
  const [formData, setFormData] = useState<{
    nameAr: string;
    nameEn: string;
    price: number;
    shopId: string;
    descriptionAr: string;
    descriptionEn: string;
    category: string;
    categories: string[];
    image: File;
    extensions: Extension[];
  }>({
    nameAr: "",
    nameEn: "",
    price: 0,
    shopId: "",
    descriptionAr: "",
    descriptionEn: "",
    category: "",
    categories: [],
    image: new File([], ""),
    extensions: [],
  });
  const [collapsedExtensions, setCollapsedExtensions] = useState<boolean[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      try {
        const { data: baseCategories } = await fetchCategories();
        setCategories(baseCategories);
        // Always fetch vendors so we have label even if locked
        const { data: vendorsList } = await getAllVendors();

        setVendors(vendorsList);
        // Preselect vendor if provided
        if (vendorId) {
          setFormData((prev) => ({ ...prev, shopId: vendorId }));
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, [isOpen, vendorId]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (!formData.shopId || !isOpen) {
      setCategories([]);
      return;
    }

    const fetchCategoriesForCategory = async () => {
      try {
        const { data: categories } = await fetchCategoryshopsByVendor(
          formData.shopId,
        );
        setCategories(categories);
        // Reset selected subcategories when category changes
        setFormData((prev) => ({ ...prev, categories: [] }));
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories([]);
      }
    };

    fetchCategoriesForCategory();
  }, [formData.shopId, isOpen]);

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

    // Check for invalid characters (only allow Arabic letters, numbers, and spaces)
    const validPattern =
      /^[\u0600-\u06FF0-9\s!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]+$/;
    if (!validPattern.test(normalizedName)) {
      return "الاسم يقبل الحروف العربية والأرقام والمسافات فقط";
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

    // Check for invalid characters (only allow English letters, numbers, and spaces)
    const validPattern = /^[a-zA-Z0-9\s!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]+$/;
    if (!validPattern.test(normalizedName)) {
      return "الاسم يقبل الحروف الإنجليزية والأرقام والمسافات فقط";
    }

    return "";
  };

  // Price validation function
  const validatePrice = (price: string): string => {
    // Remove commas and trim
    const cleanPrice = price.replace(/,/g, "").trim();

    // Check if empty
    if (!cleanPrice) {
      return "";
    }

    // Check if valid number
    const numPrice = parseFloat(cleanPrice);
    if (isNaN(numPrice)) {
      return "يرجى ادخال سعر المنتج";
    }

    // Check if zero
    if (numPrice === 0) {
      return "يرجى ادخال سعر المنتج";
    }

    // Check if less than 1
    if (numPrice < 1) {
      return "يرجى ادخال سعر المنتج";
    }

    return "";
  };

  // Description validation function
  const validateDescription = (description: string): string => {
    // Remove extra spaces and normalize
    const normalizedDesc = description.replace(/\s+/g, " ").trim();

    // Check if only spaces
    if (description.trim() === "") {
      return "";
    }

    // Check for invalid characters (allow letters, numbers, spaces, and special characters but not emojis)
    const validPattern =
      /^[\u0600-\u06FFa-zA-Z0-9\s\u0020-\u007E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]+$/;
    if (!validPattern.test(normalizedDesc)) {
      return "الوصف لا يقبل الرموز التعبيرية";
    }

    return "";
  };

  const handleNameArChange = (value: string) => {
    // Limit to 50 characters
    const limitedValue = value.slice(0, 50);

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
    // Limit to 50 characters
    const limitedValue = value.slice(0, 50);

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

  const handlePriceChange = (value: string) => {
    // For number input, value may be "" or a numeric string like "3.5"
    const cleaned = value.replace(/,/g, "").trim();

    if (cleaned === "" || cleaned === ".") {
      setFormData((prev) => ({ ...prev, price: 0 }));
      setPriceError("");
      return;
    }

    // Parse float and clamp/round
    let num = parseFloat(cleaned);
    if (isNaN(num)) {
      num = 0;
    }

    // Limit digits before decimal to 7
    const [intPart] = cleaned.split(".");
    if (intPart && intPart.replace(/[^0-9]/g, "").length > 7) {
      return;
    }

    // clamp and round to 2 decimals
    num = Math.min(Math.max(num, 0), 9999999);
    num = Math.round(num * 100) / 100;

    setFormData((prev) => ({ ...prev, price: num }));

    // Validate and set error using the numeric string
    const error = validatePrice(num.toString());
    setPriceError(error);
  };

  const handleDescriptionArChange = (value: string) => {
    // Limit to 300 characters
    const limitedValue = value.slice(0, 300);

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

    setFormData((prev) => ({ ...prev, descriptionAr: processedValue }));

    // Validate and set error
    const error = validateDescription(processedValue);
    setDescriptionArError(error);
  };

  const handleDescriptionEnChange = (value: string) => {
    // Limit to 300 characters
    const limitedValue = value.slice(0, 300);

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

    setFormData((prev) => ({ ...prev, descriptionEn: processedValue }));

    // Validate and set error
    const error = validateDescription(processedValue);
    setDescriptionEnError(error);
  };

  const handleChange = (
    field: string,
    value: string | string[] | File | undefined,
  ) => {
    if (field === "nameAr" && typeof value === "string") {
      handleNameArChange(value);
    } else if (field === "nameEn" && typeof value === "string") {
      handleNameEnChange(value);
    } else if (field === "price" && typeof value === "string") {
      handlePriceChange(value);
    } else if (field === "descriptionAr" && typeof value === "string") {
      handleDescriptionArChange(value);
    } else if (field === "descriptionEn" && typeof value === "string") {
      handleDescriptionEnChange(value);
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

      if (formData.price < 0.01) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "يرجى ادخال سعر المنتج",
        });
        setTimeout(() => setToast(null), 5000);
        setIsLoading(false);
        return;
      }

      // Check for price validation errors
      const priceValidationError = validatePrice(formData.price.toString());
      if (priceValidationError) {
        setToast({
          variant: "error",
          title: "خطأ في السعر",
          message: priceValidationError,
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      if (!formData.descriptionAr) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "الوصف بالعربي مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      // Check for Arabic description validation errors
      const descriptionArValidationError = validateDescription(
        formData.descriptionAr,
      );
      if (descriptionArValidationError) {
        setToast({
          variant: "error",
          title: "خطأ في الوصف بالعربية",
          message: descriptionArValidationError,
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      // Check for English description validation errors if provided
      if (formData.descriptionEn.trim()) {
        const descriptionEnValidationError = validateDescription(
          formData.descriptionEn,
        );
        if (descriptionEnValidationError) {
          setToast({
            variant: "error",
            title: "خطأ في الوصف بالإنجليزية",
            message: descriptionEnValidationError,
          });
          setTimeout(() => setToast(null), 5000);
          return;
        }
      }

      if (!formData.shopId) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "معرف المتجر مطلوب.",
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

      const effectiveNameEn = formData.nameEn?.trim()
        ? formData.nameEn.trim()
        : formData.nameAr.trim();

      const effectiveDescriptionEn = formData.descriptionEn?.trim()
        ? formData.descriptionEn.trim()
        : formData.descriptionAr.trim();

      let imageUrl = "";
      if (formData.image instanceof File && formData.image.size > 0) {
        const uploaded = await uploadImage(formData.image);
        imageUrl = uploaded.data;
      }

      const payloadRaw: CreateProductPayload = {
        nameAr: formData.nameAr,
        nameEn: effectiveNameEn,
        price: formData.price,
        shopId: formData.shopId,
        descriptionAr: formData.descriptionAr,
        descriptionEn: effectiveDescriptionEn,
        category: formData.category,
        image: imageUrl,
        extensions:
          formData.extensions.length > 0 ? formData.extensions : undefined,
      };
      // Remove empty-string fields
      const payload = Object.fromEntries(
        Object.entries(payloadRaw).filter((entry) => {
          const v = entry[1] as unknown;
          return typeof v === "string" ? v.trim() !== "" : true;
        }),
      ) as CreateProductPayload;

      await createProduct(payload);
      setToast({
        variant: "success",
        title: "نجح إنشاء المنتج",
        message: "تم إنشاء المنتج بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
      setIsLoading(false);
      setFormData({
        nameAr: "",
        nameEn: "",
        price: 0,
        shopId: "",
        descriptionAr: "",
        descriptionEn: "",
        category: "",
        categories: [],
        image: new File([], ""),
        extensions: [],
      });
      setCollapsedExtensions([]);
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في إنشاء المنتج",
          message:
            err.response?.data?.message ||
            "فشل في إنشاء المنتج. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to add product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      nameAr: "",
      nameEn: "",
      price: 0,
      shopId: "",
      descriptionAr: "",
      descriptionEn: "",
      category: "",
      categories: [],
      image: new File([], ""),
      extensions: [],
    });
    setCollapsedExtensions([]);
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
          <div className="custom-scrollbar max-h-[70vh] overflow-y-auto px-2 pb-3">
            <div>
              <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
                إضافة منتج جديد
              </h5>

              <h6 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                البيانات الاساسية
              </h6>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Product Image */}
                <div className="lg:col-span-2">
                  <Label>صورة المنتج</Label>
                  <FileInput
                    accept="image/*"
                    onChange={(e) => handleChange("image", e.target.files?.[0])}
                  />
                </div>

                {/* Name (in Arabic) */}
                <div>
                  <Label>
                    الاسم (بالعربية) <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="ادخل اسم المنتج بالعربي"
                    value={formData.nameAr}
                    onChange={(e) => handleChange("nameAr", e.target.value)}
                    error={!!nameArError}
                    hint={nameArError || `${formData.nameAr.length}/50`}
                    required
                  />
                </div>

                {/* Name (in English) */}
                <div>
                  <Label>الاسم (بالإنجليزية)</Label>
                  <Input
                    type="text"
                    placeholder="Enter the product name in English"
                    value={formData.nameEn}
                    onChange={(e) => handleChange("nameEn", e.target.value)}
                    error={!!nameEnError}
                    hint={nameEnError || `${formData.nameEn.length}/50`}
                    dir="ltr"
                  />
                </div>

                {/* Price */}
                <div>
                  <Label>
                    السعر <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="ادخل سعر المنتج"
                    step={0.01}
                    min="1"
                    value={formData.price === 0 ? "" : formData.price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    error={!!priceError}
                    hint={
                      priceError ||
                      `${formData.price.toString().replace(/,/g, "").length}/7`
                    }
                    required
                  />
                </div>

                {/* Description Arabic */}
                <div>
                  <Label>
                    الوصف بالعربي <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="ادخل وصف المنتج بالعربي"
                    value={formData.descriptionAr}
                    onChange={(e) =>
                      handleChange("descriptionAr", e.target.value)
                    }
                    error={!!descriptionArError}
                    hint={
                      descriptionArError ||
                      `${formData.descriptionAr.length}/300`
                    }
                    required
                  />
                </div>

                {/* Description English */}
                <div>
                  <Label>الوصف بالإنجليزي</Label>
                  <Input
                    type="text"
                    placeholder="Enter the description in English"
                    value={formData.descriptionEn}
                    onChange={(e) =>
                      handleChange("descriptionEn", e.target.value)
                    }
                    error={!!descriptionEnError}
                    hint={
                      descriptionEnError ||
                      `${formData.descriptionEn.length}/300`
                    }
                  />
                </div>

                {/* Shop */}
                <div>
                  <Label>
                    المتجر <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      options={vendors.map((vendor) => ({
                        value: vendor._id,
                        label: vendor.name,
                      }))}
                      placeholder="اختر متجراً"
                      onChange={(val) => handleChange("shopId", val)}
                      className="dark:bg-dark-900"
                      required
                      defaultValue={vendorId || undefined}
                      disabled={!!vendorId}
                    />
                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                  {vendorId && (
                    <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                      مرتبط تلقائياً بهذا المتجر.
                    </p>
                  )}
                </div>

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
                      placeholder={
                        !formData.shopId
                          ? "يرجى اختيار متجر أولاً"
                          : categories.length === 0
                            ? "لا توجد فئات لهذا المتجر"
                            : "اختر الفئات"
                      }
                      onChange={(val) => handleChange("category", val)}
                      disabled={!formData.shopId || categories.length === 0}
                      className="dark:bg-dark-900"
                      required
                    />
                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                {/* Subcategories */}
                {/* <MultiSelect
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
                /> */}
              </div>
            </div>

            {/* Extensions Section */}
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h6 className="text-base font-medium text-gray-800 dark:text-white/90">
                  الاضافات
                </h6>
                <button
                  type="button"
                  className="text-brand-500 hover:text-brand-600 flex items-center gap-1 text-sm font-medium"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      extensions: [
                        ...prev.extensions,
                        {
                          titleAr: "",
                          titleEn: "",
                          options: [{ nameAr: "", nameEn: "", price: 0 }],
                        },
                      ],
                    }));
                    setCollapsedExtensions((prev) => [...prev, false]);
                  }}
                >
                  <FaPlus className="h-3 w-3" />
                  إضافة إختيارات للمنتج
                </button>
              </div>

              {formData.extensions.map((ext, extIdx) => (
                <div
                  key={extIdx}
                  className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  {/* Extension Header */}
                  <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                    <div className="flex flex-1 items-center gap-3">
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        onClick={() => {
                          setCollapsedExtensions((prev) => {
                            const next = [...prev];
                            next[extIdx] = !next[extIdx];
                            return next;
                          });
                        }}
                      >
                        {collapsedExtensions[extIdx] ? (
                          <FaChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <FaChevronUp className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <Input
                        type="text"
                        placeholder="اسم الإضافة بالعربية"
                        value={ext.titleAr}
                        onChange={(e) => {
                          const newExts = [...formData.extensions];
                          newExts[extIdx] = {
                            ...newExts[extIdx],
                            titleAr: e.target.value,
                          };
                          setFormData((prev) => ({
                            ...prev,
                            extensions: newExts,
                          }));
                        }}
                      />
                      <Input
                        type="text"
                        placeholder="Extension title in English"
                        value={ext.titleEn}
                        onChange={(e) => {
                          const newExts = [...formData.extensions];
                          newExts[extIdx] = {
                            ...newExts[extIdx],
                            titleEn: e.target.value,
                          };
                          setFormData((prev) => ({
                            ...prev,
                            extensions: newExts,
                          }));
                        }}
                        dir="ltr"
                      />
                    </div>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          extensions: prev.extensions.filter(
                            (_, i) => i !== extIdx,
                          ),
                        }));
                        setCollapsedExtensions((prev) =>
                          prev.filter((_, i) => i !== extIdx),
                        );
                      }}
                    >
                      <FaTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Extension Options (collapsible) */}
                  {!collapsedExtensions[extIdx] && (
                    <div className="px-4 py-3">
                      {/* Options Header */}
                      <div className="mb-2 grid grid-cols-[1fr_1fr_100px_40px] gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <span>اسم الاضافة (عربي)</span>
                        <span>اسم الاضافة (English)</span>
                        <span>سعر الاضافة</span>
                        <span></span>
                      </div>

                      {/* Option Rows */}
                      {ext.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className="mb-2 grid grid-cols-[1fr_1fr_100px_40px] items-center gap-3"
                        >
                          <Input
                            type="text"
                            placeholder="ادخل اسم"
                            value={opt.nameAr}
                            onChange={(e) => {
                              const newExts = [...formData.extensions];
                              const newOpts = [...newExts[extIdx].options];
                              newOpts[optIdx] = {
                                ...newOpts[optIdx],
                                nameAr: e.target.value,
                              };
                              newExts[extIdx] = {
                                ...newExts[extIdx],
                                options: newOpts,
                              };
                              setFormData((prev) => ({
                                ...prev,
                                extensions: newExts,
                              }));
                            }}
                          />
                          <Input
                            type="text"
                            placeholder="Enter name"
                            value={opt.nameEn}
                            onChange={(e) => {
                              const newExts = [...formData.extensions];
                              const newOpts = [...newExts[extIdx].options];
                              newOpts[optIdx] = {
                                ...newOpts[optIdx],
                                nameEn: e.target.value,
                              };
                              newExts[extIdx] = {
                                ...newExts[extIdx],
                                options: newOpts,
                              };
                              setFormData((prev) => ({
                                ...prev,
                                extensions: newExts,
                              }));
                            }}
                            dir="ltr"
                          />
                          <Input
                            type="number"
                            placeholder="0"
                            value={opt.price === 0 ? "" : opt.price}
                            onChange={(e) => {
                              const newExts = [...formData.extensions];
                              const newOpts = [...newExts[extIdx].options];
                              newOpts[optIdx] = {
                                ...newOpts[optIdx],
                                price: parseFloat(e.target.value) || 0,
                              };
                              newExts[extIdx] = {
                                ...newExts[extIdx],
                                options: newOpts,
                              };
                              setFormData((prev) => ({
                                ...prev,
                                extensions: newExts,
                              }));
                            }}
                            min="0"
                          />
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center text-red-500 hover:text-red-700"
                            onClick={() => {
                              if (ext.options.length <= 1) return;
                              const newExts = [...formData.extensions];
                              newExts[extIdx] = {
                                ...newExts[extIdx],
                                options: newExts[extIdx].options.filter(
                                  (_, i) => i !== optIdx,
                                ),
                              };
                              setFormData((prev) => ({
                                ...prev,
                                extensions: newExts,
                              }));
                            }}
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                        </div>
                      ))}

                      {/* Add Option Button */}
                      <button
                        type="button"
                        className="bg-brand-500 hover:bg-brand-600 mt-2 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white"
                        onClick={() => {
                          const newExts = [...formData.extensions];
                          newExts[extIdx] = {
                            ...newExts[extIdx],
                            options: [
                              ...newExts[extIdx].options,
                              { nameAr: "", nameEn: "", price: 0 },
                            ],
                          };
                          setFormData((prev) => ({
                            ...prev,
                            extensions: newExts,
                          }));
                        }}
                      >
                        <FaPlus className="h-2.5 w-2.5" />
                        اضف الخيار
                      </button>
                    </div>
                  )}
                </div>
              ))}
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

export function AddProductButton({
  onSuccess,
  vendorId,
}: {
  onSuccess?: () => void;
  vendorId?: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();

  const handleAfterCreate = async () => {
    onSuccess?.(); // call parent's refetch
    closeModal();
  };

  return (
    <>
      <Button size="md" variant="primary" onClick={openModal}>
        + أضف منتج
      </Button>
      <AddProductModal
        isOpen={isOpen}
        closeModal={closeModal}
        onSuccess={handleAfterCreate}
        vendorId={vendorId}
      />
    </>
  );
}

export function EditProductModal({
  isOpen = false,
  closeModal = () => {},
  product = {} as Product,
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nameArError, setNameArError] = useState<string>("");
  const [nameEnError, setNameEnError] = useState<string>("");
  const [priceError, setPriceError] = useState<string>("");
  const [descriptionArError, setDescriptionArError] = useState<string>("");
  const [descriptionEnError, setDescriptionEnError] = useState<string>("");
  const [collapsedExtensions, setCollapsedExtensions] = useState<boolean[]>([]);

  const [formData, setFormData] = useState<{
    nameAr: string;
    nameEn: string;
    price: number;
    shopId: string;
    descriptionAr: string;
    descriptionEn: string;
    category: string;
    image: string | File;
    extensions: Extension[];
  }>({
    nameAr: product.nameAr || "",
    nameEn: product.nameEn || "",
    price: product.price || 0,
    shopId: product.shopId._id || "",
    descriptionAr: product.descriptionAr || "",
    descriptionEn: product.descriptionEn || "",
    category: product.category._id || "",
    image: product.image || new File([], ""),
    extensions: product.extensions || [],
  });

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const { data: vendors } = await getAllVendors();
        setVendors(vendors);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      nameAr: product.nameAr || "",
      nameEn: product.nameEn || "",
      price: product.price || 0,
      shopId: product.shopId._id || "",
      descriptionAr: product.descriptionAr || "",
      descriptionEn: product.descriptionEn || "",
      category: product.category._id || "",
      image: product.image || "",
      extensions: product.extensions || [],
    });
    setCollapsedExtensions(
      new Array(product.extensions?.length || 0).fill(false),
    );
  }, [isOpen, product]);

  // Fetch vendor-specific categories (categoryshops) when shop changes (like AddProductModal)
  useEffect(() => {
    if (!formData.shopId || !isOpen) {
      setCategories([]);
      return;
    }
    const fetchVendorCategories = async () => {
      try {
        const { data } = await fetchCategoryshopsByVendor(formData.shopId);
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch vendor categories:", err);
        setCategories([]);
      }
    };
    fetchVendorCategories();
  }, [formData.shopId, isOpen]);

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

    // Check for invalid characters (only allow Arabic letters, numbers, and spaces)
    const validPattern =
      /^[\u0600-\u06FF0-9\s!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]+$/;
    if (!validPattern.test(normalizedName)) {
      return "الاسم يقبل الحروف العربية والأرقام والمسافات فقط";
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

    // Check for invalid characters (only allow English letters, numbers, and spaces)
    const validPattern = /^[a-zA-Z0-9\s!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]+$/;
    if (!validPattern.test(normalizedName)) {
      return "الاسم يقبل الحروف الإنجليزية والأرقام والمسافات فقط";
    }

    return "";
  };

  // Price validation function
  const validatePrice = (price: string): string => {
    // Remove commas and trim
    const cleanPrice = price.replace(/,/g, "").trim();

    // Check if empty
    if (!cleanPrice) {
      return "";
    }

    // Check if valid number
    const numPrice = parseFloat(cleanPrice);
    if (isNaN(numPrice)) {
      return "يرجى ادخال سعر المنتج";
    }

    // Check if zero
    if (numPrice === 0) {
      return "يرجى ادخال سعر المنتج";
    }

    // Check if less than 1
    if (numPrice < 1) {
      return "يرجى ادخال سعر المنتج";
    }

    return "";
  };

  // Description validation function
  const validateDescription = (description: string): string => {
    // Remove extra spaces and normalize
    const normalizedDesc = description.replace(/\s+/g, " ").trim();

    // Check if only spaces
    if (description.trim() === "") {
      return "";
    }

    // Check for invalid characters (allow letters, numbers, spaces, and special characters but not emojis)
    const validPattern =
      /^[\u0600-\u06FFa-zA-Z0-9\s\u0020-\u007E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]+$/;
    if (!validPattern.test(normalizedDesc)) {
      return "الوصف لا يقبل الرموز التعبيرية";
    }

    return "";
  };

  // Numeric price handler: accept number-like strings (including "" and "."),
  // limit to 7 digits before decimal, clamp to [0, 9_999_999], and round to 2 decimals.
  const handlePriceChange = (value: string) => {
    // For number input, value may be "" or a numeric string like "3.5"
    const cleaned = value.replace(/,/g, "").trim();

    if (cleaned === "" || cleaned === ".") {
      setFormData((prev) => ({ ...prev, price: 0 }));
      setPriceError("");
      return;
    }

    // Parse float and clamp/round
    let num = parseFloat(cleaned);
    if (isNaN(num)) {
      num = 0;
    }

    // Limit digits before decimal to 7
    const [intPart] = cleaned.split(".");
    if (intPart && intPart.replace(/[^0-9]/g, "").length > 7) {
      return;
    }

    // clamp and round to 2 decimals
    num = Math.min(Math.max(num, 0), 9999999);
    num = Math.round(num * 100) / 100;

    setFormData((prev) => ({ ...prev, price: num }));

    // Validate and set error using the numeric string
    const error = validatePrice(num.toString());
    setPriceError(error);
  };

  const handleNameArChange = (value: string) => {
    // Limit to 50 characters
    const limitedValue = value.slice(0, 50);

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
    // Limit to 50 characters
    const limitedValue = value.slice(0, 50);

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

  const handleDescriptionArChange = (value: string) => {
    // Limit to 300 characters
    const limitedValue = value.slice(0, 300);

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

    setFormData((prev) => ({ ...prev, descriptionAr: processedValue }));

    // Validate and set error
    const error = validateDescription(processedValue);
    setDescriptionArError(error);
  };

  const handleDescriptionEnChange = (value: string) => {
    // Limit to 300 characters
    const limitedValue = value.slice(0, 300);

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

    setFormData((prev) => ({ ...prev, descriptionEn: processedValue }));

    // Validate and set error
    const error = validateDescription(processedValue);
    setDescriptionEnError(error);
  };

  const handleChange = (
    field: string,
    value: string | string[] | File | undefined,
  ) => {
    if (field === "nameAr" && typeof value === "string") {
      handleNameArChange(value);
    } else if (field === "nameEn" && typeof value === "string") {
      handleNameEnChange(value);
    } else if (field === "price" && typeof value === "string") {
      handlePriceChange(value);
    } else if (field === "descriptionAr" && typeof value === "string") {
      handleDescriptionArChange(value);
    } else if (field === "descriptionEn" && typeof value === "string") {
      handleDescriptionEnChange(value);
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

      // Check for price validation errors if provided
      if (formData.price > 0) {
        const priceValidationError = validatePrice(formData.price.toString());
        if (priceValidationError) {
          setToast({
            variant: "error",
            title: "خطأ في السعر",
            message: priceValidationError,
          });
          setTimeout(() => setToast(null), 5000);
          setIsLoading(false);
          return;
        }
      }

      // Check for Arabic description validation errors if provided
      if (formData.descriptionAr.trim()) {
        const descriptionArValidationError = validateDescription(
          formData.descriptionAr,
        );
        if (descriptionArValidationError) {
          setToast({
            variant: "error",
            title: "خطأ في الوصف بالعربية",
            message: descriptionArValidationError,
          });
          setTimeout(() => setToast(null), 5000);
          setIsLoading(false);
          return;
        }
      }

      // Check for English description validation errors if provided
      if (formData.descriptionEn.trim()) {
        const descriptionEnValidationError = validateDescription(
          formData.descriptionEn,
        );
        if (descriptionEnValidationError) {
          setToast({
            variant: "error",
            title: "خطأ في الوصف بالإنجليزية",
            message: descriptionEnValidationError,
          });
          setTimeout(() => setToast(null), 5000);
          setIsLoading(false);
          return;
        }
      }

      let imageUrl = "";

      if (formData.image instanceof File && formData.image.size > 0) {
        const uploaded = await uploadImage(formData.image);
        imageUrl = uploaded.data || uploaded.url;
      } else if (typeof formData.image === "string") {
        imageUrl = formData.image;
      }

      const payloadRaw: Partial<CreateProductPayload> = {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn?.trim()
          ? formData.nameEn.trim()
          : formData.nameAr.trim(),
        price: formData.price,
        shopId: formData.shopId,
        descriptionAr: formData.descriptionAr,
        descriptionEn: formData.descriptionEn?.trim()
          ? formData.descriptionEn.trim()
          : formData.descriptionAr.trim(),
        category: formData.category,
        image: imageUrl,
        extensions:
          formData.extensions.length > 0 ? formData.extensions : undefined,
      };
      // Remove empty-string fields
      const payload = Object.fromEntries(
        Object.entries(payloadRaw).filter((entry) => {
          const v = entry[1] as unknown;
          return typeof v === "string" ? v.trim() !== "" : true;
        }),
      ) as Partial<CreateProductPayload>;

      await updateProduct(product._id, payload);
      setToast({
        variant: "success",
        title: "نجح تحديث المنتج",
        message: "تم تحديث المنتج بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في تحديث المنتج",
          message:
            err.response?.data?.message ||
            "فشل في تحديث المنتج. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to update product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      nameAr: product.nameAr || "",
      nameEn: product.nameEn || "",
      price: product.price || 0,
      shopId: product.shopId._id || "",
      descriptionAr: product.descriptionAr || "",
      descriptionEn: product.descriptionEn || "",
      category: product.category._id || "",
      image: product.image || new File([], ""),
      extensions: product.extensions || [],
    });
    setCollapsedExtensions(
      new Array(product.extensions?.length || 0).fill(false),
    );
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
          <div className="custom-scrollbar max-h-[70vh] overflow-y-auto px-2 pb-3">
            <div className="mb-6 text-center">
              <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                تعديل المنتج
              </h5>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                عدل تفاصيل المنتج وخيارات الإضافات
              </p>
            </div>

            <div>
              <h6 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                البيانات الاساسية
              </h6>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Product Image */}
                <div className="lg:col-span-2">
                  <Label>صورة المنتج</Label>
                  {typeof formData.image === "string" && formData.image && (
                    <Image
                      src={formData.image}
                      width={160}
                      height={160}
                      alt="Current Profile"
                      className="mb-4 justify-self-center"
                    />
                  )}
                  <FileInput
                    accept="image/*"
                    onChange={(e) => handleChange("image", e.target.files?.[0])}
                  />
                </div>

                {/* Name (in Arabic) */}
                <div>
                  <Label>الاسم (بالعربية)</Label>
                  <Input
                    type="text"
                    placeholder="ادخل اسم المنتج بالعربي"
                    value={formData.nameAr}
                    onChange={(e) => handleChange("nameAr", e.target.value)}
                    error={!!nameArError}
                    hint={nameArError || `${formData.nameAr.length}/50`}
                  />
                </div>

                {/* Name (in English) */}
                <div>
                  <Label>الاسم (بالإنجليزية)</Label>
                  <Input
                    type="text"
                    placeholder="Enter the product name in English"
                    value={formData.nameEn}
                    onChange={(e) => handleChange("nameEn", e.target.value)}
                    error={!!nameEnError}
                    hint={nameEnError || `${formData.nameEn.length}/50`}
                    dir="ltr"
                  />
                </div>

                {/* Price */}
                <div>
                  <Label>السعر</Label>
                  <Input
                    type="number"
                    placeholder="ادخل سعر المنتج"
                    step={0.01}
                    min="1"
                    value={formData.price === 0 ? "" : formData.price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    error={!!priceError}
                    hint={
                      priceError ||
                      `${formData.price.toString().replace(/,/g, "").length}/7`
                    }
                    className="!direction-ltr !text-left"
                  />
                </div>

                {/* Description Arabic */}
                <div>
                  <Label>الوصف بالعربي</Label>
                  <Input
                    type="text"
                    placeholder="ادخل وصف المنتج بالعربي"
                    value={formData.descriptionAr}
                    onChange={(e) =>
                      handleChange("descriptionAr", e.target.value)
                    }
                    error={!!descriptionArError}
                    hint={
                      descriptionArError ||
                      `${formData.descriptionAr.length}/300`
                    }
                  />
                </div>

                {/* Description English */}
                <div>
                  <Label>الوصف بالإنجليزي</Label>
                  <Input
                    type="text"
                    placeholder="Enter the description in English"
                    value={formData.descriptionEn}
                    onChange={(e) =>
                      handleChange("descriptionEn", e.target.value)
                    }
                    error={!!descriptionEnError}
                    hint={
                      descriptionEnError ||
                      `${formData.descriptionEn.length}/300`
                    }
                  />
                </div>

                {/* Shop */}
                <div>
                  <Label>المتجر</Label>
                  <div className="relative">
                    <Select
                      options={vendors.map((vendor) => ({
                        value: vendor._id,
                        label: vendor.name,
                      }))}
                      value={formData.shopId}
                      placeholder="اختر متجراً"
                      onChange={(val) => handleChange("shopId", val)}
                      className="dark:bg-dark-900"
                    />
                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label>الفئة</Label>
                  <div className="relative">
                    <Select
                      options={categories.map((cat) => ({
                        value: cat._id,
                        label:
                          (
                            cat as unknown as {
                              nameAr?: string;
                              nameEn?: string;
                              _id: string;
                            }
                          ).nameAr ||
                          (cat as unknown as { nameEn?: string }).nameEn ||
                          cat._id,
                      }))}
                      placeholder={
                        !formData.shopId
                          ? "يرجى اختيار متجر أولاً"
                          : categories.length === 0
                            ? "لا توجد فئات لهذا المتجر"
                            : "اختر الفئات"
                      }
                      defaultValue={formData.category}
                      onChange={(val) => handleChange("category", val)}
                      disabled={!formData.shopId || categories.length === 0}
                      className="dark:bg-dark-900"
                    />
                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Extensions Section */}
            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h6 className="text-base font-medium text-gray-800 dark:text-white/90">
                  الاضافات
                </h6>
                <button
                  type="button"
                  className="text-brand-500 hover:text-brand-600 flex items-center gap-1 text-sm font-medium"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      extensions: [
                        ...prev.extensions,
                        {
                          titleAr: "",
                          titleEn: "",
                          options: [{ nameAr: "", nameEn: "", price: 0 }],
                        },
                      ],
                    }));
                    setCollapsedExtensions((prev) => [...prev, false]);
                  }}
                >
                  <FaPlus className="h-3 w-3" />
                  إضافة إختيارات للمنتج
                </button>
              </div>

              {formData.extensions.map((ext, extIdx) => (
                <div
                  key={extIdx}
                  className="mb-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                    <div className="flex flex-1 items-center gap-3">
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                        onClick={() => {
                          setCollapsedExtensions((prev) => {
                            const next = [...prev];
                            next[extIdx] = !next[extIdx];
                            return next;
                          });
                        }}
                      >
                        {collapsedExtensions[extIdx] ? (
                          <FaChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <FaChevronUp className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <Input
                        type="text"
                        placeholder="اسم الإضافة بالعربية"
                        value={ext.titleAr}
                        onChange={(e) => {
                          const n = [...formData.extensions];
                          n[extIdx] = { ...n[extIdx], titleAr: e.target.value };
                          setFormData((prev) => ({ ...prev, extensions: n }));
                        }}
                      />
                      <Input
                        type="text"
                        placeholder="Extension title in English"
                        value={ext.titleEn}
                        onChange={(e) => {
                          const n = [...formData.extensions];
                          n[extIdx] = { ...n[extIdx], titleEn: e.target.value };
                          setFormData((prev) => ({ ...prev, extensions: n }));
                        }}
                        dir="ltr"
                      />
                    </div>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          extensions: prev.extensions.filter(
                            (_, i) => i !== extIdx,
                          ),
                        }));
                        setCollapsedExtensions((prev) =>
                          prev.filter((_, i) => i !== extIdx),
                        );
                      }}
                    >
                      <FaTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {!collapsedExtensions[extIdx] && (
                    <div className="px-4 py-3">
                      <div className="mb-2 grid grid-cols-[1fr_1fr_100px_40px] gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                        <span>اسم الاضافة (عربي)</span>
                        <span>اسم الاضافة (English)</span>
                        <span>سعر الاضافة</span>
                        <span></span>
                      </div>
                      {ext.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className="mb-2 grid grid-cols-[1fr_1fr_100px_40px] items-center gap-3"
                        >
                          <Input
                            type="text"
                            placeholder="ادخل اسم"
                            value={opt.nameAr}
                            onChange={(e) => {
                              const n = [...formData.extensions];
                              const o = [...n[extIdx].options];
                              o[optIdx] = {
                                ...o[optIdx],
                                nameAr: e.target.value,
                              };
                              n[extIdx] = { ...n[extIdx], options: o };
                              setFormData((prev) => ({
                                ...prev,
                                extensions: n,
                              }));
                            }}
                          />
                          <Input
                            type="text"
                            placeholder="Enter name"
                            value={opt.nameEn}
                            onChange={(e) => {
                              const n = [...formData.extensions];
                              const o = [...n[extIdx].options];
                              o[optIdx] = {
                                ...o[optIdx],
                                nameEn: e.target.value,
                              };
                              n[extIdx] = { ...n[extIdx], options: o };
                              setFormData((prev) => ({
                                ...prev,
                                extensions: n,
                              }));
                            }}
                            dir="ltr"
                          />
                          <Input
                            type="number"
                            placeholder="0"
                            value={opt.price === 0 ? "" : opt.price}
                            onChange={(e) => {
                              const n = [...formData.extensions];
                              const o = [...n[extIdx].options];
                              o[optIdx] = {
                                ...o[optIdx],
                                price: parseFloat(e.target.value) || 0,
                              };
                              n[extIdx] = { ...n[extIdx], options: o };
                              setFormData((prev) => ({
                                ...prev,
                                extensions: n,
                              }));
                            }}
                            min="0"
                          />
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center text-red-500 hover:text-red-700"
                            onClick={() => {
                              if (ext.options.length <= 1) return;
                              const n = [...formData.extensions];
                              n[extIdx] = {
                                ...n[extIdx],
                                options: n[extIdx].options.filter(
                                  (_, i) => i !== optIdx,
                                ),
                              };
                              setFormData((prev) => ({
                                ...prev,
                                extensions: n,
                              }));
                            }}
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="bg-brand-500 hover:bg-brand-600 mt-2 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white"
                        onClick={() => {
                          const n = [...formData.extensions];
                          n[extIdx] = {
                            ...n[extIdx],
                            options: [
                              ...n[extIdx].options,
                              { nameAr: "", nameEn: "", price: 0 },
                            ],
                          };
                          setFormData((prev) => ({ ...prev, extensions: n }));
                        }}
                      >
                        <FaPlus className="h-2.5 w-2.5" />
                        اضف الخيار
                      </button>
                    </div>
                  )}
                </div>
              ))}
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

export function EditProductButton({
  product,
  onSuccess,
}: {
  product: Product;
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
      <EditProductModal
        isOpen={isOpen}
        closeModal={closeModal}
        product={product}
        onSuccess={handleAfterEdit}
      />
    </>
  );
}

export function DeleteProductModal({
  isOpen = false,
  closeModal = () => {},
  productId = "",
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const handleDelete = async () => {
    try {
      await deleteProduct(productId);
      setToast({
        variant: "success",
        title: "نجح حذف المنتج",
        message: "تم حذف المنتج بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
      closeModal();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في حذف المنتج",
          message:
            err.response?.data?.message ||
            "فشل في حذف المنتج. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to delete product:", err);
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
            حذف المنتج
          </h4>

          <p>هل أنت متأكد من حذف هذا المنتج؟</p>

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

export function DeleteProductButton({
  productId,
  onSuccess,
}: {
  productId: string;
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
      <DeleteProductModal
        isOpen={isOpen}
        closeModal={closeModal}
        productId={productId}
        onSuccess={handleAfterDelete}
      />
    </>
  );
}
