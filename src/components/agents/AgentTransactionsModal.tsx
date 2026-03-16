// src/components/agents/AgentTransactionsModal.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { getAgentHistory, resetAgentHistory } from "@/lib/api/dashboard";
import Badge from "@/components/ui/badge/Badge";
import Image from "next/image";
import Skeleton from "react-loading-skeleton";

interface TransactionOrder {
  _id: string;
  orderStatus: string;
  orderNumber: string;
  createdAt: string;
  deliveryAgent: {
    _id: string;
    name: string;
    mobile: string;
  };
  vendor: {
    _id: string;
    name: string;
    mobile: string;
    profileImage?: string;
  };
  user: {
    _id: string;
    name: string;
    mobile: string;
    profileImage?: string;
  };
  total: number;
  delivery: number;
  totalWithDelivery: number;
  agentEarn: number;
  barqEarnFromDelivery: number;
}

interface TransactionSummary {
  total: number;
  delivery: number;
  totalWithDelivery: number;
  agentEarn: number;
  barqEarnFromDelivery: number;
  totalOrders: number;
}

interface AgentTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
}

const LIMIT = 3;

export default function AgentTransactionsModal({
  isOpen,
  onClose,
  agentId,
  agentName,
}: AgentTransactionsModalProps) {
  const [transactions, setTransactions] = useState<TransactionOrder[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showResetPicker, setShowResetPicker] = useState(false);
  const [resetDate, setResetDate] = useState("");
  const [resetting, setResetting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchTransactions = useCallback(
    async (pageNum: number, append: boolean = false) => {
      if (pageNum === 1) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }
      try {
        const res = await getAgentHistory(agentId, {
          page: pageNum,
          limit: LIMIT,
        });
        setSummary(res.summary);
        setTotalPages(res.pagination.totalPages);
        if (append) {
          setTransactions((prev) => [...prev, ...res.data]);
        } else {
          setTransactions(res.data);
        }
      } catch (error) {
        console.error("Error fetching agent history:", error);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [agentId],
  );

  // Reset and fetch when modal opens
  useEffect(() => {
    if (isOpen && agentId) {
      setPage(1);
      setTransactions([]);
      setSummary(null);
      fetchTransactions(1, false);
    }
  }, [isOpen, agentId, fetchTransactions]);

  const handleReset = async () => {
    if (!resetDate) return;
    setResetting(true);
    try {
      await resetAgentHistory(agentId, new Date(resetDate).toISOString());
      setShowResetPicker(false);
      setResetDate("");
      setPage(1);
      setTransactions([]);
      setSummary(null);
      fetchTransactions(1, false);
    } catch (error) {
      console.error("Error resetting agent history:", error);
    } finally {
      setResetting(false);
    }
  };

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || loading || page >= totalPages) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage, true);
    }
  }, [loading, page, totalPages, fetchTransactions]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="z-50 m-4 max-w-[800px]"
    >
      <div className="no-scrollbar relative w-full max-w-[800px] overflow-hidden rounded-3xl bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 pt-6 pb-4 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            سجل المعاملات - {agentName}
          </h3>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowResetPicker((v) => !v)}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
            >
              إعادة تعيين البيانات
            </button>
          </div>

          {/* Reset Date Picker */}
          {showResetPicker && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="datetime-local"
                value={resetDate}
                onChange={(e) => setResetDate(e.target.value)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />
              <button
                type="button"
                onClick={handleReset}
                disabled={!resetDate || resetting}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resetting ? "جاري..." : "تأكيد"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetPicker(false);
                  setResetDate("");
                }}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 gap-3 border-b border-gray-200 px-6 py-4 sm:grid-cols-3 lg:grid-cols-5 dark:border-gray-800">
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                عدد الطلبات
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {summary.totalOrders}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                الإجمالي
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {summary.totalWithDelivery?.toLocaleString()} ج.م
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                التوصيل
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {summary.delivery?.toLocaleString()} ج.م
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ربح المندوب
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {summary.agentEarn?.toLocaleString()} ج.م
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                عمولة برق
              </p>
              <p className="text-sm font-bold text-indigo-600">
                {summary.barqEarnFromDelivery?.toLocaleString()} ج.م
              </p>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div
          ref={scrollContainerRef}
          className="max-h-[400px] overflow-y-auto px-6 py-4"
        >
          {initialLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-100 p-4 dark:border-gray-800"
                >
                  <Skeleton baseColor="#ecebeb" height={60} />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                لا توجد معاملات
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                لم يتم العثور على أي معاملات لهذا المندوب
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx._id}
                  className="rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50/50 dark:border-gray-800 dark:hover:bg-gray-800/30"
                >
                  {/* Top row: Order number + status + date */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                        طلب #{tx.orderNumber}
                      </span>
                      <Badge
                        size="sm"
                        color={
                          tx.orderStatus === "completed"
                            ? "success"
                            : tx.orderStatus === "cancelled"
                              ? "error"
                              : "warning"
                        }
                      >
                        {tx.orderStatus === "pending"
                          ? "قيد الانتظار"
                          : tx.orderStatus === "processing"
                            ? "جارِ التنفيذ"
                            : tx.orderStatus === "shipped"
                              ? "تم الشحن"
                              : tx.orderStatus === "completed"
                                ? "تم التوصيل"
                                : tx.orderStatus === "cancelled"
                                  ? "ملغاة"
                                  : tx.orderStatus}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(tx.createdAt).toLocaleString("ar-EG")}
                    </span>
                  </div>

                  {/* Vendor & User */}
                  <div className="mb-3 flex flex-wrap items-center gap-4">
                    {/* Vendor */}
                    <div className="flex items-center gap-2">
                      <Image
                        src={
                          tx.vendor?.profileImage ||
                          "/images/logo/barq-logo.png"
                        }
                        alt="vendor"
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                      <div className="text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          المتجر:{" "}
                        </span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {tx.vendor?.name}
                        </span>
                      </div>
                    </div>
                    {/* User */}
                    <div className="text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        العميل:{" "}
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {tx.user?.name}
                      </span>
                    </div>
                  </div>

                  {/* Financials */}
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        الإجمالي:{" "}
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {tx.totalWithDelivery?.toLocaleString()} ج.م
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        التوصيل:{" "}
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {tx.delivery?.toLocaleString()} ج.م
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        ربح المندوب:{" "}
                      </span>
                      <span className="font-medium text-green-600">
                        {tx.agentEarn?.toLocaleString()} ج.م
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        عمولة برق:{" "}
                      </span>
                      <span className="font-medium text-indigo-600">
                        {tx.barqEarnFromDelivery?.toLocaleString()} ج.م
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator for infinite scroll */}
              {loading && (
                <div className="space-y-3 pt-2">
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div
                      key={`loading-${idx}`}
                      className="rounded-xl border border-gray-100 p-4 dark:border-gray-800"
                    >
                      <Skeleton baseColor="#ecebeb" height={60} />
                    </div>
                  ))}
                </div>
              )}

              {/* End of list indicator */}
              {!loading && page >= totalPages && transactions.length > 0 && (
                <p className="py-3 text-center text-xs text-gray-400 dark:text-gray-500">
                  تم عرض جميع المعاملات
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
