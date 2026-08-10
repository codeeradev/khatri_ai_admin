import { AdminSidebar } from "@/components/admin-sidebar";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: LayoutProps<"/">) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="pb-20 md:ml-64 md:pb-0">{children}</main>
    </div>
  );
}
