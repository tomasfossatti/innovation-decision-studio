"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  CornerDownRight,
  FileCheck2,
  GitPullRequestArrow,
  Plus,
  RefreshCcw,
  ShieldAlert,
  X,
} from "lucide-react";
import {
  availableEvidence,
  currentStage,
  evaluateGate,
  stageAccess,
} from "@/domain/engine";
import { campusCase } from "@/domain/seed";
import type { Decision, DecisionStatus } from "@/domain/types";
import type { CaseStateApi } from "@/lib/use-case-state";
import type { Area } from "../studio";
import {
  AlertNotice,
  Empty,
  Meter,
  SectionHeading,
  statusLabel,
  StatusPill,
} from "../ui";

const blankDecision = {
  title: "",
  context: "",
  alternatives: "",
  risks: "",
  rationale: "",
  reviewCondition: "",
  evidenceIds: [] as string[],
  assumptionIds: [] as string[],
};

export function DecisionsView({
  api,
}: {
  api: CaseStateApi;
  navigate: (area: Area) => void;
}) {
  const [tab, setTab] = useState<"gate" | "log">("gate");
  const [gateForm, setGateForm] = useState({
    decision: "",
    discarded: "",
    remaining: "",
    changeMind: "",
    rationale: "",
  });
  const [manualOpen, setManualOpen] = useState(false);
  const [decision, setDecision] = useState(blankDecision);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [reviewerText, setReviewerText] = useState("");
  const [reviewerLoading, setReviewerLoading] = useState(false);
  const [acceptedRiskReason, setAcceptedRiskReason] = useState("");
  const stage = currentStage(api.state);
  const gate = evaluateGate(api.state, stage);
  const evidence = availableEvidence(api.state);

  const canPass =
    ["Defensible", "Robust"].includes(gate.readiness) &&
    Object.values(gateForm).every((value) => value.trim().length >= 8);

  const passGate = () => {
    const gateDecision: Decision = {
      id: `D-${String(api.state.decisions.length + 1).padStart(2, "0")}`,
      title: gateForm.decision,
      date: new Date().toISOString().slice(0, 10),
      context: `Gate de la etapa ${stage}: ${campusCase.stages[stage - 1].title}`,
      alternatives: gateForm.discarded,
      evidenceIds: evidence.slice(-5).map((item) => item.id),
      assumptionIds: api.state.assumptions
        .filter((item) => item.status === "Active")
        .map((item) => item.id),
      risks: gateForm.remaining,
      rationale: gateForm.rationale,
      reviewCondition: gateForm.changeMind,
      status: "Active",
      affectedBy: [],
    };
    api.update((current) => ({
      ...current,
      decisions: [...current.decisions, gateDecision],
      completedGates: [...new Set([...current.completedGates, stage])],
      researchCapacity:
        stage === 1
          ? Math.max(current.researchCapacity, 2)
          : current.researchCapacity,
    }));
    setGateForm({
      decision: "",
      discarded: "",
      remaining: "",
      changeMind: "",
      rationale: "",
    });
  };

  const addManualDecision = () => {
    const item: Decision = {
      ...decision,
      id: `D-${String(api.state.decisions.length + 1).padStart(2, "0")}`,
      date: new Date().toISOString().slice(0, 10),
      status: "Active",
      affectedBy: [],
    };
    api.update((current) => ({
      ...current,
      decisions: [...current.decisions, item],
    }));
    setDecision(blankDecision);
    setManualOpen(false);
  };

  const decisionImpacts = (item: Decision) =>
    evidence.filter(
      (ev) =>
        ev.contradicts.some((id) => item.assumptionIds.includes(id)) &&
        !item.evidenceIds.includes(ev.id),
    );

  const stressTest = async () => {
    setReviewerLoading(true);
    try {
      const response = await fetch("/api/reviewer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          problem: api.state.problemVersions.at(-1)?.statement,
          decision: gateForm.decision,
          evidence: evidence.map((item) => item.id),
          uncertainty:
            gateForm.remaining ||
            api.state.uncertainties.find((item) => item.status === "Open")
              ?.description,
        }),
      });
      const result = (await response.json()) as { text: string };
      setReviewerText(result.text);
    } catch {
      setReviewerText(
        "¿Qué evidencia haría fallar tu explicación causal actual?",
      );
    } finally {
      setReviewerLoading(false);
    }
  };

  return (
    <div className="page decisions-page">
      <SectionHeading
        eyebrow="MOTOR DE DECISIONES"
        title="Los compromisos deben hacer visible su razonamiento"
        action={
          <button
            className="button-primary"
            onClick={() => setManualOpen(true)}
          >
            <Plus size={16} /> Registrar decisión
          </button>
        }
      />
      <div className="subtabs" role="tablist">
        <button
          className={tab === "gate" ? "active" : ""}
          onClick={() => setTab("gate")}
        >
          Gate actual
        </button>
        <button
          className={tab === "log" ? "active" : ""}
          onClick={() => setTab("log")}
        >
          Registro de decisiones <span>{api.state.decisions.length}</span>
        </button>
      </div>

      {tab === "gate" && (
        <div className="gate-layout">
          <section className="gate-review">
            <div className="gate-heading">
              <div>
                <span className="eyebrow">GATE DE LA ETAPA {stage}</span>
                <h2>{campusCase.stages[stage - 1].title}</h2>
                <p>{campusCase.stages[stage - 1].decision}</p>
              </div>
              <div className="gate-score">
                <StatusPill value={gate.readiness} />
                <strong>{gate.score}</strong>
                <span>/100</span>
              </div>
            </div>
            <Meter value={gate.score} label="Preparación del gate" />
            <div className="reviewer-box">
              <div>
                <span className="eyebrow">REVISOR ADVERSARIAL</span>
                <strong>Va a cuestionar tu lógica, no a elegir por vos.</strong>
              </div>
              <button
                className="button-secondary"
                onClick={stressTest}
                disabled={reviewerLoading}
              >
                {reviewerLoading
                  ? "Revisando…"
                  : "Poner a prueba el razonamiento"}
              </button>
              {reviewerText && <p>“{reviewerText}”</p>}
            </div>
            <div className="engine-responses">
              {gate.blocks.map((item) => (
                <article className="engine-block" key={item}>
                  <span>
                    <CornerDownRight size={16} />
                  </span>
                  <div>
                    <strong>Bloqueo de dependencia</strong>
                    <p>{item}</p>
                  </div>
                  {stage === 4 && (
                    <div className="risk-acceptance">
                      <span className="eyebrow">AVANZAR CON INCERTIDUMBRE</span>
                      <label>
                        Acepto este riesgo porque…
                        <textarea
                          rows={2}
                          value={acceptedRiskReason}
                          onChange={(event) =>
                            setAcceptedRiskReason(event.target.value)
                          }
                          placeholder="Explicá por qué avanzar es preferible a obtener más evidencia ahora."
                        />
                      </label>
                      <button
                        className="button-secondary"
                        disabled={acceptedRiskReason.trim().length < 20}
                        onClick={() => {
                          api.update((current) => ({
                            ...current,
                            acceptedRisks: [
                              ...current.acceptedRisks,
                              acceptedRiskReason.trim(),
                            ],
                          }));
                          setAcceptedRiskReason("");
                        }}
                      >
                        Aceptar riesgo explícitamente
                      </button>
                      {api.state.acceptedRisks.map((reason, index) => (
                        <p key={`${reason}-${index}`}>Aceptado: {reason}</p>
                      ))}
                    </div>
                  )}
                </article>
              ))}
              {gate.challenges.map((item) => (
                <article className="engine-challenge" key={item}>
                  <span>
                    <ShieldAlert size={16} />
                  </span>
                  <div>
                    <strong>Desafío</strong>
                    <p>{item}</p>
                  </div>
                </article>
              ))}
              {gate.consequences.map((item) => (
                <article className="engine-consequence" key={item}>
                  <span>
                    <GitPullRequestArrow size={16} />
                  </span>
                  <div>
                    <strong>Consecuencia</strong>
                    <p>{item}</p>
                  </div>
                </article>
              ))}
            </div>
            {api.state.completedGates.includes(stage) ? (
              <AlertNotice title="Gate completado" success>
                Tu decisión quedó en el registro y la próxima etapa está
                disponible.
              </AlertNotice>
            ) : (
              <div className="gate-form">
                <label>
                  ¿Qué decisión estás tomando?
                  <textarea
                    rows={2}
                    value={gateForm.decision}
                    onChange={(e) =>
                      setGateForm({ ...gateForm, decision: e.target.value })
                    }
                    placeholder="Enunciá el compromiso, no un tema…"
                  />
                </label>
                <label>
                  ¿Qué alternativas descartaste?
                  <textarea
                    rows={2}
                    value={gateForm.discarded}
                    onChange={(e) =>
                      setGateForm({ ...gateForm, discarded: e.target.value })
                    }
                  />
                </label>
                <label>
                  ¿Qué incertidumbre permanece?
                  <textarea
                    rows={2}
                    value={gateForm.remaining}
                    onChange={(e) =>
                      setGateForm({ ...gateForm, remaining: e.target.value })
                    }
                  />
                </label>
                <label>
                  ¿Qué podría hacerte cambiar de opinión?
                  <textarea
                    rows={2}
                    value={gateForm.changeMind}
                    onChange={(e) =>
                      setGateForm({ ...gateForm, changeMind: e.target.value })
                    }
                  />
                </label>
                <label>
                  ¿Por qué la evidencia es suficiente ahora?
                  <textarea
                    rows={3}
                    value={gateForm.rationale}
                    onChange={(e) =>
                      setGateForm({ ...gateForm, rationale: e.target.value })
                    }
                  />
                </label>
                <button
                  className="button-primary full"
                  disabled={!canPass}
                  onClick={passGate}
                >
                  <FileCheck2 size={16} /> Defender decisión y avanzar
                </button>
                {!["Defensible", "Robust"].includes(gate.readiness) && (
                  <small className="form-hint">
                    Resolvé los bloqueos de dependencia antes de que el motor
                    pueda aceptar este gate.
                  </small>
                )}
              </div>
            )}
          </section>
          <aside className="stage-rail">
            <span className="eyebrow">SECUENCIA DE GATES</span>
            {campusCase.stages.map((item) => {
              const access = stageAccess(api.state, item.id);
              const done = api.state.completedGates.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={item.id === stage ? "active" : ""}
                >
                  <span className="rail-number">
                    {done ? <Check size={14} /> : item.id}
                  </span>
                  <div>
                    <strong>{item.short}</strong>
                    <small>
                      {done ? "Decisión registrada" : statusLabel(access)}
                    </small>
                  </div>
                  <StatusPill value={done ? "Completed" : access} />
                </div>
              );
            })}
          </aside>
        </div>
      )}

      {tab === "log" && (
        <div className="decision-log">
          {api.state.decisions.length ? (
            api.state.decisions.map((item) => {
              const impacts = decisionImpacts(item);
              return (
                <article
                  key={item.id}
                  className={impacts.length ? "has-impact" : ""}
                >
                  <div className="decision-index">
                    <span>{item.id}</span>
                    <i />
                  </div>
                  <div className="decision-card">
                    <div className="decision-card-head">
                      <div>
                        <span>
                          {item.date} · {item.context}
                        </span>
                        <h3>{item.title}</h3>
                      </div>
                      <StatusPill value={item.status} />
                    </div>
                    {impacts.length > 0 && (
                      <div className="decision-impact">
                        <AlertTriangle size={17} />
                        <div>
                          <strong>
                            {impacts.map((e) => e.id).join(", ")} afecta{" "}
                            {item.id}
                          </strong>
                          <p>
                            Nueva evidencia cuestiona un supuesto utilizado por
                            esta decisión.
                          </p>
                        </div>
                        <button onClick={() => setReviewing(item.id)}>
                          Revisar
                        </button>
                      </div>
                    )}
                    <div className="decision-details">
                      <div>
                        <span>Motivo</span>
                        <p>{item.rationale}</p>
                      </div>
                      <div>
                        <span>Evidencia</span>
                        <p>
                          {item.evidenceIds.join(", ") ||
                            "Sin evidencia vinculada"}
                        </p>
                      </div>
                      <div>
                        <span>Alternativas consideradas</span>
                        <p>{item.alternatives}</p>
                      </div>
                      <div>
                        <span>Condición de revisión</span>
                        <p>{item.reviewCondition}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <Empty
              title="No hay decisiones registradas"
              text="Interpretá evidencia contradictoria o registrá una decisión de gate para iniciar el log."
            />
          )}
        </div>
      )}

      {manualOpen && (
        <div className="modal-backdrop">
          <div className="modal decision-modal">
            <button
              className="icon-button modal-close"
              onClick={() => setManualOpen(false)}
            >
              <X size={18} />
            </button>
            <span className="eyebrow">REGISTRO DE DECISIONES</span>
            <h3>Registrar una decisión</h3>
            <label>
              Decisión
              <input
                value={decision.title}
                onChange={(e) =>
                  setDecision({ ...decision, title: e.target.value })
                }
              />
            </label>
            <label>
              Contexto
              <textarea
                rows={2}
                value={decision.context}
                onChange={(e) =>
                  setDecision({ ...decision, context: e.target.value })
                }
              />
            </label>
            <label>
              Alternativas consideradas
              <textarea
                rows={2}
                value={decision.alternatives}
                onChange={(e) =>
                  setDecision({ ...decision, alternatives: e.target.value })
                }
              />
            </label>
            <fieldset>
              <legend>Evidencia utilizada</legend>
              <div className="citation-picker">
                {evidence.map((item) => (
                  <label key={item.id}>
                    <input
                      type="checkbox"
                      checked={decision.evidenceIds.includes(item.id)}
                      onChange={() =>
                        setDecision({
                          ...decision,
                          evidenceIds: decision.evidenceIds.includes(item.id)
                            ? decision.evidenceIds.filter(
                                (id) => id !== item.id,
                              )
                            : [...decision.evidenceIds, item.id],
                        })
                      }
                    />
                    <span>{item.id}</span>
                    {item.title}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Supuestos mantenidos</legend>
              <div className="check-grid">
                {api.state.assumptions
                  .filter((item) => item.status === "Active")
                  .map((item) => (
                    <label key={item.id}>
                      <input
                        type="checkbox"
                        checked={decision.assumptionIds.includes(item.id)}
                        onChange={() =>
                          setDecision({
                            ...decision,
                            assumptionIds: decision.assumptionIds.includes(
                              item.id,
                            )
                              ? decision.assumptionIds.filter(
                                  (id) => id !== item.id,
                                )
                              : [...decision.assumptionIds, item.id],
                          })
                        }
                      />
                      {item.id} · {item.text}
                    </label>
                  ))}
              </div>
            </fieldset>
            <label>
              Riesgos
              <textarea
                rows={2}
                value={decision.risks}
                onChange={(e) =>
                  setDecision({ ...decision, risks: e.target.value })
                }
              />
            </label>
            <label>
              Motivo
              <textarea
                rows={3}
                value={decision.rationale}
                onChange={(e) =>
                  setDecision({ ...decision, rationale: e.target.value })
                }
              />
            </label>
            <label>
              Condición de revisión
              <textarea
                rows={2}
                value={decision.reviewCondition}
                onChange={(e) =>
                  setDecision({ ...decision, reviewCondition: e.target.value })
                }
              />
            </label>
            <button
              className="button-primary full"
              disabled={
                decision.title.length < 8 ||
                decision.rationale.length < 12 ||
                !decision.evidenceIds.length
              }
              onClick={addManualDecision}
            >
              Registrar decisión
            </button>
          </div>
        </div>
      )}

      {reviewing && (
        <div className="modal-backdrop">
          <div className="modal">
            <button
              className="icon-button modal-close"
              onClick={() => setReviewing(null)}
            >
              <X size={18} />
            </button>
            <span className="eyebrow">REVISIÓN DE DECISIÓN</span>
            <h3>{reviewing} está afectada por nueva evidencia</h3>
            <p>
              Elegí explícitamente qué hacer. La decisión anterior permanece en
              el historial de auditoría.
            </p>
            <div className="review-actions">
              {(["Maintained", "Modified", "Reverted"] as DecisionStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => {
                      api.update((current) => ({
                        ...current,
                        decisions: current.decisions.map((d) =>
                          d.id === reviewing
                            ? {
                                ...d,
                                status,
                                affectedBy: [
                                  ...new Set([
                                    ...d.affectedBy,
                                    ...decisionImpacts(d).map((e) => e.id),
                                  ]),
                                ],
                              }
                            : d,
                        ),
                      }));
                      setReviewing(null);
                    }}
                  >
                    <RefreshCcw size={17} />
                    <strong>{statusLabel(status)}</strong>
                    <span>
                      {status === "Maintained"
                        ? "La evidencia no supera el umbral de revisión."
                        : status === "Modified"
                          ? "Mantener la dirección, cambiando alcance o motivo."
                          : "Retirar el compromiso y reabrir la decisión."}
                    </span>
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
