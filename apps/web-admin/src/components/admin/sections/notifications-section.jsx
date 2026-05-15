"use client";

import { useQuery } from "@tanstack/react-query";
import { adminDataApi } from "@/lib/admin-api";
import { adminQueryKeys } from "@/lib/query-client";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/glass-card";

export function NotificationsSection() {
  const query = useQuery({ queryKey: adminQueryKeys.notifications({}), queryFn: () => adminDataApi.notifications({ limit: 50 }) });

  const columns = [
    { key: "title", label: "Title", render: (row) => <span className="font-medium">{row.title}</span> },
    { key: "body", label: "Message", render: (row) => <span className="text-xs text-txt-secondary max-w-[300px] truncate block">{row.body}</span> },
    { key: "type", label: "Type", render: (row) => <StatusBadge label={row.type} variant="brand" /> },
    { key: "channel", label: "Channel", render: (row) => <StatusBadge label={row.channel} variant="neutral" /> },
    { key: "user", label: "User", render: (row) => row.user?.fullName ?? "—" },
    { key: "read", label: "Read", render: (row) => row.readAt ? <StatusBadge label="Read" variant="success" /> : <StatusBadge label="Unread" variant="warning" /> },
    { key: "createdAt", label: "Sent", render: (row) => fmt(row.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Notifications" title="Notification Center" subtitle="All system notifications and delivery status." badge="Live API">
        {query.data?.unreadCount > 0 && <StatusBadge label={`${query.data.unreadCount} unread`} variant="warning" />}
      </PageHeader>
      <DataTable columns={columns} data={query.data?.items ?? []} total={query.data?.items?.length ?? 0} page={1} limit={50} loading={query.isLoading} emptyMessage="No notifications yet." />
    </div>
  );
}

function fmt(v) { return v ? new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }).format(new Date(v)) : "—"; }
