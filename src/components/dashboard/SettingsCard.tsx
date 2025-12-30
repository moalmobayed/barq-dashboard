"use client";

import React, { useState, useEffect } from "react";
import { fetchSettings, updateSettings } from "@/lib/api/settings";
import { Settings, UpdateSettingsPayload } from "@/types/settings";
import Button from "../ui/button/Button";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Alert, { AlertProps } from "@/components/ui/alert/Alert";
import { AxiosError } from "axios";
import { FaPercentage, FaCoins, FaMoneyBillWave } from "react-icons/fa";

export default function SettingsCard() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<AlertProps | null>(null);

  const [formData, setFormData] = useState<UpdateSettingsPayload>({
    agentCommissionRate: 0,
    earnPointRate: 0,
    redeemPointRate: 0,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetchSettings();
      setSettings(response.data);
      setFormData({
        agentCommissionRate: response.data.agentCommissionRate,
        earnPointRate: response.data.earnPointRate,
        redeemPointRate: response.data.redeemPointRate,
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      setToast({
        variant: "error",
        title: "خطأ في تحميل الإعدادات",
        message: "فشل في تحميل الإعدادات. يرجى المحاولة مرة أخرى",
      });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateSettingsPayload, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to current settings
    if (settings) {
      setFormData({
        agentCommissionRate: settings.agentCommissionRate,
        earnPointRate: settings.earnPointRate,
        redeemPointRate: settings.redeemPointRate,
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Validation
      if (
        formData.agentCommissionRate === undefined ||
        formData.earnPointRate === undefined ||
        formData.redeemPointRate === undefined
      ) {
        setToast({
          variant: "error",
          title: "حقول مطلوبة",
          message: "جميع الحقول مطلوبة",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      if (
        formData.agentCommissionRate < 0 ||
        formData.earnPointRate < 0 ||
        formData.redeemPointRate < 0
      ) {
        setToast({
          variant: "error",
          title: "قيم غير صالحة",
          message: "القيم يجب أن تكون أكبر من أو تساوي صفر",
        });
        setTimeout(() => setToast(null), 5000);
        return;
      }

      const response = await updateSettings(formData);
      setSettings(response.data);
      setIsEditing(false);

      setToast({
        variant: "success",
        title: "نجح تحديث الإعدادات",
        message: "تم تحديث الإعدادات بنجاح",
      });
      setTimeout(() => setToast(null), 5000);
    } catch (err) {
      if (err instanceof AxiosError) {
        setToast({
          variant: "error",
          title: "خطأ في تحديث الإعدادات",
          message:
            err.response?.data?.message ||
            "فشل في تحديث الإعدادات. يرجى المحاولة مرة أخرى",
        });
      } else {
        setToast({
          variant: "error",
          title: "خطأ غير متوقع",
          message: "حدث خطأ غير معروف",
        });
      }
      setTimeout(() => setToast(null), 5000);
      console.error("Failed to update settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            إعدادات النظام
          </h3>
        </div>
        <div className="py-12 text-center text-gray-400">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            إعدادات النظام
          </h3>
          {!isEditing && (
            <Button size="sm" variant="primary" onClick={handleEdit}>
              تعديل الإعدادات
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Agent Commission Rate */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                <FaPercentage className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                نسبة عمولة عامل التوصيل (%)
              </Label>
            </div>
            {isEditing ? (
              <Input
                type="number"
                value={formData.agentCommissionRate?.toString() || "0"}
                onChange={(e) =>
                  handleChange("agentCommissionRate", e.target.value)
                }
                placeholder="أدخل نسبة عمولة عامل التوصيل"
                min="0"
                step={0.01}
              />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {settings?.agentCommissionRate}%
              </p>
            )}
          </div>

          {/* Earn Point Rate */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-500/20">
                <FaCoins className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                معدل كسب النقاط (نقطة/جنيه)
              </Label>
            </div>
            {isEditing ? (
              <Input
                type="number"
                value={formData.earnPointRate?.toString() || "0"}
                onChange={(e) => handleChange("earnPointRate", e.target.value)}
                placeholder="أدخل معدل كسب النقاط"
                min="0"
                step={0.01}
              />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {settings?.earnPointRate}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              كم نقطة يكسبها العميل لكل جنيه
            </p>
          </div>

          {/* Redeem Point Rate */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/20">
                <FaMoneyBillWave className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                معدل استبدال النقاط (نقطة/جنيه)
              </Label>
            </div>
            {isEditing ? (
              <Input
                type="number"
                value={formData.redeemPointRate?.toString() || "0"}
                onChange={(e) =>
                  handleChange("redeemPointRate", e.target.value)
                }
                placeholder="أدخل معدل استبدال النقاط"
                min="0"
                step={0.01}
              />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {settings?.redeemPointRate}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              كم نقطة تساوي كل جنيه عند الاستبدال
            </p>
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button size="sm" variant="outline" onClick={handleCancel}>
              إلغاء
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving && (
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
        )}

        {settings && (
          <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
            <div className="grid grid-cols-1 gap-4 text-sm text-gray-500 md:grid-cols-2 dark:text-gray-400">
              <div>
                <span className="font-medium">آخر تحديث:</span>{" "}
                {new Date(settings.updatedAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed end-4 top-4 z-[9999] max-w-sm">
          <Alert {...toast} />
        </div>
      )}
    </>
  );
}
