// src/components/agents/AgentsTable.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "../tables/Pagination";
import {
  AddAgentButton,
  DeleteAgentButton,
  EditAgentButton,
} from "./AgentsModals";
import Skeleton from "react-loading-skeleton";
import { MdDeliveryDining } from "react-icons/md";
import { getAgentSummary } from "@/lib/api/dashboard";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import DatePicker from "../form/date-picker";
import Image from "next/image";

const limits = [5, 10, 20, 50];

export default function AgentsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [tableLimit, setTableLimit] = useState(10);

  interface AgentData {
    deliveryAgent: {
      _id: string;
      name: string;
      mobile: string;
      profileImage: string;
      rating: number;
      createdAt: string;
      role: "delivery-agent";
      isActive?: boolean;
      reviewCount?: number;
      commissionRate: number;
    };
    ordersCount: number;
    delivery: number;
    agentEarn: number;
    barqEarnFromDelivery: number;
  }

  interface SummaryMetadata {
    summary: {
      totalOrders: number;
      totalDelivery: number;
      totalAgentEarn: number;
      totalBarqEarnFromDelivery: number;
    };
    data: AgentData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }

  const [summaryData, setSummaryData] = useState<SummaryMetadata | null>(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    setTableLoading(true);
    try {
      const res = await getAgentSummary({
        page: tablePage,
        limit: tableLimit,
        agentName: searchTerm || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      setSummaryData(res);
    } catch (error) {
      console.error("Error fetching agent summary:", error);
    } finally {
      setTableLoading(false);
    }
  }, [tablePage, tableLimit, searchTerm, fromDate, toDate]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const agents = summaryData?.data || [];
  const effectiveTotalPages = summaryData?.pagination?.totalPages || 0;

  return (
    <div className="space-y-4">
      {/* Card Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex max-w-full flex-wrap items-center gap-4">
          {/* Search Input */}
          <div className="relative">
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setTablePage(1);
              }}
              placeholder="البحث عن عامل التوصيل..."
              className="h-11 w-full rounded-lg border border-gray-500 bg-transparent py-2.5 ps-12 pe-14 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-1 focus:outline-hidden dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
            />
          </div>

          {/* Date Filters */}
          <div className="w-full sm:max-w-[150px]">
            <DatePicker
              id="fromDate"
              placeholder="من تاريخ"
              onChange={(dates) => {
                setFromDate(dates[0]?.toISOString() || "");
                setTablePage(1);
              }}
            />
          </div>

          <div className="w-full sm:max-w-[150px]">
            <DatePicker
              id="toDate"
              placeholder="إلى تاريخ"
              onChange={(dates) => {
                setToDate(dates[0]?.toISOString() || "");
                setTablePage(1);
              }}
            />
          </div>
        </div>

        {/* Add Agent Button */}
        <AddAgentButton onSuccess={fetchSummary} />
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
          value={tableLimit}
          onChange={(e) => {
            setTableLimit(Number(e.target.value));
            setTablePage(1);
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
                    التقييم
                  </TableCell>
                  <TableCell isHeader className="text-start font-medium">
                    عدد الطلبات
                  </TableCell>
                  <TableCell isHeader className="text-start font-medium">
                    التوصيل
                  </TableCell>
                  <TableCell isHeader className="text-start font-medium">
                    ربح المندوب
                  </TableCell>
                  <TableCell isHeader className="text-start font-medium">
                    عمولة برق (توصيل)
                  </TableCell>
                  <TableCell isHeader className="text-start font-medium">
                    الإجراءات
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              {tableLoading ? (
                <TableBody>
                  {Array.from({ length: 5 }).map((_, rowIdx) => (
                    <TableRow key={rowIdx}>
                      {Array.from({ length: 7 }).map((_, cellIdx) => (
                        <TableCell key={cellIdx}>
                          <Skeleton baseColor="#ecebeb" height={16} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {agents.length === 0 ? (
                    <TableRow>
                      <td
                        colSpan={7}
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
                    agents.map((agentData) => (
                      <TableRow key={agentData.deliveryAgent._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Image
                              src={
                                agentData.deliveryAgent.profileImage ||
                                "/images/logo/barq-logo.png"
                              }
                              alt="agent"
                              width={32}
                              height={32}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                            <div className="text-xs">
                              <p className="font-medium text-gray-800 dark:text-white/90">
                                {agentData.deliveryAgent.name}
                              </p>
                              <p className="text-gray-500">
                                {agentData.deliveryAgent.mobile}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          ⭐ {agentData.deliveryAgent.rating}
                        </TableCell>
                        <TableCell>{agentData.ordersCount}</TableCell>
                        <TableCell>
                          {agentData.delivery?.toLocaleString()} ج.م
                        </TableCell>
                        <TableCell>
                          {agentData.agentEarn?.toLocaleString()} ج.م
                        </TableCell>
                        <TableCell className="text-indigo-500">
                          {agentData.barqEarnFromDelivery?.toLocaleString()} ج.م
                        </TableCell>
                        <TableCell className="space-x-2">
                          <EditAgentButton
                            agent={agentData.deliveryAgent}
                            onSuccess={fetchSummary}
                          />
                          <DeleteAgentButton
                            agentId={agentData.deliveryAgent._id}
                            onSuccess={fetchSummary}
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
      {effectiveTotalPages > 1 && (
        <div className="flex justify-end pt-2">
          <Pagination
            currentPage={tablePage}
            totalPages={effectiveTotalPages}
            onPageChange={setTablePage}
          />
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
            <div className="flex items-center gap-2 text-indigo-600">
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
            <div className="grid grid-cols-1 gap-4 p-6 pt-0 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  إجمالي الطلبات
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {summaryData.summary.totalOrders?.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  إجمالي التوصيل
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {summaryData.summary.totalDelivery?.toLocaleString()} ج.م
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  إجمالي ربح المندوب
                </p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {summaryData.summary.totalAgentEarn?.toLocaleString()} ج.م
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  إجمالي عمولة برق (توصيل)
                </p>
                <p className="0 text-xl font-bold text-indigo-600">
                  {summaryData.summary.totalBarqEarnFromDelivery?.toLocaleString()}{" "}
                  ج.م
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
