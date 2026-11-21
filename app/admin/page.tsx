import { AdminApp } from "@/components/admin/AdminApp";
import { CmsAdminApp } from "@/components/admin/CmsAdminApp";

export default function AdminPage() {
  return process.env.NEXT_PUBLIC_YUMMY_API_URL ? <CmsAdminApp /> : <AdminApp />;
}
