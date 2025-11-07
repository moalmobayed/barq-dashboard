// src/components/banners/BannersTable.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBanners } from "@/hooks/useBanners";
import Pagination from "../tables/Pagination";
import {
  AddBannerButton,
  DeleteBannerButton,
  EditBannerButton,
} from "./BannersModals";
import Skeleton from "react-loading-skeleton";
import { fetchBannersByKeyword } from "@/lib/api/banners";
import { MdWidgets } from "react-icons/md";
import Image from "next/image";
import { getSingleProduct } from "@/lib/api/products";
import { getSingleVendor } from "@/lib/api/vendors";

const limits = [5, 10, 20, 50];

export default function BannersTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<typeof banners>([]);
  const [searchPages, setSearchPages] = useState(1);
  const [itemNames, setItemNames] = useState<Record<string, string>>({});
  const [loadingItemNames, setLoadingItemNames] = useState(false);

  const { banners, loading, totalPages, refetch } = useBanners(page, limit);

  // Fetch item names when banners change
  useEffect(() => {
    const fetchItemNames = async () => {
      const bannersToProcess = searchTerm.trim() ? searchResults : banners;

      if (bannersToProcess.length === 0) return;

      setLoadingItemNames(true);
      const names: Record<string, string> = {};

      for (const banner of bannersToProcess) {
        if (!banner.item) continue;

        try {
          if (
            banner.bannerType === "Product" ||
            banner.bannerType === "Offer"
          ) {
            const product = await getSingleProduct(banner.item);
            names[banner.item] = product.nameAr;
          } else if (banner.bannerType === "User") {
            const vendor = await getSingleVendor(banner.item);
            names[banner.item] = vendor.name;
          }
        } catch (error) {
          console.error(`Failed to fetch item name for ${banner.item}:`, error);
          names[banner.item] = banner.item; // Fallback to ID
        }
      }

      setItemNames(names);
      setLoadingItemNames(false);
    };

    fetchItemNames();
  }, [banners, searchResults, searchTerm]);

  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchPages(1);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const { data, pages } = await fetchBannersByKeyword(
          trimmed,
          page,
          limit,
        );
        if (!cancelled) {
          setSearchResults(data);
          setSearchPages(pages);
        }
      } catch {
        if (!cancelled) setSearchResults([]);
      } finally {
        // no-op
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [searchTerm, page, limit]);

  const filteredBanners = useMemo(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return banners;
    return searchResults;
  }, [banners, searchResults, searchTerm]);

  const effectiveTotalPages = useMemo(() => {
    const trimmed = searchTerm.trim();
    return trimmed ? searchPages : totalPages;
  }, [searchTerm, searchPages, totalPages]);

  return (
    <div className="space-y-4">
      {/* Card Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-sm">
          <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2">
            <svg
              className="fill-gray-500 dark:fill-gray-400"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                fill=""
              />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث عن الإعلانات..."
            className="h-11 w-full rounded-lg border border-gray-500 bg-transparent py-2.5 ps-12 pe-14 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:outline-hidden dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* Add Banner Button */}
        <AddBannerButton onSuccess={refetch} />
      </div>

      {/* Limit Selector */}
      <div className="flex items-center justify-end gap-2">
        <label
          htmlFor="limit"
          className="text-sm text-gray-600 dark:text-white/70"
        >
          عناصر لكل صفحة:
        </label>
        <select
          id="limit"
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1); // Reset to first page when limit changes
          }}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/80"
        >
          {limits.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="">
            <Table>
              {/* Table Header */}
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="text-start font-medium">
                    الصورة
                  </TableCell>
                  <TableCell isHeader className="text-start font-medium">
                    نوع الإعلان
                  </TableCell>
                  <TableCell isHeader className="text-start font-medium">
                    العنصر
                  </TableCell>
                  <TableCell isHeader className="text-start font-medium">
                    الإجراءات
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              {loading ? (
                <TableBody>
                  {Array.from({ length: 6 }).map((_, rowIdx) => (
                    <TableRow key={rowIdx}>
                      <TableCell className="px-4 py-6">
                        <Skeleton baseColor="#ecebeb" width={80} height={60} />
                      </TableCell>
                      <TableCell className="px-4 py-6">
                        <Skeleton baseColor="#ecebeb" width={100} height={24} />
                      </TableCell>
                      <TableCell className="px-4 py-6">
                        <Skeleton baseColor="#ecebeb" width={150} height={24} />
                      </TableCell>
                      <TableCell className="px-4 py-6">
                        <div className="flex gap-2">
                          <Skeleton
                            baseColor="#ecebeb"
                            width={32}
                            height={32}
                          />
                          <Skeleton
                            baseColor="#ecebeb"
                            width={32}
                            height={32}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredBanners.length === 0 ? (
                    <TableRow>
                      <td
                        colSpan={4}
                        className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <MdWidgets className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm font-medium">لا توجد إعلانات</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {searchTerm.trim()
                              ? "لم يتم العثور على نتائج للبحث"
                              : "لم يتم إضافة أي إعلانات بعد"}
                          </p>
                        </div>
                      </td>
                    </TableRow>
                  ) : (
                    filteredBanners.map((banner) => (
                      <TableRow key={banner._id}>
                        <TableCell className="px-5 py-4">
                          <Image
                            src={banner.image}
                            width={80}
                            height={60}
                            alt="Banner"
                            className="h-15 w-20 rounded object-cover"
                          />
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {banner.bannerType === "Product" && (
                            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              منتج
                            </span>
                          )}
                          {banner.bannerType === "User" && (
                            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              متجر
                            </span>
                          )}
                          {banner.bannerType === "Offer" && (
                            <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                              عرض
                            </span>
                          )}
                          {banner.bannerType === "General" && (
                            <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                              عام
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <span className="text-gray-800 dark:text-white/90">
                            {banner.item && banner.bannerType !== "General" ? (
                              loadingItemNames && !itemNames[banner.item] ? (
                                <Skeleton
                                  baseColor="#ecebeb"
                                  width={120}
                                  height={20}
                                />
                              ) : (
                                itemNames[banner.item] || banner.item
                              )
                            ) : (
                              "لا يوجد"
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="space-x-4">
                          <EditBannerButton
                            banner={banner}
                            onSuccess={refetch}
                          />
                          <DeleteBannerButton
                            bannerId={banner._id}
                            onSuccess={refetch}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              )}
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {effectiveTotalPages !== 0 && (
        <div className="flex justify-end pt-2">
          <Pagination
            currentPage={page}
            totalPages={effectiveTotalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
