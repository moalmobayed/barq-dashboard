// components/offers/OffersModals.tsx
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
import {
  createOffer,
  createPackageOffer,
  createDeliveryOffer,
  deleteOffer,
  deleteDeliveryOffer,
  updateOffer,
  getSingleOffer,
  getSinglePackageOffer,
  updatePackageOffer,
  getSingleDeliveryOffer,
  updateDeliveryOffer,
} from "@/lib/api/offers";
import { uploadImage } from "@/lib/api/uploadImage";
import {
  CreateOfferPayload,
  CreatePackageOfferPayload,
  CreateDeliveryOfferPayload,
  Offer,
  OfferType,
} from "@/types/offer";
import { FaPencilAlt, FaTrashAlt, FaTimes } from "react-icons/fa";
import Image from "next/image";
import Alert, { AlertProps } from "@/components/ui/alert/Alert";
import { AxiosError } from "axios";
import { Product } from "@/types/product";
import { fetchProducts } from "@/lib/api/products";
import DatePicker from "../form/date-picker";
import { Vendor } from "@/types/vendor";
import { getAllVendors } from "@/lib/api/vendors";

// Support functions for validation
const validateNameAr = (name: string): string => {
  if (!name.trim()) return "";
  if (name.length < 2) return "يجب أن لا يقل الاسم عن حرفين";
  if (name.length > 60) return "الاسم طويل جداً";
  const validPattern =
    /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF0-9\s!@#$%^&*()_+={}[\]|\\:;"'<>,.?/~`\-\u060C\u061B\u061F\u00AB\u00BBa-zA-Z]+$/;
  if (!validPattern.test(name))
    return "الاسم يقبل الحروف العربية والانجليزية والأرقام والمسافات وعلامات الترقيم والرموز فقط";
  if (name.startsWith(" ") || name.endsWith(" "))
    return "لا يمكن أن يبدأ أو ينتهي الاسم بمسافة";
  if (/\s{2,}/.test(name)) return "مسافة واحدة فقط بين الكلمات";
  return "";
};

const validateNameEn = (name: string): string => {
  if (!name.trim()) return "";
  if (name.length < 2) return "Name must be at least 2 characters";
  if (name.length > 60) return "Name is too long";
  const validPattern = /^[a-zA-Z0-9\s!@#$%^&*()_+={}[\]|\\:;"'<>,.?/~`\-]+$/;
  if (!validPattern.test(name))
    return "Name accepts English letters, numbers, spaces, and all punctuation/symbols";
  if (name.startsWith(" ") || name.endsWith(" "))
    return "Name cannot start or end with a space";
  if (/\s{2,}/.test(name)) return "Only one space between words";
  return "";
};

const validateDescriptionAr = (description: string): string => {
  if (!description.trim()) return "";
  if (description.length > 300) return "الوصف طويل جداً";
  const validPattern =
    /^[\u0600-\u06FF\u0750-\u077F0-9\s!@#$%^&*()_+={}[\]|\\:;"'<>,.?/~`\-\u060C\u061B\u061F\u00AB\u00BBa-zA-Z]+$/;
  if (!validPattern.test(description))
    return "الوصف يقبل الحروف العربية والانجليزية والأرقام والمسافات وعلامات الترقيم والرموز فقط";
  if (description.startsWith(" ") || description.endsWith(" "))
    return "لا يمكن أن يبدأ أو ينتهي الوصف بمسافة";
  if (/\s{2,}/.test(description)) return "مسافة واحدة فقط بين الكلمات";
  return "";
};

const validateDescriptionEn = (description: string): string => {
  if (!description.trim()) return "";
  if (description.length > 300) return "Description is too long";
  const validPattern = /^[a-zA-Z0-9\s!@#$%^&*()_+={}[\]|\\:;"'<>,.?/~`\-]+$/;
  if (!validPattern.test(description))
    return "Description accepts English letters, numbers, spaces, and all punctuation/symbols";
  if (description.startsWith(" ") || description.endsWith(" "))
    return "Description cannot start or end with a space";
  if (/\s{2,}/.test(description)) return "Only one space between words";
  return "";
};

export function AddOfferModal({
  isOpen = false,
  closeModal = () => {},
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nameArError, setNameArError] = useState<string>("");
  const [nameEnError, setNameEnError] = useState<string>("");
  const [descriptionArError, setDescriptionArError] = useState<string>("");
  const [descriptionEnError, setDescriptionEnError] = useState<string>("");

  const [offerType, setOfferType] = useState<OfferType>("single");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage",
  );
  const [productPrice, setProductPrice] = useState<number>(0);
  const [selectedProducts, setSelectedProducts] = useState<{ product: Product; quantity: number }[]>([]);

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
    price: number;
  }>({
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
    price: 0,
  });

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      try {
        const vendorsResponse = await getAllVendors();
        setVendors(vendorsResponse.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (!formData.shopId) {
      setFilteredProducts([]);
      setFormData((prev) => ({ ...prev, product: "" }));
      setProductPrice(0);
      setSelectedProducts([]);
      return;
    }
    const fetchVendorProducts = async () => {
      try {
        const { data } = await fetchProducts(1, 1000, formData.shopId);
        setFilteredProducts(data);
      } catch (err) {
        console.error("Failed to fetch vendor products:", err);
        setFilteredProducts([]);
      }
    };
    fetchVendorProducts();
    setFormData((prev) => ({ ...prev, product: "" }));
    setProductPrice(0);
    setSelectedProducts([]);
  }, [formData.shopId]);

  useEffect(() => {
    if (formData.product) {
      const selectedProduct = filteredProducts.find(
        (p) => p._id === formData.product,
      );
      if (selectedProduct) setProductPrice(selectedProduct.price);
    } else {
      setProductPrice(0);
    }
  }, [formData.product, filteredProducts]);

  const handleChange = (
    field: string,
    value: string | string[] | File | Date | undefined,
  ) => {
    if (typeof value === "string") {
      if (field === "discount") {
        const raw = value === "" ? "1" : value;
        let num = parseFloat(raw);
        if (isNaN(num)) num = 1;

        if (discountType === "percentage") {
          num = Math.min(Math.max(num, 1), 100);
        } else {
          if (productPrice > 0)
            num = Math.min(Math.max(num, 1), productPrice - 1);
          else num = Math.max(num, 1);
        }
        setFormData((prev) => ({ ...prev, [field]: num }));
        return;
      }
      if (field === "price") {
        const num = parseFloat(value) || 0;
        setFormData((prev) => ({ ...prev, price: Math.max(num, 0) }));
        return;
      }
      if (field === "nameAr") {
        if (value.length > 60) return;
        setFormData((prev) => ({ ...prev, [field]: value }));
        setNameArError(validateNameAr(value));
      } else if (field === "nameEn") {
        if (value.length > 60) return;
        setFormData((prev) => ({ ...prev, [field]: value }));
        setNameEnError(validateNameEn(value));
      } else if (field === "descriptionAr") {
        if (value.length > 300) return;
        setFormData((prev) => ({ ...prev, [field]: value }));
        setDescriptionArError(validateDescriptionAr(value));
      } else if (field === "descriptionEn") {
        if (value.length > 300) return;
        setFormData((prev) => ({ ...prev, [field]: value }));
        setDescriptionEnError(validateDescriptionEn(value));
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const addProductToPackage = (productId: string) => {
    const existing = selectedProducts.find((p) => p.product._id === productId);
    if (existing) {
      // If already added, increase quantity
      setSelectedProducts((prev) =>
        prev.map((p) =>
          p.product._id === productId ? { ...p, quantity: p.quantity + 1 } : p
        )
      );
      return;
    }
    const prod = filteredProducts.find((p) => p._id === productId);
    if (prod) setSelectedProducts((prev) => [...prev, { product: prod, quantity: 1 }]);
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.product._id === productId ? { ...p, quantity } : p
      )
    );
  };

  const removeProductFromPackage = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.product._id !== productId));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const nameArErr = validateNameAr(formData.nameAr);
      const descArErr = validateDescriptionAr(formData.descriptionAr);
      setNameArError(nameArErr);
      setDescriptionArError(descArErr);

      let nameEnErr = "";
      let descEnErr = "";
      if (offerType === "package") {
        nameEnErr = validateNameEn(formData.nameEn);
        descEnErr = validateDescriptionEn(formData.descriptionEn);
        setNameEnError(nameEnErr);
        setDescriptionEnError(descEnErr);
      }

      if (nameArErr || nameEnErr || descArErr || descEnErr) {
        setIsLoading(false);
        return;
      }

      if (!formData.nameAr && offerType !== "delivery") {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "اسم العرض بالعربي مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        setIsLoading(false);
        return;
      }
      if (!formData.shopId) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "اسم المتجر مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        setIsLoading(false);
        return;
      }
      if (!formData.startDate) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "تاريخ البدء مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        setIsLoading(false);
        return;
      }
      if (!formData.endDate) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "تاريخ الانتهاء مطلوب.",
        });
        setTimeout(() => setToast(null), 5000);
        setIsLoading(false);
        return;
      }

      if (offerType === "single") {
        if (!formData.product) {
          setToast({
            variant: "error",
            title: "حقل مطلوب",
            message: "اسم المنتج مطلوب.",
          });
          setTimeout(() => setToast(null), 5000);
          setIsLoading(false);
          return;
        }

        let imageUrl = "";
        if (formData.image instanceof File && formData.image.size > 0) {
          const uploaded = await uploadImage(formData.image);
          imageUrl = uploaded.data;
        }

        let discountPercentage = formData.discount;
        if (discountType === "fixed" && productPrice > 0) {
          discountPercentage = (formData.discount / productPrice) * 100;
        }

        const payload: CreateOfferPayload = {
          nameAr: formData.nameAr,
          nameEn: formData.nameEn || formData.nameAr,
          product: formData.product,
          image: imageUrl,
          descriptionAr: formData.descriptionAr,
          descriptionEn: formData.descriptionEn || formData.descriptionAr,
          discount: discountPercentage,
          startDate: formData.startDate,
          endDate: formData.endDate,
          shopId: formData.shopId,
        };
        await createOffer(payload);
      } else if (offerType === "package") {
        if (selectedProducts.length === 0) {
          setToast({
            variant: "error",
            title: "حقل مطلوب",
            message: "يجب اختيار منتج واحد على الأقل.",
          });
          setTimeout(() => setToast(null), 5000);
          setIsLoading(false);
          return;
        }
        if (!formData.price || formData.price <= 0) {
          setToast({
            variant: "error",
            title: "حقل مطلوب",
            message: "سعر الباقة مطلوب.",
          });
          setTimeout(() => setToast(null), 5000);
          setIsLoading(false);
          return;
        }

        let imageUrl = "";
        if (formData.image instanceof File && formData.image.size > 0) {
          const uploaded = await uploadImage(formData.image);
          imageUrl = uploaded.data;
        }

        const effectiveNameEn = formData.nameEn?.trim()
          ? formData.nameEn.trim()
          : formData.nameAr.trim();
        const effectiveDescEn = formData.descriptionEn?.trim()
          ? formData.descriptionEn.trim()
          : formData.descriptionAr.trim();

        const payload: CreatePackageOfferPayload = {
          nameAr: formData.nameAr,
          nameEn: effectiveNameEn,
          price: formData.price,
          shopId: formData.shopId,
          descriptionAr: formData.descriptionAr,
          descriptionEn: effectiveDescEn,
          image: imageUrl,
          products: selectedProducts.map((p) => ({
            product: p.product._id,
            quantity: p.quantity,
          })),
          startDate: formData.startDate,
          endDate: formData.endDate,
        };
        await createPackageOffer(payload);
      } else {
        // delivery
        if (!formData.discount) {
          setToast({
            variant: "error",
            title: "حقل مطلوب",
            message: "نسبة الخصم مطلوبة.",
          });
          setTimeout(() => setToast(null), 5000);
          setIsLoading(false);
          return;
        }

        const effectiveDescEn = formData.descriptionEn?.trim()
          ? formData.descriptionEn.trim()
          : formData.descriptionAr.trim();

        const payload: CreateDeliveryOfferPayload = {
          shopId: formData.shopId,
          discount: formData.discount,
          startDate: formData.startDate,
          endDate: formData.endDate,
          descriptionAr: formData.descriptionAr,
          descriptionEn: effectiveDescEn,
        };
        await createDeliveryOffer(payload);
      }

      setToast({
        variant: "success",
        title: "نجح إنشاء العرض",
        message: "تم إنشاء العرض بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      resetForm();
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

  const resetForm = () => {
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
      price: 0,
    });
    setOfferType("single");
    setDiscountType("percentage");
    setProductPrice(0);
    setSelectedProducts([]);
    setNameArError("");
    setNameEnError("");
    setDescriptionArError("");
    setDescriptionEnError("");
  };

  const handleModalClose = () => {
    resetForm();
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
                إضافة عرض جديد
              </h5>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                أدخل تفاصيل العرض والمنتجات المشمولة
              </p>
            </div>

            <div>
              <h6 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                البيانات الاساسية
              </h6>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {offerType !== "delivery" && (
                  <div className="lg:col-span-2">
                    <Label>صورة العرض</Label>
                    <FileInput
                      accept="image/*"
                      onChange={(e) =>
                        handleChange("image", e.target.files?.[0])
                      }
                    />
                  </div>
                )}

                {offerType !== "delivery" && (
                  <div>
                    <Label>
                      الاسم بالعربي <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="ادخل اسم"
                      value={formData.nameAr}
                      onChange={(e) => handleChange("nameAr", e.target.value)}
                      error={!!nameArError}
                      hint={nameArError || `${formData.nameAr.length}/60`}
                      required
                    />
                  </div>
                )}

                {offerType !== "delivery" && (
                  <div>
                    <Label>الاسم بالانجليزي</Label>
                    <Input
                      type="text"
                      placeholder="ادخل اسم"
                      value={formData.nameEn}
                      onChange={(e) => handleChange("nameEn", e.target.value)}
                      error={!!nameEnError}
                      hint={nameEnError || `${formData.nameEn.length}/60`}
                    />
                  </div>
                )}

                <div>
                  <Label>
                    الوصف بالعربي <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="ادخل وصف"
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

                <div>
                  <Label>الوصف بالانجليزي</Label>
                  <Input
                    type="text"
                    placeholder="ادخل وصف"
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

                <div className="lg:col-span-2">
                  <Label>
                    المتجر <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      options={vendors.map((v) => ({
                        value: v._id,
                        label: v.name,
                      }))}
                      placeholder="اختر المتجر"
                      onChange={(val) => handleChange("shopId", val)}
                      required
                      className="dark:bg-dark-900"
                    />
                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl bg-[#FFF9E6] p-5 dark:bg-gray-800/50">
              <h6 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                نوع العرض
              </h6>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="offerType"
                    checked={offerType === "single"}
                    onChange={() => setOfferType("single")}
                    className="text-brand-blue h-4 w-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    منتج واحد (Single Product)
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="offerType"
                    checked={offerType === "package"}
                    onChange={() => setOfferType("package")}
                    className="text-brand-blue h-4 w-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    حزمة مركبة (Complex Package)
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="offerType"
                    checked={offerType === "delivery"}
                    onChange={() => setOfferType("delivery")}
                    className="text-brand-blue h-4 w-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    عرض توصيل (Delivery Offer)
                  </span>
                </label>
              </div>

              {offerType === "single" && (
                <div className="mt-4">
                  <Label>
                    المنتج <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Select
                      options={filteredProducts.map((p) => ({
                        value: p._id,
                        label: p.nameAr,
                      }))}
                      placeholder={
                        !formData.shopId
                          ? "اختر المتجر أولاً"
                          : filteredProducts.length === 0
                            ? "لا توجد منتجات"
                            : "اختر المنتج"
                      }
                      onChange={(val) => handleChange("product", val)}
                      required
                      disabled={
                        !formData.shopId || filteredProducts.length === 0
                      }
                      className="dark:bg-dark-900"
                    />
                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
              )}

              {offerType === "package" && (
                <div className="mt-4">
                  <Label>إضافة منتجات العرض (Package Products)</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="relative flex-1">
                      <Select
                        options={filteredProducts
                          .filter(
                            (p) =>
                              !selectedProducts.find((sp) => sp.product._id === p._id),
                          )
                          .map((p) => ({ value: p._id, label: p.nameAr }))}
                        placeholder={
                          !formData.shopId
                            ? "اختر المتجر أولاً"
                            : "اختر منتج اضافي"
                        }
                        onChange={(val) => addProductToPackage(val)}
                        value=""
                        disabled={
                          !formData.shopId || filteredProducts.length === 0
                        }
                        className="dark:bg-dark-900"
                      />
                      <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        <ChevronDownIcon />
                      </span>
                    </div>
                  </div>

                  {selectedProducts.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedProducts.map((prod) => (
                        <div
                          key={prod.product._id}
                          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
                        >
                          {prod.product.image && (
                            <Image
                              src={prod.product.image}
                              alt={prod.product.nameAr}
                              width={32}
                              height={32}
                              className="rounded-md object-cover"
                            />
                          )}
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {prod.product.nameAr}
                          </span>
                          <span className="text-brand-blue text-xs">
                            {prod.product.price} ج.م
                          </span>
                          <input
                            type="number"
                            min="1"
                            value={prod.quantity}
                            onChange={(e) => updateProductQuantity(prod.product._id, parseInt(e.target.value) || 1)}
                            className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm dark:border-gray-600 dark:bg-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() => removeProductFromPackage(prod.product._id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <FaTimes className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <Label>
                      سعر الباقة (ج.م) <span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.price === 0 ? "" : formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      min="0"
                      required
                      dir="ltr"
                      className="text-end"
                    />
                  </div>
                </div>
              )}
            </div>

            {offerType !== "package" && (
              <div className="mt-8">
                <h6 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                  نوع الخصم <span className="text-error-500">*</span>
                </h6>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDiscountType("percentage")}
                    className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${discountType === "percentage" ? "bg-brand-blue text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
                  >
                    نسبة مئوية (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType("fixed")}
                    className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${discountType === "fixed" ? "bg-brand-blue text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"}`}
                  >
                    مبلغ ثابت (ج.م)
                  </button>
                </div>

                {offerType === "single" &&
                  formData.product &&
                  productPrice > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <Label>السعر الافتراضي</Label>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                          <span className="flex-1 text-end text-sm text-gray-700 dark:text-gray-300">
                            {productPrice.toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">ج.م</span>
                        </div>
                      </div>
                      <div>
                        <Label>السعر بعد الخصم</Label>
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                          <span className="flex-1 text-end text-sm text-gray-700 dark:text-gray-300">
                            {discountType === "percentage"
                              ? (
                                  productPrice -
                                  (productPrice * formData.discount) / 100
                                ).toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })
                              : (
                                  productPrice - formData.discount
                                ).toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}
                          </span>
                          <span className="text-xs text-gray-500">ج.م</span>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="mt-4">
                  <Label>
                    {discountType === "percentage"
                      ? "الخصم بالنسبة المئوية (%)"
                      : "الخصم بالمبلغ الثابت (ج.م)"}{" "}
                    <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder={
                      discountType === "percentage"
                        ? "أدخل نسبة الخصم (1-100)"
                        : "أدخل مبلغ الخصم"
                    }
                    min="1"
                    max={
                      discountType === "percentage"
                        ? "100"
                        : productPrice > 0
                          ? (productPrice - 1).toString()
                          : ""
                    }
                    step={0.1}
                    value={formData.discount}
                    onChange={(e) => handleChange("discount", e.target.value)}
                    required
                    dir="ltr"
                    className="text-end"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>
                  تاريخ البدء <span className="text-error-500">*</span>
                </Label>
                <DatePicker
                  id="add-offer-start-date"
                  placeholder="DD/MM/YYYY"
                  minDate="now"
                  maxDate={(() => {
                    const d = new Date();
                    d.setMonth(d.getMonth() + 3);
                    return d.toISOString().split("T")[0];
                  })()}
                  onChange={(dates, currentDateString) =>
                    handleChange("startDate", currentDateString)
                  }
                  required
                />
              </div>
              <div>
                <Label>
                  تاريخ الانتهاء <span className="text-error-500">*</span>
                </Label>
                <DatePicker
                  id="add-offer-end-date"
                  key={`end-date-${formData.startDate}`}
                  placeholder="DD/MM/YYYY"
                  minDate={formData.startDate || "now"}
                  maxDate={(() => {
                    const d = new Date();
                    d.setMonth(d.getMonth() + 3);
                    return d.toISOString().split("T")[0];
                  })()}
                  onChange={(dates, currentDateString) => {
                    const endDateEndOfDay = currentDateString
                      ? new Date(
                          new Date(currentDateString).setHours(23, 59, 59, 999),
                        )
                      : currentDateString;
                    handleChange("endDate", endDateEndOfDay);
                  }}
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="outline" onClick={handleModalClose}>
              إلغاء
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
    onSuccess?.();
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nameArError, setNameArError] = useState<string>("");
  const [nameEnError, setNameEnError] = useState<string>("");
  const [descriptionArError, setDescriptionArError] = useState<string>("");
  const [descriptionEnError, setDescriptionEnError] = useState<string>("");

  const [offerType, setOfferType] = useState<OfferType>("single");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage",
  );
  const [productPrice, setProductPrice] = useState<number>(0);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const [formData, setFormData] = useState<{
    nameAr: string;
    nameEn: string;
    product: string;
    image: string | File;
    descriptionAr: string;
    descriptionEn: string;
    discount: number;
    startDate: Date | undefined;
    endDate: Date | undefined;
    shopId: string;
    price: number;
  }>({
    nameAr: "",
    nameEn: "",
    product: "",
    image: "",
    descriptionAr: "",
    descriptionEn: "",
    discount: 0,
    startDate: undefined,
    endDate: undefined,
    shopId: "",
    price: 0,
  });

  useEffect(() => {
    if (!isOpen || !offer?._id) return;

    const fetchFullOffer = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const o: any = offer;
        let type: OfferType = "single";
        if (o.offerType) {
          type = o.offerType;
        } else if (o.productType === "package" || (o.products && o.products.length > 0)) {
          type = "package";
        } else if (!o.product && !o.image) {
          type = "delivery";
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let fetchedData: any;
        if (type === "package") {
          const packageOfferId = o.product?._id || o.product?.id || o._id;
          const packageData = await getSinglePackageOffer(packageOfferId);
          const offerData = await getSingleOffer(o._id);
          
          const packagePrice = packageData.price || 0;
          const offerDiscount = offerData.discount || 0;
          const finalPrice = Math.round(packagePrice - (packagePrice * offerDiscount / 100));

          fetchedData = {
            ...packageData,
            startDate: offerData.startDate,
            endDate: offerData.endDate,
            discount: offerDiscount,
            calculatedPrice: finalPrice > 0 ? finalPrice : 0
          };
        } else if (type === "delivery") {
          fetchedData = await getSingleDeliveryOffer(o._id);
        } else {
          const fetchedOffer = await getSingleOffer(o._id);
          fetchedData = fetchedOffer || o;
        }

        const calculatedDiscount = fetchedData.discount || 0;

        setOfferType(type);
        setFormData({
          nameAr: fetchedData.nameAr || "",
          nameEn: fetchedData.nameEn || "",
          product:
            typeof fetchedData.product === "string"
              ? fetchedData.product
              : fetchedData.product?._id || "",
          image: fetchedData.image || "",
          descriptionAr: fetchedData.descriptionAr || "",
          descriptionEn: fetchedData.descriptionEn || "",
          discount: calculatedDiscount,
          startDate: fetchedData.startDate ? new Date(fetchedData.startDate) : undefined,
          endDate: fetchedData.endDate ? new Date(fetchedData.endDate) : undefined,
          shopId:
            typeof fetchedData.shopId === "string"
              ? fetchedData.shopId
              : fetchedData.shopId?._id || "",
          price: fetchedData.calculatedPrice !== undefined ? fetchedData.calculatedPrice : (fetchedData.price || 0),
        });

        if (fetchedData.products && type === "package") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedProducts = fetchedData.products.map((p: any) => ({
            product: p.product || p, // fallback if backend returns Product instead of {product: Product, quantity}
            quantity: p.quantity || 1,
          }));
          setSelectedProducts(mappedProducts);
        }
      } catch (err) {
        console.error("Failed to fetch full offer:", err);
      }
    };

    fetchFullOffer();
  }, [isOpen, offer]);

  useEffect(() => {
    if (!isOpen || !formData.shopId) {
      setFilteredProducts([]);
      return;
    }
    const fetchVendorProducts = async () => {
      try {
        const { data } = await fetchProducts(1, 1000, formData.shopId);
        setFilteredProducts(data);
      } catch (err) {
        console.error("Failed to fetch vendor products:", err);
        setFilteredProducts([]);
      }
    };
    fetchVendorProducts();
  }, [isOpen, formData.shopId]);

  useEffect(() => {
    if (formData.product) {
      const selectedProduct = filteredProducts.find(
        (p) => p._id === formData.product,
      );
      if (selectedProduct) setProductPrice(selectedProduct.price);
    } else {
      setProductPrice(0);
    }
  }, [formData.product, filteredProducts]);

  const handleChange = (
    field: string,
    value: string | string[] | File | Date | undefined,
  ) => {
    if (typeof value === "string") {
      if (field === "discount") {
        const num = parseFloat(value) || 0;
        setFormData((prev) => ({ ...prev, [field]: num }));
        return;
      }
      if (field === "price") {
        setFormData((prev) => ({ ...prev, price: parseFloat(value) || 0 }));
        return;
      }
      if (field === "nameAr") {
        setFormData((prev) => ({ ...prev, nameAr: value }));
        setNameArError(validateNameAr(value));
      } else if (field === "nameEn") {
        setFormData((prev) => ({ ...prev, nameEn: value }));
        setNameEnError(validateNameEn(value));
      } else if (field === "descriptionAr") {
        setFormData((prev) => ({ ...prev, descriptionAr: value }));
        setDescriptionArError(validateDescriptionAr(value));
      } else if (field === "descriptionEn") {
        setFormData((prev) => ({ ...prev, descriptionEn: value }));
        setDescriptionEnError(validateDescriptionEn(value));
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const addProductToPackage = (productId: string) => {
    if (selectedProducts.find((p) => p._id === productId)) return;
    const prod = filteredProducts.find((p) => p._id === productId);
    if (prod) setSelectedProducts((prev) => [...prev, prod]);
  };

  const removeProductFromPackage = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let imageUrl = typeof formData.image === "string" ? formData.image : "";
      if (formData.image instanceof File) {
        const uploaded = await uploadImage(formData.image);
        imageUrl = uploaded.data;
      }

      // Single product API uses "name" and "description"
      // Package and Delivery might use updateOffer or specialized update endpoints
      // For now, mapping nameAr to name if it's single

      const payload: Partial<CreateOfferPayload> & Record<string, unknown> = {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn || formData.nameAr,
        product: formData.product,
        image: imageUrl,
        descriptionAr: formData.descriptionAr,
        descriptionEn: formData.descriptionEn || formData.descriptionAr,
        discount: formData.discount,
        startDate: formData.startDate,
        endDate: formData.endDate,
        shopId: formData.shopId,
      };

      // If it's a package, add package fields (assuming updateOffer handles them or backend ignores)
      if (offerType === "package") {
        payload.offerId = offer._id;
        payload.nameAr = formData.nameAr;
        payload.nameEn = formData.nameEn;
        payload.descriptionAr = formData.descriptionAr;
        payload.descriptionEn = formData.descriptionEn;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload.products = selectedProducts.map((p: any) => ({
          product: p.product._id,
          quantity: p.quantity,
        }));
        // we use package product ID for the route path, passed via offerId in payload
        const packageOfferId =
          typeof offer.product === "string"
            ? offer.product
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            : offer.product?._id || (offer.product as any)?.id || offer._id;
            
        // calculate new discount
        const totalProductsPrice = selectedProducts.reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (acc, p: any) => acc + (p.product.price * p.quantity),
          0
        );
        const newDiscount = totalProductsPrice > 0 
          ? ((totalProductsPrice - formData.price) / totalProductsPrice) * 100 
          : 0;
          
        await updatePackageOffer(packageOfferId, payload);
        await updateOffer(offer._id, {
          discount: newDiscount,
          startDate: formData.startDate,
          endDate: formData.endDate,
        });
      } else if (offerType === "delivery") {
        const deliveryPayload: Partial<CreateDeliveryOfferPayload> = {
          descriptionAr: formData.descriptionAr,
          descriptionEn: formData.descriptionEn || formData.descriptionAr,
          discount: formData.discount,
          shopId: formData.shopId,
          startDate: formData.startDate,
          endDate: formData.endDate,
        };
        await updateDeliveryOffer(offer._id, deliveryPayload);
      } else {
        await updateOffer(offer._id, payload);
      }
      setToast({
        variant: "success",
        title: "نجح تحديث العرض",
        message: "تم تحديث العرض بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
    } catch {
      setToast({
        variant: "error",
        title: "خطأ في التحديث",
        message: "فشل في تحديث العرض",
      });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
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
                تعديل العرض
              </h5>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              {offerType !== "delivery" && (
                <div className="lg:col-span-2">
                  <Label>صورة العرض</Label>
                  {typeof formData.image === "string" && formData.image && (
                    <Image
                      src={formData.image}
                      width={100}
                      height={100}
                      alt="Offer"
                      className="mb-2 rounded-lg object-cover"
                    />
                  )}
                  <FileInput
                    accept="image/*"
                    onChange={(e) => handleChange("image", e.target.files?.[0])}
                  />
                </div>
              )}

              {offerType !== "delivery" && (
                <div>
                  <Label>الاسم بالعربي</Label>
                  <Input
                    type="text"
                    value={formData.nameAr}
                    onChange={(e) => handleChange("nameAr", e.target.value)}
                    error={!!nameArError}
                    hint={nameArError}
                  />
                </div>
              )}
              {offerType !== "delivery" && (
                <div>
                  <Label>الاسم بالانجليزي</Label>
                  <Input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => handleChange("nameEn", e.target.value)}
                    error={!!nameEnError}
                    hint={nameEnError}
                  />
                </div>
              )}

              <div>
                <Label>الوصف بالعربي</Label>
                <Input
                  type="text"
                  value={formData.descriptionAr}
                  onChange={(e) =>
                    handleChange("descriptionAr", e.target.value)
                  }
                  error={!!descriptionArError}
                  hint={descriptionArError}
                />
              </div>
              <div>
                <Label>الوصف بالانجليزي</Label>
                <Input
                  type="text"
                  value={formData.descriptionEn}
                  onChange={(e) =>
                    handleChange("descriptionEn", e.target.value)
                  }
                  error={!!descriptionEnError}
                  hint={descriptionEnError}
                />
              </div>

              {offerType === "single" && (
                <div className="lg:col-span-2">
                  <Label>المنتج</Label>
                  <Select
                    options={filteredProducts.map((p) => ({
                      value: p._id,
                      label: p.nameAr,
                    }))}
                    value={formData.product}
                    onChange={(val) => handleChange("product", val)}
                  />
                </div>
              )}

              {offerType === "package" && (
                <div className="lg:col-span-2">
                  <Label>منتجات الباقة</Label>
                  <Select
                    options={filteredProducts
                      .filter(
                        (p) => !selectedProducts.find((sp) => sp.product._id === p._id),
                      )
                      .map((p) => ({ value: p._id, label: p.nameAr }))}
                    onChange={(val) => addProductToPackage(val)}
                    value=""
                    placeholder="أضف منتج..."
                  />
                  <div className="mt-2 flex flex-col gap-2">
                    {selectedProducts.map((p) => (
                      <div
                        key={p.product._id}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {p.product.nameAr}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="mb-0 text-xs">الكمية:</Label>
                          <input
                            type="number"
                            min="1"
                            value={p.quantity}
                            onChange={(e) => updateProductQuantity(p.product._id, parseInt(e.target.value) || 1)}
                            className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm dark:border-gray-600 dark:bg-gray-700"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProductFromPackage(p.product._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label>سعر الباقة</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {offerType !== "package" && (
                <div className="lg:col-span-2">
                  <h6 className="mb-4 text-base font-medium">الخصم</h6>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountType("percentage")}
                      className={`flex-1 rounded p-2 transition-all ${discountType === "percentage" ? "bg-brand-blue text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      نسبة مئوية
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType("fixed")}
                      className={`flex-1 rounded p-2 transition-all ${discountType === "fixed" ? "bg-brand-blue text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      مبلغ ثابت
                    </button>
                  </div>

                  {offerType === "single" &&
                    formData.product &&
                    productPrice > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <Label>السعر الافتراضي</Label>
                          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                            <span className="flex-1 text-end text-sm text-gray-700 dark:text-gray-300">
                              {productPrice.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500">ج.م</span>
                          </div>
                        </div>
                        <div>
                          <Label>السعر بعد الخصم</Label>
                          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                            <span className="flex-1 text-end text-sm text-gray-700 dark:text-gray-300">
                              {discountType === "percentage"
                                ? (
                                    productPrice -
                                    (productPrice * formData.discount) / 100
                                  ).toLocaleString(undefined, {
                                    maximumFractionDigits: 2,
                                  })
                                : (
                                    productPrice - formData.discount
                                  ).toLocaleString(undefined, {
                                    maximumFractionDigits: 2,
                                  })}
                            </span>
                            <span className="text-xs text-gray-500">ج.م</span>
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="mt-4">
                    <Label>
                      {discountType === "percentage"
                        ? "الخصم بالنسبة المئوية (%)"
                        : "الخصم بالمبلغ الثابت (ج.م)"}
                    </Label>
                    <Input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => handleChange("discount", e.target.value)}
                      dir="ltr"
                      className="text-end"
                    />
                  </div>
                </div>
              )}
              <div>
                <Label>تاريخ البدء</Label>
                <DatePicker
                  id="edit-offer-start-date"
                  defaultDate={formData.startDate}
                  onChange={(dates, str) => handleChange("startDate", str)}
                />
              </div>
              <div>
                <Label>تاريخ الانتهاء</Label>
                <DatePicker
                  id="edit-offer-end-date"
                  defaultDate={formData.endDate}
                  onChange={(dates, str) => handleChange("endDate", str)}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
            <Button size="sm" variant="outline" onClick={handleModalClose}>
              إلغاء
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              حفظ
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
    onSuccess?.();
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
  offerType = "",
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const handleDelete = async () => {
    try {
      if (offerType === "delivery") {
        await deleteDeliveryOffer(offerId);
      } else {
        await deleteOffer(offerId);
      }
      setToast({
        variant: "success",
        title: "نجح الحذف",
        message: "تم الحذف بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
      closeModal();
    } catch {
      setToast({
        variant: "error",
        title: "خطأ في الحذف",
        message: "فشل الحذف",
      });
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      className="z-50 m-4 max-w-[700px] bg-black"
    >
      <div className="rounded-3xl bg-white p-11 dark:bg-gray-900">
        <h4 className="mb-4 text-lg font-semibold">حذف العرض</h4>
        <p className="text-gray-600 dark:text-gray-400">
          هل أنت متأكد من رغبتك في حذف هذا العرض؟
        </p>
        <div className="mt-8 flex justify-end gap-3">
          <Button size="sm" variant="outline" onClick={closeModal}>
            إلغاء
          </Button>
          <Button
            size="sm"
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600"
          >
            حذف
          </Button>
        </div>
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
  offerType,
  onSuccess,
}: {
  offerId: string;
  offerType?: string;
  onSuccess?: () => void;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const handleAfterDelete = async () => {
    onSuccess?.();
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
        offerType={offerType}
        onSuccess={handleAfterDelete}
      />
    </>
  );
}
