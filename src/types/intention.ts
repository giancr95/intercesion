export interface Intention {
  id: string;
  user_id: string;
  raw_text: string;
  status: "Sown" | "In Cultivation" | "Harvested";
  is_public: boolean;
  category: string | null;
  intercesor: string | null;
  candle_mode: boolean;
  created_at: string;
}

export const STATUS_LIST: Intention["status"][] = [
  "Sown",
  "In Cultivation",
  "Harvested",
];

export const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  Sown: { label: "Sembrada", color: "#4a7c59", bgColor: "#e8f0e3" },
  "In Cultivation": {
    label: "En Cultivo",
    color: "#8b6f1e",
    bgColor: "#fef3c7",
  },
  Harvested: {
    label: "Cosechada",
    color: "#166534",
    bgColor: "#dcfce7",
  },
};

const categoryColors: Record<string, string> = {
  Salud: "#d946a0",
  Familia: "#ea7e30",
  Unión: "#7c5cbf",
  Vocación: "#0e87c9",
  General: "#5f7282",
};

const EXTRA_COLORS = [
  "#c2410c",
  "#a855f7",
  "#0891b2",
  "#65a30d",
  "#e11d48",
  "#6366f1",
];

export function getCategoryColor(cat: string): string {
  if (categoryColors[cat]) return categoryColors[cat];
  let hash = 0;
  for (let i = 0; i < cat.length; i++)
    hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  return EXTRA_COLORS[Math.abs(hash) % EXTRA_COLORS.length];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
