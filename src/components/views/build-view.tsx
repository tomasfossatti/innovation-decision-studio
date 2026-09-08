"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  GitCompareArrows,
  LockKeyhole,
  Plus,
  Save,
  X,
} from "lucide-react";
import type { Alternative, Experiment, Requirement } from "@/domain/types";
import type { CaseStateApi } from "@/lib/use-case-state";
import type { Area } from "../studio";
import {
  BlockNotice,
  Empty,
  Pill,
  SectionHeading,
  StatusPill,
} from "../ui";

const blankAlternative: Omit<Alternative, "id"> = {
  name: "",
  mechanism: "",
  stakeholders: "",
  requirements: "",
  technology: "",
  cost: "Medium",
  risks: "",
  effects: "",
  tradeoffs: "",
  selectionCriteria: "",
};
const blankExperiment: Omit<Experiment, "id"> = {
  hypothesis: "",
  neededEvidence: "",
  cheapestMethod: "",
  successCriterion: "",
  design: "",
  conclusion: "",
  outcome: "Pending",
};

export function BuildView({
  api,
  navigate,
}: {
  api: CaseStateApi;
  navigate: (area: Area) => void;
}) {
  const [tab, setTab] = useState<
    "alternatives" | "requirements" | "experiments"
  >("alternatives");
  const [alternativeOpen, setAlternativeOpen] = useState(false);
  const [alternative, setAlternative] = useState(blankAlternative);
  const [requirement, setRequirement] = useState("");
  const [experiment, setExperiment] = useState(blankExperiment);
  const solutionUnlocked = api.state.completedGates.includes(2);
  const experimentUnlocked = api.state.completedGates.includes(4);

  const addAlternative = () => {
    api.update((current) => ({
      ...current,
      alternatives: [
        ...current.alternatives,
        {
          ...alternative,
          id: `ALT-${String(current.alternatives.length + 1).padStart(2, "0")}`,
        },
      ],
      risks: [
        ...current.risks,
        {
          id: `RISK-${String(current.risks.length + 1).padStart(2, "0")}`,
          text: alternative.risks,
          likelihood: "Medium",
          impact: "High",
          mitigation: "Validar el mecanismo antes de escalar el compromiso.",
        },
      ],
    }));
    setAlternative(blankAlternative);
    setAlternativeOpen(false);
  };

  const addRequirement = () => {
    if (!requirement.trim()) return;
    api.update((current) => ({
      ...current,
      requirements: [
        ...current.requirements,
        {
          id: `R-${String(current.requirements.length + 1).padStart(2, "0")}`,
          text: requirement,
          priority: "Must",
          sourceIds: current.opportunities[0]
            ? [current.opportunities[0].id]
            : [],
        },
      ],
    }));
    setRequirement("");
  };

  const addExperiment = () => {
    api.update((current) => ({
      ...current,
      experiments: [
        ...current.experiments,
        {
          ...experiment,
          id: `EXP-${String(current.experiments.length + 1).padStart(2, "0")}`,
        },
      ],
      hypotheses: [
        ...current.hypotheses,
        {
          id: `H-${String(current.hypotheses.length + 1).padStart(2, "0")}`,
          belief: experiment.hypothesis,
          expectedEvidence: experiment.neededEvidence,
          falsifier: experiment.successCriterion,
          uncertaintyId:
            current.uncertainties.find((item) => item.status === "Open")?.id ??
            "U-01",
        },
      ],
    }));
    setExperiment(blankExperiment);
  };

  return (
    <div className="page build-page">
      <SectionHeading
        eyebrow="LABORATORIO DE SOLUCIÓN Y EXPERIMENTOS"
        title="Construí sólo lo que exige la próxima decisión"
        action={
          solutionUnlocked ? (
            <button
              className="button-primary"
              onClick={() => setAlternativeOpen(true)}
            >
              <Plus size={16} /> Agregar alternativa
            </button>
          ) : undefined
        }
      />

      {!solutionUnlocked ? (
        <div className="locked-workspace">
          <div className="lock-visual">
            <LockKeyhole size={27} />
          </div>
          <span className="eyebrow">BLOQUEO DE DEPENDENCIA</span>
          <h1>Espacio de solución no disponible</h1>
          <p>
            Puede existir una solución posible, pero todavía no hay una
            oportunidad validada que demuestre que operaciones puede actuar
            sobre ella.
          </p>
          <div className="lock-question">
            <AlertTriangle size={19} />
            <div>
              <span>Incertidumbre crítica</span>
              <strong>
                ¿Puede operaciones ajustar la producción cuando cambia la
                demanda?
              </strong>
            </div>
          </div>
          <div className="lock-diagnostics">
            <div>
              <span>Flujo de desperdicio localizado</span>
              <strong>
                {api.state.completedActions.includes("ra-measure")
                  ? "Sí"
                  : "No"}
              </strong>
            </div>
            <div>
              <span>Problema reformulado</span>
              <strong>
                {api.state.problemVersions.length >= 2 ? "Sí" : "No"}
              </strong>
            </div>
            <div>
              <span>Flexibilidad operativa</span>
              <strong>
                {api.state.completedActions.includes("ra-flexibility")
                  ? "Investigada"
                  : "Desconocida"}
              </strong>
            </div>
            <div>
              <span>Oportunidad formulada</span>
              <strong>{api.state.opportunities.length ? "Sí" : "No"}</strong>
            </div>
          </div>
          <div className="lock-actions">
            <button className="button-primary" onClick={() => navigate("case")}>
              Investigar flexibilidad operativa <ArrowRight size={16} />
            </button>
            <button
              className="button-secondary"
              onClick={() => navigate("model")}
            >
              Volver al Modelo del Problema
            </button>
          </div>
          <small>
            Completá y defendé el gate de Evidencia y Oportunidad para
            desbloquear la arquitectura de solución.
          </small>
        </div>
      ) : (
        <>
          <div className="subtabs" role="tablist">
            <button
              className={tab === "alternatives" ? "active" : ""}
              onClick={() => setTab("alternatives")}
            >
              Alternativas <span>{api.state.alternatives.length}</span>
            </button>
            <button
              className={tab === "requirements" ? "active" : ""}
              onClick={() => setTab("requirements")}
            >
              Requisitos <span>{api.state.requirements.length}</span>
            </button>
            <button
              className={tab === "experiments" ? "active" : ""}
              onClick={() => setTab("experiments")}
            >
              Experimentos <span>{api.state.experiments.length}</span>
            </button>
          </div>

          {tab === "alternatives" && (
            <>
              <div className="alternative-guidance">
                <GitCompareArrows size={20} />
                <div>
                  <strong>Compará mecanismos, no variantes cosméticas</strong>
                  <p>
                    Tres versiones del mismo tablero de pronóstico no
                    constituyen tres alternativas.
                  </p>
                </div>
                <span>{api.state.alternatives.length}/3 mínimo</span>
              </div>
              {api.state.alternatives.length ? (
                <div className="alternative-grid">
                  {api.state.alternatives.map((item) => (
                    <article key={item.id}>
                      <div className="alt-head">
                        <span>{item.id}</span>
                        <StatusPill value={`${item.cost} cost`} />
                      </div>
                      <h3>{item.name}</h3>
                      <dl>
                        <div>
                          <dt>Mecanismo</dt>
                          <dd>{item.mechanism}</dd>
                        </div>
                        <div>
                          <dt>Partes interesadas</dt>
                          <dd>{item.stakeholders}</dd>
                        </div>
                        <div>
                          <dt>Efecto esperado</dt>
                          <dd>{item.effects}</dd>
                        </div>
                        <div>
                          <dt>Compensaciones</dt>
                          <dd>{item.tradeoffs}</dd>
                        </div>
                        <div>
                          <dt>Criterios de selección</dt>
                          <dd>{item.selectionCriteria}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              ) : (
                <Empty
                  title="Todavía no hay alternativas de solución"
                  text="La oportunidad está disponible. Creá tres mecanismos sustancialmente diferentes antes de seleccionar uno."
                />
              )}
            </>
          )}

          {tab === "requirements" && (
            <div className="requirements-layout">
              <section>
                <div className="inline-compose wide">
                  <input
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="Agregar un requisito derivado de evidencia o restricciones…"
                  />
                  <button className="button-primary" onClick={addRequirement}>
                    <Plus size={16} /> Agregar
                  </button>
                </div>
                <div className="requirement-list">
                  {api.state.requirements.map((item) => (
                    <article key={item.id}>
                      <span>{item.id}</span>
                      <p>{item.text}</p>
                      <select
                        value={item.priority}
                        onChange={(e) =>
                          api.update((current) => ({
                            ...current,
                            requirements: current.requirements.map((r) =>
                              r.id === item.id
                                ? {
                                    ...r,
                                    priority: e.target
                                      .value as Requirement["priority"],
                                  }
                                : r,
                            ),
                          }))
                        }
                      >
                        <option value="Must">Debe</option>
                        <option value="Should">Debería</option>
                        <option value="Could">Podría</option>
                      </select>
                      <small>
                        Fuente: {item.sourceIds.join(", ") || "Sin vincular"}
                      </small>
                    </article>
                  ))}
                </div>
              </section>
              <aside className="trace-chain">
                <span className="eyebrow">TRAZA UPSTREAM</span>
                <h3>Cada requisito necesita una razón</h3>
                <div>
                  <Pill tone="green">Problema</Pill>
                  <p>{api.state.problemVersions.at(-1)?.statement}</p>
                </div>
                <ArrowRight />
                <div>
                  <Pill tone="green">Oportunidad</Pill>
                  <p>{api.state.opportunities[0]?.statement}</p>
                </div>
                <ArrowRight />
                <div>
                  <Pill tone={api.state.requirements.length ? "green" : "red"}>
                    Requisito
                  </Pill>
                  <p>
                    {api.state.requirements.length
                      ? `${api.state.requirements.length} definidos`
                      : "Ninguno definido"}
                  </p>
                </div>
              </aside>
            </div>
          )}

          {tab === "experiments" &&
            (!experimentUnlocked ? (
              <BlockNotice title="El Constructor de Experimentos es una vista previa de una etapa futura">
                <p>
                  Un experimento se vuelve relevante para la decisión después de
                  que una solución supera la revisión de factibilidad y
                  viabilidad. Primero compará alternativas y tomá una decisión
                  de avance.
                </p>
                <button
                  className="button-secondary"
                  onClick={() => navigate("decisions")}
                >
                  Revisar gate actual <ArrowRight size={15} />
                </button>
              </BlockNotice>
            ) : (
              <div className="experiment-layout">
                <section className="experiment-builder">
                  <span className="eyebrow">
                    CONSTRUCTOR DE EXPERIMENTOS · EN ORDEN
                  </span>
                  <h2>Empezá por la creencia que podría cambiar la decisión</h2>
                  <label>
                    <span>1</span>¿Qué creencia, si fuera falsa, cambiaría
                    nuestra decisión?
                    <textarea
                      rows={2}
                      value={experiment.hypothesis}
                      onChange={(e) =>
                        setExperiment({
                          ...experiment,
                          hypothesis: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>2</span>¿Qué evidencia necesitamos observar?
                    <textarea
                      rows={2}
                      value={experiment.neededEvidence}
                      onChange={(e) =>
                        setExperiment({
                          ...experiment,
                          neededEvidence: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>3</span>¿Cuál es la forma menos costosa de obtenerla?
                    <textarea
                      rows={2}
                      value={experiment.cheapestMethod}
                      onChange={(e) =>
                        setExperiment({
                          ...experiment,
                          cheapestMethod: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>4</span>¿Qué criterio de éxito definimos antes del
                    resultado?
                    <textarea
                      rows={2}
                      value={experiment.successCriterion}
                      onChange={(e) =>
                        setExperiment({
                          ...experiment,
                          successCriterion: e.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>5</span>¿Qué experimento necesitamos?
                    <textarea
                      rows={2}
                      value={experiment.design}
                      onChange={(e) =>
                        setExperiment({ ...experiment, design: e.target.value })
                      }
                    />
                  </label>
                  <button
                    className="button-primary"
                    onClick={addExperiment}
                    disabled={Object.values(experiment)
                      .slice(0, 5)
                      .some((value) => !value)}
                  >
                    Guardar experimento
                  </button>
                </section>
                <aside className="experiment-list">
                  <span className="eyebrow">PACK DE VALIDACIÓN</span>
                  {api.state.experiments.length ? (
                    api.state.experiments.map((item) => (
                      <article key={item.id}>
                        <Pill tone="blue">{item.id}</Pill>
                        <strong>{item.hypothesis}</strong>
                        <p>Éxito: {item.successCriterion}</p>
                        <label>
                          ¿Qué permite concluir el resultado?
                          <textarea
                            rows={2}
                            value={item.conclusion}
                            onChange={(event) =>
                              api.update((current) => ({
                                ...current,
                                experiments: current.experiments.map(
                                  (experimentItem) =>
                                    experimentItem.id === item.id
                                      ? {
                                          ...experimentItem,
                                          conclusion: event.target.value,
                                        }
                                      : experimentItem,
                                ),
                              }))
                            }
                          />
                        </label>
                        <label>
                          Decisión posterior al resultado
                          <select
                            value={item.outcome}
                            onChange={(event) =>
                              api.update((current) => ({
                                ...current,
                                experiments: current.experiments.map(
                                  (experimentItem) =>
                                    experimentItem.id === item.id
                                      ? {
                                          ...experimentItem,
                                          outcome: event.target
                                            .value as Experiment["outcome"],
                                        }
                                      : experimentItem,
                                ),
                              }))
                            }
                          >
                            <option value="Pending">Pendiente</option>
                            <option value="Persevere">Perseverar</option>
                            <option value="Modify">Modificar</option>
                            <option value="Pivot">Pivotar</option>
                            <option value="Experiment again">
                              Experimentar nuevamente
                            </option>
                            <option value="Abandon">Abandonar</option>
                          </select>
                        </label>
                      </article>
                    ))
                  ) : (
                    <Empty
                      title="No hay experimentos registrados"
                      text="Registrá la lógica antes de observar cualquier resultado."
                    />
                  )}
                </aside>
              </div>
            ))}
        </>
      )}

      {alternativeOpen && (
        <div className="modal-backdrop">
          <div className="modal alternative-modal">
            <button
              className="icon-button modal-close"
              onClick={() => setAlternativeOpen(false)}
            >
              <X size={18} />
            </button>
            <span className="eyebrow">ARQUITECTURA DE ALTERNATIVAS</span>
            <h3>Agregar un mecanismo sustancialmente diferente</h3>
            <div className="form-grid">
              <label>
                Nombre
                <input
                  value={alternative.name}
                  onChange={(e) =>
                    setAlternative({ ...alternative, name: e.target.value })
                  }
                  placeholder="Ej.: protocolo de producción por lotes"
                />
              </label>
              <label>
                Costo
                <select
                  value={alternative.cost}
                  onChange={(e) =>
                    setAlternative({
                      ...alternative,
                      cost: e.target.value as Alternative["cost"],
                    })
                  }
                >
                  <option value="Low">Bajo</option>
                  <option value="Medium">Medio</option>
                  <option value="High">Alto</option>
                </select>
              </label>
            </div>
            <label>
              Mecanismo
              <textarea
                rows={2}
                value={alternative.mechanism}
                onChange={(e) =>
                  setAlternative({ ...alternative, mechanism: e.target.value })
                }
              />
            </label>
            <div className="form-grid">
              <label>
                Stakeholders afectados
                <input
                  value={alternative.stakeholders}
                  onChange={(e) =>
                    setAlternative({
                      ...alternative,
                      stakeholders: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Tecnología necesaria
                <input
                  value={alternative.technology}
                  onChange={(e) =>
                    setAlternative({
                      ...alternative,
                      technology: e.target.value,
                    })
                  }
                />
              </label>
            </div>
            <label>
              Requisitos
              <input
                value={alternative.requirements}
                onChange={(e) =>
                  setAlternative({
                    ...alternative,
                    requirements: e.target.value,
                  })
                }
              />
            </label>
            <div className="form-grid">
              <label>
                Efectos esperados
                <textarea
                  rows={2}
                  value={alternative.effects}
                  onChange={(e) =>
                    setAlternative({ ...alternative, effects: e.target.value })
                  }
                />
              </label>
              <label>
                Riesgos
                <textarea
                  rows={2}
                  value={alternative.risks}
                  onChange={(e) =>
                    setAlternative({ ...alternative, risks: e.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Compensaciones
              <textarea
                rows={2}
                value={alternative.tradeoffs}
                onChange={(e) =>
                  setAlternative({ ...alternative, tradeoffs: e.target.value })
                }
              />
            </label>
            <label>
              Criterios de selección
              <input
                value={alternative.selectionCriteria}
                onChange={(e) =>
                  setAlternative({
                    ...alternative,
                    selectionCriteria: e.target.value,
                  })
                }
                placeholder="¿Qué haría que esta alternativa fuera preferible a los demás mecanismos?"
              />
            </label>
            <button
              className="button-primary full"
              disabled={
                alternative.name.length < 4 ||
                alternative.mechanism.length < 12 ||
                alternative.effects.length < 8 ||
                alternative.tradeoffs.length < 8 ||
                alternative.selectionCriteria.length < 8
              }
              onClick={addAlternative}
            >
              <Save size={16} /> Guardar alternativa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
