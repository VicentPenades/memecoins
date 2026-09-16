export interface StatusBadge {
  text: string;
  color: string;
  bg: string;
}

export interface NodeDatum {
  id: string;
  side: "root" | "buy" | "sell" | "transfer-in" | "transfer-out";
  label: string;
  subLabel: string;
  date: string;
  tooltip: string;
  isTraceable: boolean;
  isLoadingTrace: boolean;
  hasHiddenChildren: boolean;
  statusBadges: StatusBadge[];
  children?: NodeDatum[];
}
