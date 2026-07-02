import { BuildingAdminClient } from "@/components/BuildingAdminClient";
import { getBuildings } from "@/lib/buildings";

export default function AdminPage() {
  return <BuildingAdminClient initialBuildings={getBuildings()} />;
}
