"use client";

import { useState } from "react";
import {
  Archive,
  Beaker,
  Boxes,
  ChevronRight,
  FileStack,
  FlaskConical,
  Gauge,
  Menu,
  Network,
  RotateCcw,
  ScrollText,
  Search,
  X,
} from "lucide-react";
import { campusCase } from "@/domain/seed";
import { currentStage, evaluateGate } from "@/domain/engine";
import { useCaseState } from "@/lib/use-case-state";
import { DashboardView } from "./views/dashboard-view";
import { CaseView } from "./views/case-view";
import { EvidenceView } from "./views/evidence-view";
import { ModelView } from "./views/model-view";
import { BuildView } from "./views/build-view";
import { DecisionsView } from "./views/decisions-view";
import { DossierView } from "./views/dossier-view";

export type Area =
  | "dashboard"
  | "case"
  | "evidence"
  | "model"
  | "build"
  | "decisions"
  | "dossier";

const nav = [
  { id: "dashboard", label: "Resumen", icon: Gauge },
  { id: "case", label: "Caso", icon: Archive },
  { id: "evidence", label: "Evidencia", icon: Search },
  { id: "model", label: "Modelo", icon: Network },
  { id: "build", label: "Construir", icon: Beaker },
  { id: "decisions", label: "Decisiones", icon: ScrollText },
  { id: "dossier", label: "Dossier", icon: FileStack },
] as const;

const areaMeta: Record<Area, { eyebrow: string; title: string }> = {
  dashboard: {
    eyebrow: "Sala de control de la iniciativa",
    title: "Panorama de decisión",
  },
  case: {
    eyebrow: "Mundo del caso",
    title: "Laboratorio de Alimentación del Campus",
  },
  evidence: {
    eyebrow: "Espacio de decisión",
    title: "Biblioteca de evidencia",
  },
  model: { eyebrow: "Espacio de decisión", title: "Modelo del problema" },
  build: {
    eyebrow: "Espacio de decisión",
    title: "Laboratorio de solución y experimentos",
  },
  decisions: {
    eyebrow: "Motor de decisiones",
    title: "Gates y registro de decisiones",
  },
  dossier: {
    eyebrow: "Artefacto vivo",
    title: "Dossier de decisión de innovación",
  },
};

export function Studio() {
  const api = useCaseState();
  const [area, setArea] = useState<Area>(() => {
    if (typeof window === "undefined") return "dashboard";
    const fromHash = window.location.hash.replace("#", "") as Area;
    return nav.some((item) => item.id === fromHash) ? fromHash : "dashboard";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const stage = currentStage(api.state);
  const gate = evaluateGate(api.state, stage);

  const navigate = (next: Area) => {
    setArea(next);
    window.history.replaceState(null, "", `#${next}`);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!api.hydrated)
    return (
      <div className="loading-screen">
        <FlaskConical className="spin" />
        <span>Cargando el modelo del caso…</span>
      </div>
    );

  return (
    <div className="studio-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Boxes size={20} />
          </div>
          <div>
            <strong>Innovation</strong>
            <span>Estudio de Decisiones</span>
          </div>
          <button
            className="icon-button mobile-only"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar navegación"
          >
            <X size={19} />
          </button>
        </div>
        <div className="case-switcher">
          <span>CASO ACTIVO · 01</span>
          <strong>{campusCase.name}</strong>
          <small>{campusCase.organization}</small>
        </div>
        <nav aria-label="Navegación principal">
          {nav.map((item) => (
            <button
              key={item.id}
              className={area === item.id ? "active" : ""}
              onClick={() => navigate(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.id === "build" && stage < 3 ? (
                <span className="nav-lock">Bloqueado</span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="capacity">
            <span>Capacidad de investigación</span>
            <strong>{api.state.researchCapacity} acciones disponibles</strong>
            <div className="capacity-bars">
              {[1, 2, 3, 4].map((n) => (
                <i
                  key={n}
                  className={n <= api.state.researchCapacity ? "filled" : ""}
                />
              ))}
            </div>
          </div>
          <button className="reset-link" onClick={() => setResetConfirm(true)}>
            <RotateCcw size={15} /> Reiniciar caso
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="sidebar-scrim"
          aria-label="Cerrar navegación"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main">
        <header className="topbar">
          <button
            className="icon-button mobile-only"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir navegación"
          >
            <Menu size={20} />
          </button>
          <div className="topbar-title">
            <span>{areaMeta[area].eyebrow}</span>
            <strong>{areaMeta[area].title}</strong>
          </div>
          <div className="topbar-context">
            <span>ETAPA {stage} DE 7</span>
            <strong>{campusCase.stages[stage - 1].short}</strong>
            <ChevronRight size={15} />
            <span
              className={`readiness-dot readiness-${gate.readiness.toLowerCase()}`}
            />
            {gate.readiness === "Insufficient"
              ? "Insuficiente"
              : gate.readiness === "Fragile"
                ? "Frágil"
                : gate.readiness === "Defensible"
                  ? "Defendible"
                  : "Robusta"}
          </div>
        </header>

        {area === "dashboard" && (
          <DashboardView api={api} navigate={navigate} />
        )}
        {area === "case" && <CaseView api={api} navigate={navigate} />}
        {area === "evidence" && <EvidenceView api={api} navigate={navigate} />}
        {area === "model" && <ModelView api={api} navigate={navigate} />}
        {area === "build" && <BuildView api={api} navigate={navigate} />}
        {area === "decisions" && (
          <DecisionsView api={api} navigate={navigate} />
        )}
        {area === "dossier" && <DossierView api={api} />}
      </main>

      {resetConfirm && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true">
            <h3>¿Reiniciar el Laboratorio de Alimentación del Campus?</h3>
            <p>
              Esto elimina de este navegador tu investigación, modelos,
              decisiones y progreso en los gates.
            </p>
            <div className="modal-actions">
              <button
                className="button-secondary"
                onClick={() => setResetConfirm(false)}
              >
                Cancelar
              </button>
              <button
                className="button-danger"
                onClick={() => {
                  api.reset();
                  setResetConfirm(false);
                  navigate("dashboard");
                }}
              >
                Reiniciar caso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
