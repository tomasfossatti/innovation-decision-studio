"use client";

import Image from "next/image";
import {
  ArrowRight,
  CircleAlert,
  ClipboardCheck,
  CornerDownRight,
  Database,
  FlaskConical,
  Gauge,
  Target,
} from "lucide-react";
import { campusCase } from "@/domain/seed";
import {
  availableEvidence,
  currentStage,
  evaluateGate,
  evidenceHealth,
  getCurrentDecision,
  stageAccess,
} from "@/domain/engine";
import type { CaseStateApi } from "@/lib/use-case-state";
import type { Area } from "../studio";
import { Meter, statusLabel, StatusPill } from "../ui";

export function DashboardView({
  api,
  navigate,
}: {
  api: CaseStateApi;
  navigate: (area: Area) => void;
}) {
  const { state } = api;
  const stage = currentStage(state);
  const gate = evaluateGate(state, stage);
  const evidence = availableEvidence(state);
  const health = evidenceHealth(state);
  const critical = state.uncertainties.filter(
    (u) => u.status === "Open" && ["High", "Critical"].includes(u.criticality),
  );

  return (
    <div className="page dashboard-page">
      <section className="case-hero">
        <Image
          src={campusCase.image}
          alt="Cocina del comedor del campus Northbridge durante la preparación del servicio"
          fill
          priority
          sizes="(max-width: 900px) 100vw, 75vw"
        />
        <div className="case-hero-overlay" />
        <div className="case-hero-content">
          <span>CASO 01 · NORTHBRIDGE INSTITUTE</span>
          <h1>{campusCase.name}</h1>
          <p>{campusCase.brief}</p>
          <button onClick={() => navigate("case")} className="button-light">
            Entrar al mundo del caso <ArrowRight size={16} />
          </button>
        </div>
        <div className="case-hero-request">
          <span>Solicitud del patrocinador</span>
          <strong>{campusCase.sponsorRequest}</strong>
        </div>
      </section>

      <section className="metric-grid">
        <article className="metric-card emphasis">
          <div className="metric-icon">
            <Gauge size={19} />
          </div>
          <span>Preparación de la decisión</span>
          <strong>{statusLabel(gate.readiness)}</strong>
          <Meter value={gate.score} />
          <small>
            {gate.score}/100 · preparación para el gate de la etapa {stage}
          </small>
        </article>
        <article className="metric-card">
          <div className="metric-icon">
            <CircleAlert size={19} />
          </div>
          <span>Incertidumbres críticas</span>
          <strong>{critical.length} abiertas</strong>
          <small>
            {critical[0]?.description ??
              "No hay incertidumbres críticas abiertas en este momento."}
          </small>
        </article>
        <article className="metric-card">
          <div className="metric-icon">
            <Database size={19} />
          </div>
          <span>Salud de la evidencia</span>
          <strong>{health}%</strong>
          <Meter value={health} />
          <small>
            {evidence.length} de {campusCase.evidence.length} tarjetas de
            evidencia disponibles
          </small>
        </article>
        <article className="metric-card">
          <div className="metric-icon">
            <ClipboardCheck size={19} />
          </div>
          <span>Trazabilidad</span>
          <strong>{state.decisions.length} decisiones</strong>
          <small>
            {state.claims.reduce((n, c) => n + c.evidenceIds.length, 0)}{" "}
            vínculos afirmación ↔ evidencia registrados
          </small>
        </article>
      </section>

      <section className="decision-focus">
        <div className="focus-main">
          <span className="eyebrow">DECISIÓN ACTUAL</span>
          <h2>{getCurrentDecision(state)}</h2>
          <p>
            Tu próxima decisión debe separar lo que demuestra la evidencia del
            mecanismo que actualmente sospechás.
          </p>
          <button
            className="button-primary"
            onClick={() =>
              navigate(
                gate.nextAction.toLowerCase().includes("solicitar") ||
                  gate.nextAction.toLowerCase().includes("investigar")
                  ? "case"
                  : "model",
              )
            }
          >
            {gate.nextAction} <ArrowRight size={16} />
          </button>
        </div>
        <div className="focus-diagnostic">
          <span className="eyebrow">DIAGNÓSTICO DEL MOTOR</span>
          {gate.blocks.slice(0, 2).map((block) => (
            <div className="diagnostic-row" key={block}>
              <span className="diag-icon block">
                <CornerDownRight size={15} />
              </span>
              <div>
                <strong>Bloqueo de dependencia</strong>
                <p>{block}</p>
              </div>
            </div>
          ))}
          {gate.challenges.slice(0, 2).map((challenge) => (
            <div className="diagnostic-row" key={challenge}>
              <span className="diag-icon challenge">
                <FlaskConical size={15} />
              </span>
              <div>
                <strong>Desafío</strong>
                <p>{challenge}</p>
              </div>
            </div>
          ))}
          {!gate.blocks.length && (
            <div className="diagnostic-row">
              <span className="diag-icon ready">
                <Target size={15} />
              </span>
              <div>
                <strong>El gate puede defenderse</strong>
                <p>Revisá tu razonamiento en Decisiones antes de avanzar.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="stage-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">RECORRIDO DE LA INICIATIVA</span>
            <h2>Siete etapas de decisión</h2>
          </div>
          <span className="quiet">
            El progreso depende de decisiones defendidas, no de visitas a
            pantallas.
          </span>
        </div>
        <div className="stage-track">
          {campusCase.stages.map((item) => {
            const access = stageAccess(state, item.id);
            return (
              <button
                key={item.id}
                className={`stage-node ${access === "Working" ? "current" : ""}`}
                onClick={() =>
                  navigate(
                    item.id <= 2
                      ? item.id === 1
                        ? "model"
                        : "evidence"
                      : "build",
                  )
                }
              >
                <span className="stage-number">
                  {String(item.id).padStart(2, "0")}
                </span>
                <div>
                  <strong>{item.short}</strong>
                  <small>{item.title}</small>
                </div>
                <StatusPill value={access} />
              </button>
            );
          })}
        </div>
      </section>

      <section className="truth-grid">
        <article>
          <span className="truth-label known">Qué sabemos</span>
          <strong>
            {
              state.claims.filter((c) => c.status === "Known" && c.active)
                .length
            }{" "}
            afirmaciones respaldadas por evidencia
          </strong>
          <p>
            {state.claims.find((c) => c.status === "Known" && c.active)?.text}
          </p>
        </article>
        <article>
          <span className="truth-label assumed">Qué creemos</span>
          <strong>
            {state.assumptions.filter((a) => a.status === "Active").length}{" "}
            supuestos activos
          </strong>
          <p>
            {state.assumptions.find((a) => a.status === "Active")?.text ??
              "No quedan supuestos iniciales activos."}
          </p>
        </article>
        <article>
          <span className="truth-label unknown">Qué todavía no sabemos</span>
          <strong>
            {state.uncertainties.filter((u) => u.status === "Open").length}{" "}
            incertidumbres abiertas
          </strong>
          <p>
            {state.uncertainties.find((u) => u.status === "Open")?.description}
          </p>
        </article>
        <article>
          <span className="truth-label decision">
            Qué decisión habilita la evidencia
          </span>
          <strong>
            <StatusPill value={gate.readiness} />
          </strong>
          <p>
            {gate.readiness === "Defensible" || gate.readiness === "Robust"
              ? "El gate actual puede argumentarse y revisarse."
              : "Hace falta más trabajo antes del próximo compromiso."}
          </p>
        </article>
      </section>
    </div>
  );
}
