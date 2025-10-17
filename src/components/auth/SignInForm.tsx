"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  loginAdmin,
  setAuthToken,
  setAdminData,
  LoginPayload,
} from "@/lib/api/auth";
import { EyeCloseIcon, EyeIcon } from "../../../public/icons";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginPayload>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginPayload>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof LoginPayload]) {
      if (name === "password" && value.length < 6) {
        return;
      }
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginPayload> = {};

    if (!formData.email) {
      newErrors.email = "البريد الالكتروني مطلوب";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "البريد الالكتروني غير صالح";
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن لا تقل عن 6 أحرف";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginAdmin(formData);

      // Store auth data
      setAuthToken(response.data.accessToken);
      setAdminData(response.data.admin);

      // Redirect to admin dashboard
      router.push("/");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Handle different error scenarios
      if (error.response?.status === 401) {
        setErrors({
          email: "البريد الالكتروني أو كلمة المرور غير صحيحة",
        });
      } else if (error.response?.status === 400) {
        setErrors({
          email:
            error.response?.data.message || "بيانات تسجيل الدخول غير صحيحة",
        });
      } else if (error.response?.status === 404) {
        setErrors({
          email: "المستخدم غير موجود",
        });
      } else {
        setErrors({
          email: "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        {/* Header & Description */}
        <div>
          <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
            تسجيل الدخول
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            اكتب البريد الاكتروني وكلمة المرور لتسجيل الدخول
          </p>
        </div>

        <div>
          {/* Border */}
          <div className="inset-0 my-3 flex w-full items-center border-t border-gray-200 sm:my-5 dark:border-gray-800"></div>

          {/* Sign in Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <Label>
                البريد الاكتروني <span className="text-error-500">*</span>{" "}
              </Label>
              <Input
                name="email"
                placeholder="ادخل البريد الإلكتروني"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "border-red-500" : ""}
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <Label>
                كلمة المرور <span className="text-error-500">*</span>{" "}
              </Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="ادخل كلمة المرور"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? "border-red-500" : ""}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                  )}
                </span>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              className="flex w-full items-center justify-center gap-2"
              size="sm"
              disabled={isLoading}
            >
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
              تسجيل الدخول
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
