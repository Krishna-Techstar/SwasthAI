"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { ADMIN_API_BASE } from "@/lib/api-client";
import { adminQueryKeys } from "@/lib/query-client";
import { useAdminStore } from "@/store/admin-store";

const EVENT_NAMES = [
  "admin.approval.created",
  "admin.approval.updated",
  "ai.soap.queued",
  "ai.soap.completed",
  "ai.radiology.queued",
  "consultation.started",
  "consultation.completed",
  "consultation.note.saved",
  "consultation.transcript.updated",
  "patient.vitals.updated",
  "report.soap.updated",
  "report.soap.signed",
  "radiology.upload.created",
  "radiology.ai.completed",
  "radiology.report.updated",
  "appointment.created",
  "appointment.updated",
  "notification.created",
  "file.registered",
];

export function AdminRealtimeProvider({ children }) {
  useAdminRealtimeSync();
  return children;
}

export function useAdminRealtimeSync() {
  const token = useAdminStore((state) => state.token);
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return undefined;
    }

    const baseUrl = process.env.NEXT_PUBLIC_REALTIME_URL ?? ADMIN_API_BASE.replace(/\/api\/v1\/?$/, "");
    const socket = io(`${baseUrl}/sync`, {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 8_000,
    });
    socketRef.current = socket;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    };

    EVENT_NAMES.forEach((eventName) => {
      socket.on(eventName, invalidate);
    });

    socket.on("connect", () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.realtimeHealth });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient, token]);

  return { connected: Boolean(token) };
}
