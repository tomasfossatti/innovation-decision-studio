import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, LockKeyhole } from "lucide-react";
import type {
  Criticality,
  EpistemicStatus,
  Quality,
  Readiness,
} from "@/domain/types";

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "blue";
}) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function StatusPill({
  value,
}: {
  value: EpistemicStatus | Quality | Readiness | Criticality | string;
}) {
  const tone = [
    "Known",
    "High",
    "Robust",
    "Defensible",
    "Resolved",
    "Working",
  ].includes(value)
    ? "green"
    : ["Inferred", "Medium", "Fragile", "Preview"].includes(value)
      ? "amber"
      : [
            "Assumed",
            "Low",
            "Insufficient",
            "Critical",
            "Not decision-ready",
          ].includes(value)
        ? "red"
        : "neutral";
  return <Pill tone={tone}>{statusLabel(value)}</Pill>;
}

const statusLabels: Record<string, string> = {
  Known: "Conocido",
  Inferred: "Inferido",
  Assumed: "Supuesto",
  Low: "Baja",
  Medium: "Media",
  High: "Alta",
  Critical: "Crítica",
  Insufficient: "Insuficiente",
  Fragile: "Frágil",
  Defensible: "Defendible",
  Robust: "Robusta",
  Working: "En curso",
  Preview: "Vista previa",
  "Not decision-ready": "Sin preparación decisoria",
  Open: "Abierta",
  Answered: "Respondida",
  Investigating: "En investigación",
  Resolved: "Resuelta",
  "Accepted risk": "Riesgo aceptado",
  Active: "Activa",
  Challenged: "Cuestionada",
  Rejected: "Rechazada",
  Maintained: "Mantenida",
  Modified: "Modificada",
  Reverted: "Revertida",
  Completed: "Completada",
  Pending: "Pendiente",
  Persevere: "Perseverar",
  Modify: "Modificar",
  Pivot: "Pivotar",
  "Experiment again": "Experimentar nuevamente",
  Abandon: "Abandonar",
  "Low cost": "Costo bajo",
  "Medium cost": "Costo medio",
  "High cost": "Costo alto",
  "People / problem": "Personas / problema",
  Technical: "Técnica",
  Business: "Negocio",
  Operational: "Operación",
  Regulatory: "Regulación",
  Impact: "Impacto",
  Operations: "Operación",
};

export function statusLabel(value: string) {
  return statusLabels[value] ?? value;
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <div className="empty-mark">·</div>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

export function BlockNotice({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="notice notice-block">
      <LockKeyhole size={18} />
      <div>
        <strong>{title}</strong>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function AlertNotice({
  title,
  children,
  success = false,
}: {
  title: string;
  children: ReactNode;
  success?: boolean;
}) {
  const Icon = success ? CheckCircle2 : AlertTriangle;
  return (
    <div className={`notice ${success ? "notice-success" : "notice-alert"}`}>
      <Icon size={18} />
      <div>
        <strong>{title}</strong>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function Meter({ value, label }: { value: number; label?: string }) {
  return (
    <div className="meter" aria-label={`${label ?? "Puntaje"}: ${value}%`}>
      <span style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}
