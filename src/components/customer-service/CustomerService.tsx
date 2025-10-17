// src/app/components/customer-service/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import io from "socket.io-client";
import type { Socket } from "socket.io-client";
import Pagination from "@/components/tables/Pagination";
import {
  getAdminTickets,
  getSupportReplies,
  createSupportReply,
} from "@/lib/api/tickets";
import { Chat, Message } from "@/types/customerservice";
import { getAuthToken } from "@/lib/api/auth";

export default function CustomerServiceComponent() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Helper function to refresh messages
  const refreshMessages = useCallback((chatId: string) => {
    getSupportReplies(chatId)
      .then((res) => {
        setMessages(res.data);
      })
      .catch((error) => {
        console.error("Error refreshing messages:", error);
      });
  }, []);

  // Helper function to refresh chat list
  const refreshChatList = useCallback(() => {
    getAdminTickets(currentPage)
      .then((res) => {
        setChats(res.data || res.data);
        setTotalPages(res.metadata.pages || 1);
      })
      .catch((error) => {
        console.error("Error refreshing chat list:", error);
      });
  }, [currentPage]);

  // Load chats when page changes
  useEffect(() => {
    setLoadingChats(true);
    getAdminTickets(currentPage).then((res) => {
      setChats(res.data || res.data);
      setTotalPages(res.metadata.pages || 1);
      setLoadingChats(false);
    });
  }, [currentPage]);

  // Initialize socket connection once
  useEffect(() => {
    const token = getAuthToken();

    // Define multiple socket URL options for production
    let socketUrl: string;

    if (process.env.NODE_ENV === "production") {
      // Primary: Same domain without port (most common for production)
      socketUrl = "https://api.barqshipping.com";
    } else {
      // Local development - use HTTP
      socketUrl = "http://api.barqshipping.com:4000";
    }
    
    const newSocket = io(socketUrl, {
      path: "/socket.io/", // Explicitly set the socket.io path
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
      withCredentials: true,
      transports: ["polling", "websocket"],
      timeout: 20000, // 20 seconds timeout
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 3, // Reduced attempts for faster fallback
      upgrade: true,
      rememberUpgrade: false,
      forceNew: true, // Force new connection to avoid caching issues
      autoConnect: true,
    });

    setSocket(newSocket);

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      console.error("Failed to connect to:", socketUrl);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        // Check for additional properties safely
        toString: error.toString(),
      });
    });

    // Socket event listeners
    newSocket.on("support:chat:join", (data) => {
      const chatId = data?.chat?._id || data?.chat;
      if (selectedChat && chatId === selectedChat._id) {
        refreshMessages(chatId);
      }
    });

    newSocket.on("support:chat:message", (data) => {
      // Extract chat ID properly - data.chat is an object with _id property
      const chatId = data?.chat?._id;

      if (selectedChat && chatId === selectedChat._id) {
        // If the reply data is included in the event, add it immediately for better UX
        if (data.reply) {
          setMessages((prev) => [
            ...prev,
            {
              _id: data.reply._id,
              message: data.reply.message,
              type: data.reply.type,
              createdAt: data.reply.createdAt,
              updatedAt: data.reply.updatedAt || data.reply.createdAt,
            },
          ]);
        }

        // Then refresh to ensure consistency with server after a short delay
        setTimeout(() => refreshMessages(chatId), 300);
      }
      // Also refresh the chat list to update last message
      refreshChatList();
    });

    newSocket.on("support:chat:leave", (data) => {
      const chatId = data?.chat?._id || data?.chat;
      if (selectedChat && chatId === selectedChat._id) {
        setSelectedChat(null);
        setMessages([]);
      }
    });

    newSocket.on("new:chat", () => {
      refreshChatList();
    });

    return () => {
      newSocket.disconnect();
    };
  }, [selectedChat, refreshMessages, refreshChatList]);

  // Handle chat selection and join/leave events
  useEffect(() => {
    if (socket && selectedChat) {
      socket.emit("support:chat:join", { chat: selectedChat._id });

      return () => {
        socket.emit("support:chat:leave", { chat: selectedChat._id });
      };
    }
  }, [socket, selectedChat]);

  useEffect(() => {
    if (selectedChat) {
      setLoadingMessages(true);
      getSupportReplies(selectedChat._id).then((res) => {
        setMessages(res.data);
        setLoadingMessages(false);
      });
    }
  }, [selectedChat]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;
    setSending(true);
    try {
      await createSupportReply(selectedChat._id, newMessage);
      setNewMessage("");
      // Immediately refresh messages after sending
      refreshMessages(selectedChat._id);
      // Also refresh chat list to update last message
      refreshChatList();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Chat List */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          الدردشات
        </h2>
        {loadingChats ? (
          <div className="text-gray-500 dark:text-gray-400">
            جاري التحميل...
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {chats.map((chat) => (
                <li key={chat._id}>
                  <button
                    className={`w-full rounded-lg px-3 py-2 text-start transition-colors ${selectedChat?._id === chat._id ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-white/[0.05]"}`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar: first letter of name or ? */}
                      <span className="inline-block size-10 items-center justify-center rounded-full bg-gray-200 text-center text-lg font-bold text-gray-600 dark:bg-gray-700 dark:text-white/80">
                        {chat.user?.name?.charAt(0) ?? "؟"}
                      </span>
                      {/* User info */}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium text-gray-800 dark:text-white/90">
                          {chat.user?.name ?? "بدون اسم"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {chat.user?.mobile ?? "بدون رقم"}
                        </span>
                        <div className="mt-1 flex gap-2">
                          {chat.user?.loyalPoints !== undefined && (
                            <span
                              className="group relative flex cursor-pointer items-center gap-1 text-green-500 dark:text-green-400"
                              title={`نقاط الولاء: ${chat.user.loyalPoints}`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15.27L16.18 18l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 3.73L3.82 18z" />
                              </svg>
                              <span>{chat.user.loyalPoints}</span>
                              <span className="absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block">
                                نقاط الولاء
                              </span>
                            </span>
                          )}
                          {chat.user?.rating !== undefined && (
                            <span
                              className="group relative flex cursor-pointer items-center gap-1 text-yellow-500 dark:text-yellow-400"
                              title={`تقييم: ${chat.user.rating}`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              ></svg>
                              ⭐<span>{chat.user.rating}</span>
                              <span className="absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 rounded bg-black px-2 py-1 text-xs whitespace-nowrap text-white group-hover:block">
                                تقييم
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Created date */}
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {chat.user?.createdAt
                          ? new Date(chat.user.createdAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-4 md:col-span-2 dark:border-gray-800 dark:bg-white/[0.03]">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          المحادثة
        </h2>
        {!selectedChat ? (
          <div className="text-gray-500 dark:text-gray-400">
            اختر دردشة لعرض الرسائل
          </div>
        ) : loadingMessages ? (
          <div className="text-gray-500 dark:text-gray-400">
            جاري تحميل الرسائل...
          </div>
        ) : (
          <div className="mb-4 flex-1 space-y-3 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${msg.type === "admin" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-xl px-4 py-2 text-sm ${msg.type === "admin" ? "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90"}`}
                >
                  {msg.message}
                  <div className="mt-1 text-end text-xs text-gray-400 dark:text-gray-500">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Message Input */}
        {selectedChat && (
          <form onSubmit={handleSend} className="mt-2 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/80"
              placeholder="اكتب رسالة..."
              disabled={sending}
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300"
              disabled={sending}
            >
              إرسال
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
