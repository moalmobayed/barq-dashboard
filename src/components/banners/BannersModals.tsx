"use client";

import React, { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Select from "../form/Select";
import { CreateBannerPayload, Banner } from "@/types/banner";
import { createBanner, deleteBanner, updateBanner } from "@/lib/api/banners";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import Alert, { AlertProps } from "@/components/ui/alert/Alert";
import { AxiosError } from "axios";
import FileInput from "../form/input/FileInput";
import { uploadImage } from "@/lib/api/uploadImage";
import Image from "next/image";
import { getAllProducts } from "@/lib/api/products";
import { getAllVendors } from "@/lib/api/vendors";
import { Product } from "@/types/product";
import { Vendor } from "@/types/vendor";

export function AddBannerModal({
  isOpen = false,
  closeModal = () => {},
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    image: File | null;
    bannerType: "Product" | "User" | "Offer" | "General";
    item: string;
  }>({
    image: null,
    bannerType: "General",
    item: "",
  });

  // Fetch data for dropdowns
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [fetchedTypes, setFetchedTypes] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Only fetch when modal is open
    if (!isOpen) return;

    const fetchDataForType = async () => {
      // Only fetch if type is not General and not already fetched
      if (
        formData.bannerType === "General" ||
        fetchedTypes.has(formData.bannerType)
      ) {
        return;
      }

      try {
        if (
          formData.bannerType === "Product" ||
          formData.bannerType === "Offer"
        ) {
          const productsRes = await getAllProducts();
          setProducts(productsRes.data || []);
        } else if (formData.bannerType === "User") {
          const vendorsRes = await getAllVendors();
          setVendors(vendorsRes.data || []);
        }
        // Mark this type as fetched
        setFetchedTypes((prev) => new Set(prev).add(formData.bannerType));
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
      }
    };
    fetchDataForType();
  }, [isOpen, formData.bannerType, fetchedTypes]);

  const handleChange = (field: string, value: string | File | undefined) => {
    if (field === "bannerType") {
      // Reset item when bannerType changes
      setFormData((prev) => ({
        ...prev,
        bannerType: value as "Product" | "User" | "Offer" | "General",
        item: "",
      }));
    } else if (field === "image" && value instanceof File) {
      setFormData((prev) => ({ ...prev, image: value }));
    } else if (field === "item" && typeof value === "string") {
      setFormData((prev) => ({ ...prev, item: value }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Validation for required fields
      if (!formData.image) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "صورة البانر مطلوبة.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      if (formData.bannerType !== "General" && !formData.item) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "يجب اختيار عنصر للبانر.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      // Upload image
      const uploaded = await uploadImage(formData.image);
      const imageUrl = uploaded.data;

      const payload: CreateBannerPayload = {
        image: imageUrl,
        bannerType: formData.bannerType,
        item: formData.bannerType !== "General" ? formData.item : undefined,
      };

      await createBanner(payload);
      setToast({
        variant: "success",
        title: "نجح إنشاء البانر",
        message: "تم إنشاء البانر بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      setFormData({
        image: null,
        bannerType: "General",
        item: "",
      });
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في إنشاء البانر",
          message:
            err.response?.data?.message ||
            "فشل في إنشاء البانر. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to add banner:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      image: null,
      bannerType: "General",
      item: "",
    });
    setIsLoading(false);
    closeModal?.();
  };

  // Get items based on bannerType
  const getItemOptions = () => {
    switch (formData.bannerType) {
      case "Product":
      case "Offer":
        return products.map((product) => ({
          value: product._id,
          label: product.nameAr,
        }));
      case "User":
        return vendors.map((vendor) => ({
          value: vendor._id,
          label: vendor.name,
        }));
      default:
        return [];
    }
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
                إضافة بانر
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Banner Image */}
                <div className="lg:col-span-2">
                  <Label>
                    صورة البانر <span className="text-error-500">*</span>
                  </Label>
                  <FileInput
                    accept="image/*"
                    onChange={(e) => handleChange("image", e.target.files?.[0])}
                  />
                </div>

                {/* Banner Type */}
                <div className="lg:col-span-2">
                  <Label>
                    نوع البانر <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    value={formData.bannerType}
                    onChange={(value) => handleChange("bannerType", value)}
                    options={[
                      { value: "General", label: "عام" },
                      { value: "Product", label: "منتج" },
                      { value: "User", label: "متجر" },
                      { value: "Offer", label: "عرض" },
                    ]}
                    placeholder="اختر نوع البانر"
                  />
                </div>

                {/* Item Selection - Conditional */}
                {formData.bannerType !== "General" && (
                  <div className="lg:col-span-2">
                    <Label>
                      {(formData.bannerType === "Product" ||
                        formData.bannerType === "Offer") &&
                        "المنتج"}
                      {formData.bannerType === "User" && "المتجر"}
                      <span className="text-error-500">*</span>
                    </Label>
                    <Select
                      value={formData.item}
                      onChange={(value) => handleChange("item", value)}
                      options={getItemOptions()}
                      placeholder={`اختر ${
                        formData.bannerType === "Product"
                          ? "المنتج"
                          : formData.bannerType === "User"
                            ? "المتجر"
                            : "المنتج المطبق عليه العرض"
                      }`}
                    />
                  </div>
                )}
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

export function AddBannerButton({ onSuccess }: { onSuccess?: () => void }) {
  const { isOpen, openModal, closeModal } = useModal();

  const handleAfterCreate = async () => {
    onSuccess?.(); // call parent's refetch
    closeModal();
  };

  return (
    <>
      <Button size="md" variant="primary" onClick={openModal}>
        + إضافة بانر
      </Button>
      <AddBannerModal
        isOpen={isOpen}
        closeModal={closeModal}
        onSuccess={handleAfterCreate}
      />
    </>
  );
}

export function EditBannerModal({
  isOpen = false,
  closeModal = () => {},
  banner = {} as Banner,
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    image: File | string;
    bannerType: "Product" | "User" | "Offer" | "General";
    item: string;
  }>({
    image: banner.image || "",
    bannerType: banner.bannerType || "General",
    item: banner.item || "",
  });

  // Fetch data for dropdowns
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [fetchedTypes, setFetchedTypes] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Only fetch when modal is open
    if (!isOpen) return;

    const fetchDataForType = async () => {
      // Only fetch if type is not General and not already fetched
      if (
        formData.bannerType === "General" ||
        fetchedTypes.has(formData.bannerType)
      ) {
        return;
      }

      try {
        if (
          formData.bannerType === "Product" ||
          formData.bannerType === "Offer"
        ) {
          const productsRes = await getAllProducts();
          setProducts(productsRes.data || []);
        } else if (formData.bannerType === "User") {
          const vendorsRes = await getAllVendors();
          setVendors(vendorsRes.data || []);
        }

        // Mark this type as fetched
        setFetchedTypes((prev) => new Set(prev).add(formData.bannerType));
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
      }
    };
    fetchDataForType();
  }, [isOpen, formData.bannerType, fetchedTypes]);

  const handleChange = (field: string, value: string | File | undefined) => {
    if (field === "bannerType") {
      // Reset item when bannerType changes
      setFormData((prev) => ({
        ...prev,
        bannerType: value as "Product" | "User" | "Offer" | "General",
        item: "",
      }));
    } else if (field === "image" && value instanceof File) {
      setFormData((prev) => ({ ...prev, image: value }));
    } else if (field === "item" && typeof value === "string") {
      setFormData((prev) => ({ ...prev, item: value }));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      if (formData.bannerType !== "General" && !formData.item) {
        setToast({
          variant: "error",
          title: "حقل مطلوب",
          message: "يجب اختيار عنصر للبانر.",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      let imageUrl = "";

      if (formData.image instanceof File) {
        const uploaded = await uploadImage(formData.image);
        imageUrl = uploaded.data || uploaded.url;
      } else if (typeof formData.image === "string") {
        imageUrl = formData.image;
      }

      const payload: Partial<CreateBannerPayload> = {
        image: imageUrl,
        bannerType: formData.bannerType,
        item: formData.bannerType !== "General" ? formData.item : undefined,
      };

      await updateBanner(banner._id, payload);
      setToast({
        variant: "success",
        title: "نجح تحديث البانر",
        message: "تم تحديث البانر بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في تحديث البانر",
          message:
            err.response?.data?.message ||
            "فشل في تحديث البانر. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to update banner:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setFormData({
      image: banner.image || "",
      bannerType: banner.bannerType || "General",
      item: banner.item || "",
    });
    setIsLoading(false);
    closeModal?.();
  };

  // Get items based on bannerType
  const getItemOptions = () => {
    switch (formData.bannerType) {
      case "Product":
      case "Offer":
        return products.map((product) => ({
          value: product._id,
          label: product.nameAr,
        }));
      case "User":
        return vendors.map((vendor) => ({
          value: vendor._id,
          label: vendor.name,
        }));
      default:
        return [];
    }
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
                تعديل البانر
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Banner Image */}
                <div className="lg:col-span-2">
                  <Label>صورة البانر</Label>
                  {typeof formData.image === "string" && formData.image && (
                    <Image
                      src={formData.image}
                      width={800}
                      height={128}
                      alt="Current Banner"
                      className="mb-4 h-32 w-full rounded object-cover"
                    />
                  )}
                  <FileInput
                    accept="image/*"
                    onChange={(e) => handleChange("image", e.target.files?.[0])}
                  />
                </div>

                {/* Banner Type */}
                <div className="lg:col-span-2">
                  <Label>
                    نوع البانر <span className="text-error-500">*</span>
                  </Label>
                  <Select
                    value={formData.bannerType}
                    onChange={(value) => handleChange("bannerType", value)}
                    options={[
                      { value: "General", label: "عام" },
                      { value: "Product", label: "منتج" },
                      { value: "User", label: "متجر" },
                      { value: "Offer", label: "عرض" },
                    ]}
                    placeholder="اختر نوع البانر"
                  />
                </div>

                {/* Item Selection - Conditional */}
                {formData.bannerType !== "General" && (
                  <div className="lg:col-span-2">
                    <Label>
                      {(formData.bannerType === "Product" ||
                        formData.bannerType === "Offer") &&
                        "المنتج"}
                      {formData.bannerType === "User" && "المتجر"}
                      <span className="text-error-500">*</span>
                    </Label>
                    <Select
                      value={formData.item}
                      onChange={(value) => handleChange("item", value)}
                      options={getItemOptions()}
                      placeholder={`اختر ${
                        formData.bannerType === "Product"
                          ? "المنتج"
                          : formData.bannerType === "User"
                            ? "المتجر"
                            : "المنتج المطبق عليه العرض"
                      }`}
                    />
                  </div>
                )}
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

export function EditBannerButton({
  banner,
  onSuccess,
}: {
  banner: Banner;
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
      <EditBannerModal
        isOpen={isOpen}
        closeModal={closeModal}
        banner={banner}
        onSuccess={handleAfterEdit}
      />
    </>
  );
}

export function DeleteBannerModal({
  isOpen = false,
  closeModal = () => {},
  bannerId = "",
  onSuccess = () => {},
}) {
  const [toast, setToast] = useState<AlertProps | null>(null);
  const handleDelete = async () => {
    try {
      await deleteBanner(bannerId);
      setToast({
        variant: "success",
        title: "نجح حذف البانر",
        message: "تم حذف البانر بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
      onSuccess?.();
      closeModal();
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في حذف البانر",
          message:
            err.response?.data?.message ||
            "فشل في حذف البانر. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to delete banner:", err);
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
            حذف البانر
          </h4>

          <p className="text-gray-800 dark:text-white/90">
            هل أنت متأكد أنك تريد حذف هذا البانر؟
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

export function DeleteBannerButton({
  bannerId,
  onSuccess,
}: {
  bannerId: string;
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
      <DeleteBannerModal
        isOpen={isOpen}
        closeModal={closeModal}
        bannerId={bannerId}
        onSuccess={handleAfterDelete}
      />
    </>
  );
}
