// src/components/agents/AgentsTable.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useAgents } from "@/hooks/useAgents";
import Pagination from "../tables/Pagination";
import {
  AddAgentButton,
  DeleteAgentButton,
  EditAgentButton,
} from "./AgentsModals";
import Skeleton from "react-loading-skeleton";
import { fetchAgentsByKeyword } from "@/lib/api/agents";
import { MdDeliveryDining } from "react-icons/md";
import { getOrderSummary } from "@/lib/api/dashboard";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import DatePicker from "../form/date-picker";

const limits = [5, 10, 20, 50];

export default function AgentsTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<typeof agents>([]);
  const [searchPages, setSearchPages] = useState(1);

  interface SummaryMetadata {
    summary: {
      delivery: number;
      agentEarn: number;
      barqEarnFromDelivery: number;
    };
  }

  const [summaryData, setSummaryData] = useState<SummaryMetadata | null>(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Filter states for summary
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  // const [userId, setUserId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  // const [sortBy, setSortBy] = useState("createdAt");
  // const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { agents, loading, totalPages, refetch } = useAgents(page, limit);

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
        const { data, pages } = await fetchAgentsByKeyword(
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
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [searchTerm, page, limit]);

  const filteredAgents = useMemo(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return agents;
    return searchResults;
  }, [agents, searchResults, searchTerm]);

  const effectiveTotalPages = useMemo(() => {
    const trimmed = searchTerm.trim();
    return trimmed ? searchPages : totalPages;
  }, [searchTerm, searchPages, totalPages]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await getOrderSummary({
        page: 1,
        limit: 1,
        orderStatus: orderStatus || undefined,
        paymentStatus: paymentStatus || undefined,
        // userId: userId || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        // sortBy: sortBy || undefined,
        // sortOrder: sortOrder || undefined,
      });
      setSummaryData(res);
    } catch (error) {
      console.error("Error fetching agent summary:", error);
    }
  }, [orderStatus, paymentStatus, fromDate, toDate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

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
            placeholder="البحث عن عامل التوصيل..."
            className="h-11 w-full rounded-lg border border-gray-500 bg-transparent py-2.5 ps-12 pe-14 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:outline-hidden dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
          />
        </div>

        {/* Add Agent Button */}
        <AddAgentButton onSuccess={refetch} />
      </div>

      {/* Limit Selector */}
      <div className="flex items-center justify-end gap-2">
        <label
          htmlFor="limit"
          className="text-sm text-gray-600 dark:text-white/70"
        >
          صف في الصفحة:
        </label>
        <select
          id="limit"
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
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
          <div>
            <Table>
              <TableHeader className="">
                <TableRow>
                  <TableCell isHeader className="text-start font-medium">
                    عامل التوصيل
                  </TableCell>
                  <TableCell isHeader className="text-start font-medium">
                    الحالة
                  </TableCell>
                  <TableCell isHeader className="text-start font-medium">
                    التقييم
                  </TableCell>
                  <TableCell isHeader className="text-start font-medium">
                    عدد المراجعات
                  </TableCell>
                  <TableCell isHeader className="text-start font-medium">
                    معدل العمولة
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
                      <TableCell className="w-fit py-6 text-center text-gray-500">
                        <Skeleton baseColor="#ecebeb" width={120} height={18} />
                        <Skeleton baseColor="#ecebeb" width={120} height={18} />
                      </TableCell>

                      {Array.from({ length: 5 }).map((_, cellIdx) => (
                        <TableCell
                          key={cellIdx}
                          className="px-4 py-6 text-center text-gray-500"
                        >
                          <Skeleton
                            baseColor="#ecebeb"
                            width="100%"
                            height={40}
                          />
                        </TableCell>
                      ))}

                      <TableCell className="flex items-center justify-center gap-3 px-4 py-6 text-gray-500">
                        <Skeleton baseColor="#ecebeb" width={24} height={24} />
                        <Skeleton baseColor="#ecebeb" width={24} height={24} />
                        <Skeleton baseColor="#ecebeb" width={24} height={24} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredAgents.length === 0 ? (
                    <TableRow>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <MdDeliveryDining className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                          <p className="text-sm font-medium">
                            لا يوجد عمال توصيل
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            {searchTerm.trim()
                              ? "لم يتم العثور على نتائج للبحث"
                              : "لم يتم إضافة أي عمال توصيل بعد"}
                          </p>
                        </div>
                      </td>
                    </TableRow>
                  ) : (
                    filteredAgents.map((agent) => (
                      <TableRow key={agent._id}>
                        <TableCell>
                          <span className="block font-medium text-gray-800 dark:text-white/90">
                            {agent.name}
                          </span>
                          <span className="text-sm">{agent.mobile}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            size="sm"
                            color={agent.isActive ? "success" : "error"}
                            variant="light"
                          >
                            {agent.isActive ? "مفعلة" : "معطلة"}
                          </Badge>
                        </TableCell>
                        <TableCell>⭐ {agent.rating}</TableCell>
                        <TableCell>{agent.reviewCount}</TableCell>
                        <TableCell>{agent.commissionRate}%</TableCell>
                        <TableCell className="space-x-2">
                          <EditAgentButton agent={agent} onSuccess={refetch} />
                          <DeleteAgentButton
                            agentId={agent._id}
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

      {/* Summary Filters */}
      {summaryData && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <h4 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
            تصفية الملخص الحسابي
          </h4>
          <div className="flex max-w-full flex-wrap items-center gap-4">
            {/* <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="معرف المستخدم..."
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:outline-hidden sm:max-w-[150px] dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
            /> */}

            <div className="w-full sm:max-w-[150px]">
              <DatePicker
                id="summaryFromDate"
                placeholder="من تاريخ"
                onChange={(dates) => setFromDate(dates[0]?.toISOString() || "")}
              />
            </div>

            <div className="w-full sm:max-w-[150px]">
              <DatePicker
                id="summaryToDate"
                placeholder="إلى تاريخ"
                onChange={(dates) => setToDate(dates[0]?.toISOString() || "")}
              />
            </div>

            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <option value="">كل الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="processing">جارِ التنفيذ</option>
              <option value="shipped">تم الشحن</option>
              <option value="completed">تم التوصيل</option>
              <option value="cancelled">ملغاة</option>
            </select>

            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <option value="">حالة الدفع</option>
              <option value="pending">قيد الانتظار</option>
              <option value="paid">تم الدفع</option>
              <option value="failed">فشل الدفع</option>
            </select>

            {/* <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split(":");
                setSortBy(field);
                setSortOrder(order as "asc" | "desc");
              }}
              className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <option value="createdAt:desc">الأحدث أولاً</option>
              <option value="createdAt:asc">الأقدم أولاً</option>
              <option value="sumAmount:desc">الأعلى قيمة</option>
              <option value="sumAmount:asc">الأقل قيمة</option>
            </select> */}
          </div>
        </div>
      )}

      {/* Summary Section */}
      {summaryData && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div
            className="flex cursor-pointer items-center justify-between p-6"
            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              ملخص العمليات الحسابي لعمال التوصيل
            </h3>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <span className="text-sm font-medium">
                {isSummaryExpanded ? "طي الملخص" : "عرض التفاصيل الحسابية"}
              </span>
              {isSummaryExpanded ? (
                <FiChevronUp className="h-5 w-5" />
              ) : (
                <FiChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>

          {isSummaryExpanded && (
            <div className="grid grid-cols-1 gap-4 p-6 pt-0 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  عمولة برق (توصيل)
                </p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {summaryData.summary.barqEarnFromDelivery?.toLocaleString()}{" "}
                  ج.م
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  التوصيل
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {summaryData.summary.delivery?.toLocaleString()} ج.م
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ربح المندوب
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {summaryData.summary.agentEarn?.toLocaleString()} ج.م
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
