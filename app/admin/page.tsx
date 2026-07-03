import { BuildingAdminSaasClient } from "@/components/BuildingAdminSaasClient";
import { getBuildings } from "@/lib/buildings";

export default function AdminPage() {
  return <BuildingAdminSaasClient initialBuildings={getBuildings()} />;
}
