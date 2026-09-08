"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Link2,
  Plus,
  Save,
  X,
} from "lucide-react";
import { availableEvidence } from "@/domain/engine";
import type { Criticality, Uncertainty } from "@/domain/types";
import type { CaseStateApi } from "@/lib/use-case-state";
import type { Area } from "../studio";
import {
  AlertNotice,
  BlockNotice,
  Pill,
  SectionHeading,
  statusLabel,
  StatusPill,
} from "../ui";

export function ModelView({
  api,
  navigate,
}: {
  api: CaseStateApi;
  navigate: (area: Area) => void;
}) {
  const [tab, setTab] = useState<
    "problem" | "system" | "uncertainty" | "opportunity"
  >("problem");
  const [problemOpen, setProblemOpen] = useState(false);
  const [statement, setStatement] = useState(
    "El sistema de planificación de producción genera volúmenes de preparación que no se adaptan suficientemente a la variación de la demanda.",
  );
  const [reason, setReason] = useState(
    "La evidencia muestra que la mayor parte del desperdicio medido ocurre antes del consumo y que la producción usa promedios históricos.",
  );
  const [citations, setCitations] = useState<string[]>(["E-012", "E-018"]);
  const [uncertaintyOpen, setUncertaintyOpen] = useState(false);
  const [newUncertainty, setNewUncertainty] = useState({
    description: "",
    category: "Operational" as Uncertainty["category"],
    criticality: "High" as Criticality,
  });
  const [question, setQuestion] = useState("");
  const [opportunity, setOpportunity] = useState(
    "Permitir que los equipos de cocina adapten la producción por plato cuando cambia la demanda, reduciendo el desperdicio evitable previo al consumo sin comprometer el servicio ni la seguridad.",
  );
  const evidence = availableEvidence(api.state);
  const hasWasteSplit = evidence.some((item) => item.id === "E-018");
  const hasOperationalEvidence = evidence.some((item) =>
    ["E-023", "E-024", "E-025"].includes(item.id),
  );

  const submitProblema = () => {
    api.addProblemVersion(statement, reason, citations);
    if (
      !api.state.uncertainties.some((u) =>
        u.description.includes("explica mejor el desajuste"),
      )
    )
      api.addUncertainty({
        category: "Operational",
        description:
          "¿Qué mecanismo explica mejor el desajuste: error de pronóstico, tamaño mínimo de lote, proveedores o decisiones de ejecución?",
        impact: "Critical",
        evidenceLevel: "Low",
        criticality: "Critical",
        status: "Open",
        evidenceIds: [],
      });
    setProblemOpen(false);
  };

  const addQuestion = () => {
    if (!question.trim()) return;
    api.update((current) => ({
      ...current,
      questions: [
        ...current.questions,
        {
          id: `RQ-${String(current.questions.length + 1).padStart(2, "0")}`,
          text: question.trim(),
          status: "Open",
          evidenceIds: [],
        },
      ],
    }));
    setQuestion("");
  };

  const frameOpportunity = () => {
    api.update((current) => ({
      ...current,
      opportunities: [
        {
          id: "OP-01",
          statement: opportunity,
          evidenceIds: ["E-018", "E-023", "E-025"].filter((id) =>
            evidence.some((item) => item.id === id),
          ),
          uncertaintyIds: current.uncertainties
            .filter((u) => u.status === "Open")
            .map((u) => u.id),
          status: "Defensible",
        },
      ],
    }));
  };

  const downstreamRefs = [
    ...api.state.opportunities.map((item) => item.id),
    ...api.state.requirements.map((item) => item.id),
    ...api.state.alternatives.map((item) => item.id),
    ...api.state.hypotheses.map((item) => item.id),
  ];

  return (
    <div className="page model-page">
      <SectionHeading
        eyebrow="MODELO ACUMULATIVO DEL CASO"
        title="Convertí observaciones en un encuadre defendible del problema"
        action={
          <button
            className="button-secondary"
            onClick={() => navigate("evidence")}
          >
            <Link2 size={16} /> Revisar evidencia
          </button>
        }
      />
      <div className="subtabs" role="tablist">
        {(
          [
            ["problem", "Versiones del problema"],
            ["system", "Sistema y preguntas"],
            ["uncertainty", "Matriz de incertidumbres"],
            ["opportunity", "Oportunidad"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
            {id === "uncertainty" && (
              <span>
                {
                  api.state.uncertainties.filter((u) => u.status === "Open")
                    .length
                }
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "problem" && (
        <>
          {downstreamRefs.length > 0 && (
            <div className="upstream-alert">
              <AlertNotice title="Impacto del cambio anterior">
                Reformular el problema actual exige revisar:{" "}
                {downstreamRefs.join(", ")}. Estas entidades posteriores
                permanecen vinculadas hasta que las revises explícitamente.
              </AlertNotice>
            </div>
          )}
          <div className="problem-layout">
            <section>
              <div className="version-timeline">
                {api.state.problemVersions.map((version, index) => (
                  <article
                    key={version.version}
                    className={
                      index === api.state.problemVersions.length - 1
                        ? "current"
                        : ""
                    }
                  >
                    <div className="version-index">
                      <span>V{version.version}</span>
                      {index < api.state.problemVersions.length - 1 && <i />}
                    </div>
                    <div className="version-card">
                      <div>
                        <span className="eyebrow">
                          PROBLEM V{version.version}
                        </span>
                        {index === api.state.problemVersions.length - 1 && (
                          <Pill tone="green">Actual</Pill>
                        )}
                      </div>
                      <h3>{version.statement}</h3>
                      <p>
                        <strong>Cambió porque:</strong> {version.changedBecause}
                      </p>
                      <div className="citation-row">
                        {version.evidenceIds.length ? (
                          version.evidenceIds.map((id) => (
                            <button
                              onClick={() => navigate("evidence")}
                              key={id}
                            >
                              <Link2 size={12} /> {id}
                            </button>
                          ))
                        ) : (
                          <span>Sin evidencia directa citada</span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <button
                className="button-primary"
                onClick={() => setProblemOpen(true)}
              >
                <Plus size={16} /> Crear Problema v
                {api.state.problemVersions.length + 1}
              </button>
            </section>
            <aside className="stress-panel">
              <span className="eyebrow">PRUEBA DE ESTRÉS COGNITIVO</span>
              <h3>
                {api.state.problemVersions.length < 2
                  ? "¿Estás nombrando un síntoma como si fuera la causa?"
                  : "El pronóstico puede ser un mecanismo, no el problema."}
              </h3>
              <p>
                {api.state.problemVersions.length < 2
                  ? "El relato del patrocinador atribuye el desperdicio a los estudiantes, pero el informe inicial no permite ubicar dónde se descarta la comida."
                  : "¿Qué evidencia distinguiría un error de pronóstico de lotes mínimos, restricciones de proveedores o decisiones del personal?"}
              </p>
              <div className="stress-status">
                <span>Umbral de evidencia</span>
                <strong>
                  {hasWasteSplit ? (
                    <>
                      <Check size={16} /> Flujo de desperdicio localizado
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={16} /> Falta evidencia directa
                    </>
                  )}
                </strong>
              </div>
              <button className="button-link" onClick={() => navigate("case")}>
                {hasWasteSplit
                  ? "Investigar explicaciones alternativas"
                  : "Solicitar mediciones de desperdicio"}{" "}
                <ArrowRight size={15} />
              </button>
            </aside>
          </div>
        </>
      )}

      {tab === "system" && (
        <div className="system-layout">
          <section className="system-map">
            <span className="eyebrow">RELACIONES DEL SISTEMA</span>
            <div className="map-flow">
              <div className="map-node">
                <span>Señal</span>
                <strong>Planificación académica</strong>
                <small>Eventos · clases · clima</small>
              </div>
              <ArrowRight />
              <div className="map-node focus">
                <span>Decisión</span>
                <strong>Plan de producción</strong>
                <small>Promedios históricos</small>
              </div>
              <ArrowRight />
              <div className="map-node">
                <span>Operación</span>
                <strong>Lotes de cocina</strong>
                <small>Personal · recetas · equipamiento</small>
              </div>
              <ArrowRight />
              <div className="map-node">
                <span>Resultado</span>
                <strong>Servicio y desperdicio</strong>
                <small>Cocina · línea · plato</small>
              </div>
            </div>
            <div className="actor-grid">
              {[
                "Students",
                "Equipo de cocina",
                "Compras",
                "Proveedores",
                "Planificación académica",
                "Administración",
              ].map((actor) => (
                <div key={actor}>
                  <span className="actor-dot" />
                  {actor}
                </div>
              ))}
            </div>
            <div className="constraint-list">
              <h3>Restricciones</h3>
              {api.state.constraints.map((item) => (
                <div key={item.id}>
                  <span>{item.id}</span>
                  <p>{item.text}</p>
                  <Pill>{item.category}</Pill>
                </div>
              ))}
            </div>
          </section>
          <aside className="questions-panel">
            <span className="eyebrow">PREGUNTAS DE INVESTIGACIÓN</span>
            <h3>Preguntas que separan explicaciones</h3>
            <div className="question-list editable">
              {api.state.questions.map((q) => (
                <div key={q.id}>
                  <span>{q.id}</span>
                  <p>{q.text}</p>
                  <StatusPill value={q.status} />
                </div>
              ))}
            </div>
            <div className="inline-compose">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Agregar una pregunta de investigación…"
              />
              <button
                className="icon-button filled"
                aria-label="Agregar pregunta de investigación"
                onClick={addQuestion}
              >
                <Plus size={17} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {tab === "uncertainty" && (
        <>
          <div className="matrix-toolbar">
            <p>
              Priorizá según el impacto en la decisión y el nivel de evidencia.
              Los elementos críticos con poca evidencia deben orientar la
              investigación.
            </p>
            <button
              className="button-primary"
              onClick={() => setUncertaintyOpen(true)}
            >
              <Plus size={16} /> Agregar incertidumbre
            </button>
          </div>
          <div className="uncertainty-table-wrap">
            <table className="uncertainty-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Categoría</th>
                  <th>Incertidumbre</th>
                  <th>Impacto</th>
                  <th>Evidencia</th>
                  <th>Criticidad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {api.state.uncertainties.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.id}</strong>
                    </td>
                    <td>{statusLabel(item.category)}</td>
                    <td>
                      <strong>{item.description}</strong>
                      {item.evidenceIds.length > 0 && (
                        <small>Vinculada: {item.evidenceIds.join(", ")}</small>
                      )}
                    </td>
                    <td>
                      <StatusPill value={item.impact} />
                    </td>
                    <td>
                      <StatusPill value={item.evidenceLevel} />
                    </td>
                    <td>
                      <StatusPill value={item.criticality} />
                    </td>
                    <td>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          api.update((current) => ({
                            ...current,
                            uncertainties: current.uncertainties.map((u) =>
                              u.id === item.id
                                ? {
                                    ...u,
                                    status: e.target
                                      .value as Uncertainty["status"],
                                  }
                                : u,
                            ),
                          }))
                        }
                      >
                        <option value="Open">Abierta</option>
                        <option value="Investigating">En investigación</option>
                        <option value="Resolved">Resuelta</option>
                        <option value="Accepted risk">Riesgo aceptado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "opportunity" && (
        <div className="opportunity-layout">
          {!hasOperationalEvidence ? (
            <BlockNotice title="La oportunidad todavía no es defendible">
              <p>
                Tenés evidencia sobre dónde aparece el desperdicio, pero no
                sobre si operaciones puede responder a cambios en la demanda.
              </p>
              <div className="critical-question">
                <span>Incertidumbre crítica</span>
                <strong>
                  ¿Puede operaciones ajustar la producción cuando cambia la
                  demanda?
                </strong>
              </div>
              <button
                className="button-primary"
                onClick={() => navigate("case")}
              >
                Investigar flexibilidad operativa <ArrowRight size={16} />
              </button>
            </BlockNotice>
          ) : (
            <section className="opportunity-editor">
              <span className="eyebrow">ENCUADRE DE OPORTUNIDAD</span>
              <h2>Describí el cambio valioso, no la tecnología preferida</h2>
              <label>
                Declaración de oportunidad
                <textarea
                  rows={4}
                  value={opportunity}
                  onChange={(e) => setOpportunity(e.target.value)}
                />
              </label>
              <div className="opportunity-chain">
                <div>
                  <span>Problema</span>
                  <strong>Desajuste previo al consumo</strong>
                </div>
                <ArrowRight />
                <div>
                  <span>Evidencia</span>
                  <strong>E-018 · E-023 · E-025</strong>
                </div>
                <ArrowRight />
                <div>
                  <span>Oportunidad</span>
                  <strong>Producción adaptativa</strong>
                </div>
              </div>
              <button
                className="button-primary"
                onClick={frameOpportunity}
                disabled={opportunity.trim().length < 30}
              >
                <Save size={16} />{" "}
                {api.state.opportunities.length
                  ? "Actualizar oportunidad"
                  : "Formular oportunidad"}
              </button>
            </section>
          )}
          {api.state.opportunities[0] && (
            <aside className="opportunity-summary">
              <Pill tone="green">Defendible</Pill>
              <h3>{api.state.opportunities[0].id}</h3>
              <p>{api.state.opportunities[0].statement}</p>
              <small>
                Respaldada por{" "}
                {api.state.opportunities[0].evidenceIds.join(", ")}
              </small>
            </aside>
          )}
        </div>
      )}

      {problemOpen && (
        <div className="modal-backdrop">
          <div className="modal model-modal">
            <button
              className="icon-button modal-close"
              onClick={() => setProblemOpen(false)}
            >
              <X size={18} />
            </button>
            <span className="eyebrow">REFORMULAR · HISTORIAL DE VERSIONES</span>
            <h3>Crear Problema v{api.state.problemVersions.length + 1}</h3>
            <label>
              Declaración del problema
              <textarea
                rows={4}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
              />
            </label>
            <label>
              ¿Qué evidencia produjo este cambio?
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <fieldset>
              <legend>Citar evidencia</legend>
              <div className="citation-picker">
                {evidence.map((item) => (
                  <label key={item.id}>
                    <input
                      type="checkbox"
                      checked={citations.includes(item.id)}
                      onChange={() =>
                        setCitations((current) =>
                          current.includes(item.id)
                            ? current.filter((id) => id !== item.id)
                            : [...current, item.id],
                        )
                      }
                    />
                    <span>{item.id}</span>
                    {item.title}
                  </label>
                ))}
              </div>
            </fieldset>
            <button
              className="button-primary full"
              disabled={
                statement.trim().length < 25 ||
                reason.trim().length < 20 ||
                !citations.length
              }
              onClick={submitProblema}
            >
              Guardar nueva versión
            </button>
          </div>
        </div>
      )}

      {uncertaintyOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <button
              className="icon-button modal-close"
              onClick={() => setUncertaintyOpen(false)}
            >
              <X size={18} />
            </button>
            <span className="eyebrow">MATRIZ DE INCERTIDUMBRES</span>
            <h3>Agregar incertidumbre relevante para la decisión</h3>
            <label>
              Descripción
              <textarea
                rows={3}
                value={newUncertainty.description}
                onChange={(e) =>
                  setNewUncertainty({
                    ...newUncertainty,
                    description: e.target.value,
                  })
                }
              />
            </label>
            <div className="form-grid">
              <label>
                Categoría
                <select
                  value={newUncertainty.category}
                  onChange={(e) =>
                    setNewUncertainty({
                      ...newUncertainty,
                      category: e.target.value as Uncertainty["category"],
                    })
                  }
                >
                  {[
                    "People / problem",
                    "Technical",
                    "Business",
                    "Operational",
                    "Regulatory",
                    "Impact",
                  ].map((v) => (
                    <option key={v} value={v}>
                      {statusLabel(v)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Criticidad
                <select
                  value={newUncertainty.criticality}
                  onChange={(e) =>
                    setNewUncertainty({
                      ...newUncertainty,
                      criticality: e.target.value as Criticality,
                    })
                  }
                >
                  {["Low", "Medium", "High", "Critical"].map((v) => (
                    <option key={v} value={v}>
                      {statusLabel(v)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              className="button-primary full"
              disabled={newUncertainty.description.trim().length < 10}
              onClick={() => {
                api.addUncertainty({
                  category: newUncertainty.category,
                  description: newUncertainty.description,
                  impact: newUncertainty.criticality,
                  evidenceLevel: "Low",
                  criticality: newUncertainty.criticality,
                  status: "Open",
                  evidenceIds: [],
                });
                setUncertaintyOpen(false);
                setNewUncertainty({
                  description: "",
                  category: "Operational",
                  criticality: "High",
                });
              }}
            >
              Agregar a la matriz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
