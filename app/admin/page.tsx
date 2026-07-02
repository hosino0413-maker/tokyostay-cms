import { AdminClient } from "@/components/AdminClient";
import { getProperties } from "@/lib/properties";

export default function AdminPage() {
  return <AdminClient initialProperties={getProperties()} />;
}
