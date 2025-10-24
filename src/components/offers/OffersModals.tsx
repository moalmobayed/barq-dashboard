// components/offers/AddOfferModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import FileInput from "../form/input/FileInput";
import { ChevronDownIcon } from "../../../public/icons";
import Select from "../form/Select";
import { useModal } from "@/hooks/useModal";
import { createOffer, deleteOffer, updateOffer } from "@/lib/api/offers";
import { uploadImage } from "@/lib/api/uploadImage";
import { CreateOfferPayload, Offer } from "@/types/offer";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import Image from "next/image";
import Alert, { AlertProps } from "@/components/ui/alert/Alert";
import { AxiosError } from "axios";
import { Product } from "@/types/product";
import { fetchProducts } from "@/lib/api/products";
import DatePicker from "../form/date-picker";

export function AddOfferModal({
  isOpen = false,
  closeModal = () => {},
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendor, setVendor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nameArError, setNameArError] = useState<string>("");
  const [nameEnError, setNameEnError] = useState<string>("");
  const [descriptionArError, setDescriptionArError] = useState<string>("");
  const [descriptionEnError, setDescriptionEnError] = useState<string>("");

  const [formData, setFormData] = useState<{
    nameAr: string;
    nameEn: string;
    product: string;
    image: File;
    descriptionAr: string;
    descriptionEn: string;
    discount: number;
    startDate: Date | undefined;
    endDate: Date | undefined;
    shopId: string;
  }>({
    nameAr: "",
    nameEn: "",
    product: "",
    image: new File([], ""), // Initialize with an empty file
    descriptionAr: "",
    descriptionEn: "",
    discount: 1,
    startDate: undefined,
    endDate: undefined,
    shopId: "",
  });

  // Name validation function (Arabic)
  const validateNameAr = (name: string): string => {
    if (!name.trim()) {
      return "";
    }

    if (name.length < 2) {
      return "يجب أن لا يقل الاسم عن حرفين";
    }

    if (name.length > 60) {
      return "الاسم طويل جداً";
    }

    // Check for only Arabic and spaces
    const validPattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]+$/;
    if (!validPattern.test(name)) {
      return "الاسم يقبل الحروف العربية والمسافات فقط";
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

  // Name validation function (English)
  const validateNameEn = (name: string): string => {
    if (!name.trim()) {
      return "";
    }

    if (name.length < 2) {
      return "Name must be at least 2 characters";
    }

    if (name.length > 60) {
      return "Name is too long";
    }

    // Check for only English letters and spaces
    const validPattern = /^[a-zA-Z\s]+$/;
    if (!validPattern.test(name)) {
      return "Name accepts English letters and spaces only";
    }

    // Check for leading or trailing spaces
    if (name.startsWith(" ") || name.endsWith(" ")) {
      return "Name cannot start or end with a space";
    }

    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(name)) {
      return "Only one space between words";
    }

    return "";
  };

  // Description validation function (Arabic)
  const validateDescriptionAr = (description: string): string => {
    if (!description.trim()) {
      return "";
    }

    if (description.length < 10) {
      return "يجب أن لا يقل الوصف عن 10 أحرف";
    }

    if (description.length > 300) {
      return "الوصف طويل جداً";
    }

    // Check for Arabic letters, numbers, spaces, and common Arabic punctuation only
    const validPattern = /^[\u0600-\u06FF\u0750-\u077F0-9\s،؛؟!.\-()]+$/;
    if (!validPattern.test(description)) {
      return "الوصف يقبل الحروف العربية والأرقام والمسافات وعلامات الترقيم فقط";
    }

    // Check for leading or trailing spaces
    if (description.startsWith(" ") || description.endsWith(" ")) {
      return "لا يمكن أن يبدأ أو ينتهي الوصف بمسافة";
    }

    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(description)) {
      return "مسافة واحدة فقط بين الكلمات";
    }

    // Check if it's only spaces
    if (description.trim() === "") {
      return "الوصف لا يمكن أن يكون مسافات فقط";
    }

    return "";
  };

  // Description validation function (English)
  const validateDescriptionEn = (description: string): string => {
    if (!description.trim()) {
      return "";
    }

    if (description.length < 10) {
      return "Description must be at least 10 characters";
    }

    if (description.length > 300) {
      return "Description is too long";
    }

    // Check for English letters, numbers, spaces, and common punctuation only
    const validPattern = /^[a-zA-Z0-9\s,.;?!\-()]+$/;
    if (!validPattern.test(description)) {
      return "Description accepts English letters, numbers, spaces, and punctuation only";
    }

    // Check for leading or trailing spaces
    if (description.startsWith(" ") || description.endsWith(" ")) {
      return "Description cannot start or end with a space";
    }

    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(description)) {
      return "Only one space between words";
    }

    return "";
  };

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        const { data: products } = await fetchProducts(1, 1000);
        setProducts(products);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [isOpen]);

  // Fetch shop when product changes
  useEffect(() => {
    if (!formData.product) {
      setVendor("");
      setFormData((prev) => ({ ...prev, shopId: "" }));
      return;
    }
    const prod = products.find((p) => p._id === formData.product);
    if (prod) {
      const shopName = prod.shopId?.name || "";
      const shopId = prod.shopId?._id || "";
      setVendor(shopName);
      setFormData((prev) => ({ ...prev, shopId }));
    } else {
      setVendor("");
      setFormData((prev) => ({ ...prev, shopId: "" }));
    }
  }, [formData.product, formData.shopId, products]);

  const handleChange = (
    field: string,
    value: string | string[] | File | undefined,
  ) => {
    if (typeof value === "string") {
      // Handle discount field specially: parse as number and round to 2 decimals
      if (field === "discount") {
        // Allow empty string -> set to 0
        const raw = value === "" ? "0" : value;
        let num = parseFloat(raw);
        if (isNaN(num)) num = 0;
        // clamp between 0 and 100 (percentage)
        num = Math.min(Math.max(num, 0), 100);
        // round to 2 decimals
        num = Math.round(num * 100) / 100;
        setFormData((prev) => ({ ...prev, [field]: num }));
        return;
      }

      // Handle nameAr field validation
      if (field === "nameAr") {
        // Limit to 60 characters
        if (value.length > 60) {
          return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        setNameArError(validateNameAr(value));
      }
      // Handle nameEn field validation
      else if (field === "nameEn") {
        // Limit to 60 characters
        if (value.length > 60) {
          return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        setNameEnError(validateNameEn(value));
      }
      // Handle descriptionAr field validation
      else if (field === "descriptionAr") {
        // Limit to 300 characters
        if (value.length > 300) {
          return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        setDescriptionArError(validateDescriptionAr(value));
      }
      // Handle descriptionEn field validation
      else if (field === "descriptionEn") {
        // Limit to 300 characters
        if (value.length > 300) {
          return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        setDescriptionEnError(validateDescriptionEn(value));
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
      const nameArValidationError = validateNameAr(formData.nameAr);
      const nameEnValidationError = validateNameEn(formData.nameEn);
      const descriptionArValidationError = validateDescriptionAr(
        formData.descriptionAr,
      );
      const descriptionEnValidationError = validateDescriptionEn(
        formData.descriptionEn,
      );

      setNameArError(nameArValidationError);
      setNameEnError(nameEnValidationError);
      setDescriptionArError(descriptionArValidationError);
      setDescriptionEnError(descriptionEnValidationError);

      // Check if there are any validation errors
      if (
        nameArValidationError ||
        nameEnValidationError ||
        descriptionArValidationError ||
        descriptionEnValidationError
      ) {
        setIsLoading(false);
        return;
      }

      // Validation for required fields
      if (!formData.nameAr) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "اسم العرض بالعربي مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }
      if (!formData.nameEn) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "اسم العرض بالإنجليزي مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }
      if (!formData.product) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "اسم المنتج مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }
      if (!formData.shopId) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "اسم المتجر مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }
      if (!formData.descriptionAr) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "وصف العرض بالعربي مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }
      if (!formData.descriptionEn) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "وصف العرض بالإنجليزي مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }
      if (!formData.discount) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "نسبة الخصم مطلوبة.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }
      if (!formData.startDate) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "تاريخ البدء مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }
      if (!formData.endDate) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "تاريخ الانتهاء مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }
      if (
        !formData.image ||
        !(formData.image instanceof File) ||
        formData.image.size === 0
      ) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "صورة العرض مطلوبة.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      let imageUrl = "";
      if (formData.image instanceof File && formData.image.size > 0) {
        const uploaded = await uploadImage(formData.image);
        imageUrl = uploaded.data;
      }

      const payloadRaw: CreateOfferPayload = {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
        product: formData.product,
        image: imageUrl,
        descriptionAr: formData.descriptionAr,
        descriptionEn: formData.descriptionEn,
        discount: formData.discount,
        startDate: formData.startDate,
        endDate: formData.endDate,
        shopId: formData.shopId,
      };
      // Remove empty-string fields
      const payload = Object.fromEntries(
        Object.entries(payloadRaw).filter((entry) => {
          const v = entry[1] as unknown;
          return typeof v === "string" ? v.trim() !== "" : true;
        }),
      ) as CreateOfferPayload;

      await createOffer(payload);
      setToast({
        variant: "success",
        title: "نجح إنشاء العرض",
        message: "تم إنشاء العرض بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      setFormData({
        nameAr: "",
        nameEn: "",
        product: "",
        image: new File([], ""), // Initialize with an empty file
        descriptionAr: "",
        descriptionEn: "",
        discount: 1,
        startDate: undefined,
        endDate: undefined,
        shopId: "",
      });
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في إنشاء العرض",
          message:
            err.response?.data?.message ||
            "فشل في إنشاء العرض. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to add offer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      nameAr: "",
      nameEn: "",
      product: "",
      image: new File([], ""),
      descriptionAr: "",
      descriptionEn: "",
      discount: 1,
      startDate: undefined,
      endDate: undefined,
      shopId: "",
    });
    setNameArError("");
    setNameEnError("");
    setDescriptionArError("");
    setDescriptionEnError("");
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
                إضافة عرض
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Offer Image */}
                <div className="lg:col-span-2">
                  <Label>
                    صورة العرض <span className="text-error-500">*</span>
                  </Label>
                  <FileInput
                    accept="image/*"
                    onChange={(e) => handleChange("image", e.target.files?.[0])}
                  />
                </div>

                {/* Name Arabic */}
                <div>
                  <Label>
                    الاسم بالعربي <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="ادخل اسم العرض بالعربي"
                    value={formData.nameAr}
                    onChange={(e) => handleChange("nameAr", e.target.value)}
                    error={!!nameArError}
                    hint={nameArError || `${formData.nameAr.length}/60`}
                    required
                  />
                </div>

                {/* Name English */}
                <div>
                  <Label>
                    الاسم بالإنجليزي <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter offer name in English"
                    value={formData.nameEn}
                    onChange={(e) => handleChange("nameEn", e.target.value)}
                    error={!!nameEnError}
                    hint={nameEnError || `${formData.nameEn.length}/60`}
                    required
                  />
                </div>

                {/* Product */}
                <div>
                  <Label>
                    المنتج <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      options={products.map((prod) => ({
                        value: prod._id,
                        label: prod.nameAr,
                      }))}
                      placeholder="اختر المنتج"
                      onChange={(val) => handleChange("product", val)}
                      required
                    />
                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                {/* Vendor (auto-filled) */}
                <div>
                  <Label>
                    المتجر <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    value={vendor}
                    placeholder={!vendor ? "يرجى اختيار منتج أولاً" : ""}
                    disabled
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
                  <Label>
                    الوصف بالإنجليزي <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter product description in English"
                    value={formData.descriptionEn}
                    onChange={(e) =>
                      handleChange("descriptionEn", e.target.value)
                    }
                    error={!!descriptionEnError}
                    hint={
                      descriptionEnError ||
                      `${formData.descriptionEn.length}/300`
                    }
                    required
                  />
                </div>

                {/* Discount */}
                <div>
                  <Label>
                    الخصم بالنسبة المئوية (%){" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="أدخل قيمة الخصم للعرض"
                    min="1"
                    max="100"
                    step={0.1}
                    value={formData.discount}
                    onChange={(e) => handleChange("discount", e.target.value)}
                    required
                    dir="ltr"
                    className="text-end"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <Label>
                    تاريخ البدء <span className="text-error-500">*</span>
                  </Label>
                  <DatePicker
                    id="start-date-picker"
                    placeholder="تاريخ البدء"
                    minDate="now"
                    maxDate={(() => {
                      const maxDate = new Date();
                      maxDate.setMonth(maxDate.getMonth() + 3);
                      return maxDate.toISOString().split("T")[0];
                    })()}
                    onChange={(dates, currentDateString) => {
                      handleChange("startDate", currentDateString);
                    }}
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <Label>
                    تاريخ الانتهاء <span className="text-error-500">*</span>
                  </Label>
                  <DatePicker
                    id="end-date-picker"
                    key={`end-date-${formData.startDate}`} // Force re-render when startDate changes
                    placeholder="تاريخ الانتهاء"
                    minDate={formData.startDate || "now"}
                    maxDate={(() => {
                      const maxDate = new Date();
                      maxDate.setMonth(maxDate.getMonth() + 3);
                      return maxDate.toISOString().split("T")[0];
                    })()}
                    onChange={(dates, currentDateString) => {
                      handleChange("endDate", currentDateString);
                    }}
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

export function AddOfferButton({ onSuccess }: { onSuccess?: () => void }) {
  const { isOpen, openModal, closeModal } = useModal();

  const handleAfterCreate = async () => {
    onSuccess?.(); // call parent's refetch
    closeModal();
  };

  return (
    <>
      <Button size="md" variant="primary" onClick={openModal}>
        + إضافة عرض
      </Button>
      <AddOfferModal
        isOpen={isOpen}
        closeModal={closeModal}
        onSuccess={handleAfterCreate}
      />
    </>
  );
}

export function EditOfferModal({
  isOpen = false,
  closeModal = () => {},
  offer = {} as Offer,
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [nameArError, setNameArError] = useState<string>("");
  const [nameEnError, setNameEnError] = useState<string>("");
  const [descriptionArError, setDescriptionArError] = useState<string>("");
  const [descriptionEnError, setDescriptionEnError] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<{
    nameAr: string;
    nameEn: string;
    image: string | File;
    descriptionAr: string;
    descriptionEn: string;
    discount: number;
    startDate: Date;
    endDate: Date;
  }>({
    nameAr: offer.nameAr || "",
    nameEn: offer.nameEn || "",
    image: offer.image || "",
    descriptionAr: offer.descriptionAr || "",
    descriptionEn: offer.descriptionEn || "",
    discount: offer.discount || 0,
    startDate: offer.startDate || new Date(),
    endDate: offer.endDate || new Date(),
  });

  // Name validation function (Arabic)
  const validateNameAr = (name: string): string => {
    if (!name.trim()) {
      return "";
    }

    if (name.length < 2) {
      return "يجب أن لا يقل الاسم عن حرفين";
    }

    if (name.length > 60) {
      return "الاسم طويل جداً";
    }

    // Check for only Arabic and spaces
    const validPattern = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s]+$/;
    if (!validPattern.test(name)) {
      return "الاسم يقبل الحروف العربية والمسافات فقط";
    }

    // Check for leading or trailing spaces
    if (name.startsWith(" ") || name.endsWith(" ")) {
      return "لا يمكن أن يبدأ أو ينتهي الاسم بمسافة";
    }

    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(name)) {
      return "مسافة واحدة فقط بين الكلمات";
    }

    return "";
  };

  // Name validation function (English)
  const validateNameEn = (name: string): string => {
    if (!name.trim()) {
      return "";
    }

    if (name.length < 2) {
      return "Name must be at least 2 characters";
    }

    if (name.length > 60) {
      return "Name is too long";
    }

    // Check for only English letters and spaces
    const validPattern = /^[a-zA-Z\s]+$/;
    if (!validPattern.test(name)) {
      return "Name accepts English letters and spaces only";
    }

    // Check for leading or trailing spaces
    if (name.startsWith(" ") || name.endsWith(" ")) {
      return "Name cannot start or end with a space";
    }

    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(name)) {
      return "Only one space between words";
    }

    return "";
  };

  // Description validation function (Arabic)
  const validateDescriptionAr = (description: string): string => {
    if (!description.trim()) {
      return "";
    }

    if (description.length < 10) {
      return "يجب أن لا يقل الوصف عن 10 أحرف";
    }

    if (description.length > 300) {
      return "الوصف طويل جداً";
    }

    // Check for Arabic letters, numbers, spaces, and common Arabic punctuation only
    const validPattern = /^[\u0600-\u06FF\u0750-\u077F0-9\s،؛؟!.\-()]+$/;
    if (!validPattern.test(description)) {
      return "الوصف يقبل الحروف العربية والأرقام والمسافات وعلامات الترقيم فقط";
    }

    // Check for leading or trailing spaces
    if (description.startsWith(" ") || description.endsWith(" ")) {
      return "لا يمكن أن يبدأ أو ينتهي الوصف بمسافة";
    }

    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(description)) {
      return "مسافة واحدة فقط بين الكلمات";
    }

    return "";
  };

  // Description validation function (English)
  const validateDescriptionEn = (description: string): string => {
    if (!description.trim()) {
      return "";
    }

    if (description.length < 10) {
      return "Description must be at least 10 characters";
    }

    if (description.length > 300) {
      return "Description is too long";
    }

    // Check for English letters, numbers, spaces, and common punctuation only
    const validPattern = /^[a-zA-Z0-9\s,.;?!\-()]+$/;
    if (!validPattern.test(description)) {
      return "Description accepts English letters, numbers, spaces, and punctuation only";
    }

    // Check for leading or trailing spaces
    if (description.startsWith(" ") || description.endsWith(" ")) {
      return "Description cannot start or end with a space";
    }

    // Check for multiple consecutive spaces
    if (/\s{2,}/.test(description)) {
      return "Only one space between words";
    }

    return "";
  };

  const handleChange = (
    field: string,
    value: string | string[] | File | undefined,
  ) => {
    if (typeof value === "string") {
      // Handle nameAr field validation
      if (field === "nameAr") {
        // Limit to 60 characters
        if (value.length > 60) {
          return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        setNameArError(validateNameAr(value));
      }
      // Handle nameEn field validation
      else if (field === "nameEn") {
        // Limit to 60 characters
        if (value.length > 60) {
          return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        setNameEnError(validateNameEn(value));
      }
      // Handle descriptionAr field validation
      else if (field === "descriptionAr") {
        // Limit to 300 characters
        if (value.length > 300) {
          return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        setDescriptionArError(validateDescriptionAr(value));
      }
      // Handle descriptionEn field validation
      else if (field === "descriptionEn") {
        // Limit to 300 characters
        if (value.length > 300) {
          return;
        }
        setFormData((prev) => ({ ...prev, [field]: value }));
        setDescriptionEnError(validateDescriptionEn(value));
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
      const nameArValidationError = validateNameAr(formData.nameAr);
      const nameEnValidationError = validateNameEn(formData.nameEn);
      const descriptionArValidationError = validateDescriptionAr(
        formData.descriptionAr,
      );
      const descriptionEnValidationError = validateDescriptionEn(
        formData.descriptionEn,
      );

      setNameArError(nameArValidationError);
      setNameEnError(nameEnValidationError);
      setDescriptionArError(descriptionArValidationError);
      setDescriptionEnError(descriptionEnValidationError);

      // Check if there are any validation errors
      if (
        nameArValidationError ||
        nameEnValidationError ||
        descriptionArValidationError ||
        descriptionEnValidationError
      ) {
        setIsLoading(false);
        return;
      }

      let imageUrl = "";

      if (formData.image instanceof File) {
        const uploaded = await uploadImage(formData.image);
        imageUrl = uploaded.data || uploaded.url;
      } else if (typeof formData.image === "string") {
        imageUrl = formData.image;
      }

      const payloadRaw: Partial<CreateOfferPayload> = {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
        image: imageUrl,
        descriptionAr: formData.descriptionAr,
        descriptionEn: formData.descriptionEn,
        discount: formData.discount,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };
      // Remove empty-string fields
      const payload = Object.fromEntries(
        Object.entries(payloadRaw).filter((entry) => {
          const v = entry[1] as unknown;
          return typeof v === "string" ? v.trim() !== "" : true;
        }),
      ) as Partial<CreateOfferPayload>;

      await updateOffer(offer._id, payload);
      setToast({
        variant: "success",
        title: "نجح تحديث العرض",
        message: "تم تحديث العرض بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في تحديث العرض",
          message:
            err.response?.data?.message ||
            "فشل في تحديث العرض. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to update offer:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      nameAr: offer.nameAr || "",
      nameEn: offer.nameEn || "",
      image: offer.image || "",
      descriptionAr: offer.descriptionAr || "",
      descriptionEn: offer.descriptionEn || "",
      discount: offer.discount || 0,
      startDate: offer.startDate || new Date(),
      endDate: offer.endDate || new Date(),
    });
    setNameArError("");
    setNameEnError("");
    setDescriptionArError("");
    setDescriptionEnError("");
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
                معلومات العرض
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Image */}
                <div className="lg:col-span-2">
                  <Label>صورة العرض</Label>
                  {typeof formData.image === "string" && formData.image && (
                    <Image
                      src={formData.image}
                      width={160}
                      height={160}
                      alt="Current Offer Image"
                      className="mb-4 justify-self-center"
                    />
                  )}
                  <FileInput
                    accept="image/*"
                    onChange={(e) => handleChange("image", e.target.files?.[0])}
                  />
                </div>

                {/* Name Arabic */}
                <div>
                  <Label>الاسم بالعربي</Label>
                  <Input
                    type="text"
                    placeholder="ادخل اسم العرض بالعربي"
                    value={formData.nameAr}
                    onChange={(e) => handleChange("nameAr", e.target.value)}
                    error={!!nameArError}
                    hint={nameArError || `${formData.nameAr.length}/60`}
                  />
                </div>

                {/* Name English */}
                <div>
                  <Label>الاسم بالإنجليزي</Label>
                  <Input
                    type="text"
                    placeholder="Enter offer name in English"
                    value={formData.nameEn}
                    onChange={(e) => handleChange("nameEn", e.target.value)}
                    error={!!nameEnError}
                    hint={nameEnError || `${formData.nameEn.length}/60`}
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
                    placeholder="Enter product description in English"
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

                {/* Discount */}
                <div>
                  <Label>الخصم بالنسبة المئوية (%)</Label>
                  <Input
                    type="number"
                    placeholder="أدخل قيمة الخصم للعرض"
                    min="1"
                    max="100"
                    step={0.1}
                    value={
                      typeof formData.discount === "number"
                        ? formData.discount
                        : Number(formData.discount)
                    }
                    onChange={(e) => handleChange("discount", e.target.value)}
                  />
                </div>

                {/* Start Date */}
                <div>
                  <Label>تاريخ البدء</Label>
                  <DatePicker
                    id="edit-start-date-picker"
                    placeholder="تاريخ البدء"
                    defaultDate={formData.startDate}
                    minDate="now"
                    maxDate={(() => {
                      const maxDate = new Date();
                      maxDate.setMonth(maxDate.getMonth() + 3);
                      return maxDate.toISOString().split("T")[0];
                    })()}
                    onChange={(dates, currentDateString) => {
                      handleChange("startDate", currentDateString);
                    }}
                  />
                </div>

                {/* End Date */}
                <div>
                  <Label>تاريخ الانتهاء</Label>
                  <DatePicker
                    id="edit-end-date-picker"
                    key={`edit-end-date-${formData.startDate}`} // Force re-render when startDate changes
                    placeholder="تاريخ الانتهاء"
                    defaultDate={formData.endDate}
                    minDate={formData.startDate || "now"}
                    maxDate={(() => {
                      const maxDate = new Date();
                      maxDate.setMonth(maxDate.getMonth() + 3);
                      return maxDate.toISOString().split("T")[0];
                    })()}
                    onChange={(dates, currentDateString) => {
                      handleChange("endDate", currentDateString);
                    }}
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

export function EditOfferButton({
  offer,
  onSuccess,
}: {
  offer: Offer;
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
      <EditOfferModal
        isOpen={isOpen}
        closeModal={closeModal}
        offer={offer}
        onSuccess={handleAfterEdit}
      />
    </>
  );
}

export function DeleteOfferModal({
  isOpen = false,
  closeModal = () => {},
  offerId = "",
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const handleDelete = async () => {
    try {
      await deleteOffer(offerId);
      setToast({
        variant: "success",
        title: "نجح حذف العرض",
        message: "تم حذف العرض بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
      closeModal();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في حذف العرض",
          message:
            err.response?.data?.message ||
            "فشل في حذف العرض. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to delete offer:", err);
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
            حذف العرض
          </h4>

          <p className="text-gray-800 dark:text-white/90">
            هل أنت متأكد أنك تريد حذف هذا العرض؟
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

export function DeleteOfferButton({
  offerId,
  onSuccess,
}: {
  offerId: string;
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
      <DeleteOfferModal
        isOpen={isOpen}
        closeModal={closeModal}
        offerId={offerId}
        onSuccess={handleAfterDelete}
      />
    </>
  );
}
