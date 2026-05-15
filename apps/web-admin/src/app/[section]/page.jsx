import { AdminShell } from "@/components/layout/admin-shell";
import { LiveAdminSection } from "@/components/admin/live-admin-section";

export default async function SectionPage({ params }) {
  const { section } = await params;

  return (
    <AdminShell>
      <LiveAdminSection section={section ?? "dashboard"} />
    </AdminShell>
  );
}
