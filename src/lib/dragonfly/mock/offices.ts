import { OfficeDTO } from "../contracts";

// ============================================
// MOCK OFFICES
// ============================================

export const MOCK_OFFICES: OfficeDTO[] = [
  { id: "miami-001", name: "Miami", code: "MIA", is_active: true },
  { id: "orlando-001", name: "Orlando", code: "ORL", is_active: true },
  { id: "georgia-001", name: "Georgia", code: "GIA", is_active: true },
];

export function getOfficeById(id: string): OfficeDTO | undefined {
  return MOCK_OFFICES.find((o) => o.id === id);
}

export function getAllOffices(): OfficeDTO[] {
  return MOCK_OFFICES.filter((o) => o.is_active);
}
