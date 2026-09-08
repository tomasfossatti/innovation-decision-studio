"use client";

import { Download, Printer } from "lucide-react";
import {
  availableEvidence,
  evaluateGate,
  evidenceHealth,
} from "@/domain/engine";
import { campusCase } from "@/domain/seed";
import type { CaseStateApi } from "@/lib/use-case-state";
import { Empty, Pill, SectionHeading, statusLabel, StatusPill } from "../ui";

export function DossierView({ api }: { api: CaseStateApi }) {
  const evidence = availableEvidence(api.state);
  const currentProblem = api.state.problemVersions.at(-1);
  const latestDecision = api.state.decisions.at(-1);
  const exportJson = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            case: { id: campusCase.id, name: campusCase.name },
            studentWork: api.state,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "campus-food-lab-decision-case.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page dossier-page">
      <div className="no-print">
        <SectionHeading
          eyebrow="DOSSIER VIVO"
          title="Un modelo de caso, múltiples vistas profesionales"
          action={
            <div className="dossier-actions">
              <button className="button-secondary" onClick={exportJson}>
                <Download size={16} /> Exportar datos
              </button>
              <button className="button-primary" onClick={() => window.print()}>
                <Printer size={16} /> Imprimir dossier
              </button>
            </div>
          }
        />
      </div>
      <div className="dossier-shell">
        <aside className="dossier-index no-print">
          <span className="eyebrow">CONTENIDOS</span>
          {[
            "Resumen Ejecutivo",
            "Resumen del Problema y el Sistema",
            "Evidencia y Oportunidad",
            "Arquitectura de Solución",
            "Caso de Negocio de Innovación",
            "Paquete de Validación",
            "Hoja de Ruta de Desarrollo",
            "Implementación y Medición",
            "Informe Ejecutivo de Decisión",
            "Registro de Decisiones",
            "Apéndice de Evidencia",
            "Cómo cambió el proyecto",
          ].map((label, index) => (
            <a href={`#dossier-${index + 1}`} key={label}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {label}
            </a>
          ))}
        </aside>
        <article className="dossier-document">
          <header className="dossier-cover">
            <span>CASO DE DECISIÓN DE INNOVACIÓN · CASO 01</span>
            <h1>{campusCase.name}</h1>
            <p>{campusCase.organization}</p>
            <div>
              <span>Última actualización</span>
              <strong>
                {new Date(api.state.updatedAt).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
              <span>Salud de la evidencia</span>
              <strong>{evidenceHealth(api.state)}%</strong>
            </div>
          </header>

          <DossierSection index={1} title="Resumen Ejecutivo">
            <p className="dossier-lead">
              {currentProblem?.statement ?? campusCase.brief}
            </p>
            <div className="dossier-callout">
              <span>Recomendación actual</span>
              <strong>
                {latestDecision?.title ??
                  "Todavía no se defendió ninguna recomendación."}
              </strong>
              <p>
                {latestDecision?.rationale ??
                  "La iniciativa todavía está formulando el problema y reuniendo evidencia."}
              </p>
            </div>
            <div className="dossier-stats">
              <div>
                <strong>{evidence.length}</strong>
                <span>Tarjetas de evidencia</span>
              </div>
              <div>
                <strong>{api.state.decisions.length}</strong>
                <span>Decisiones</span>
              </div>
              <div>
                <strong>
                  {
                    api.state.uncertainties.filter((u) => u.status === "Open")
                      .length
                  }
                </strong>
                <span>Incertidumbres abiertas</span>
              </div>
              <div>
                <strong>{api.state.completedGates.length}/7</strong>
                <span>Gates superados</span>
              </div>
            </div>
          </DossierSection>

          <DossierSection index={2} title="Resumen del Problema y el Sistema">
            <h3>Declaración actual del problema</h3>
            <p>{currentProblem?.statement}</p>
            <h3>Actores</h3>
            <div className="dossier-tags">
              {campusCase.stakeholders.map((s) => (
                <span key={s.id}>{s.role}</span>
              ))}
            </div>
            <h3>Restricciones</h3>
            {api.state.constraints.map((item) => (
              <DossierRow
                key={item.id}
                id={item.id}
                title={item.text}
                meta={item.category}
              />
            ))}
            <h3>Preguntas de investigación</h3>
            {api.state.questions.map((item) => (
              <DossierRow
                key={item.id}
                id={item.id}
                title={item.text}
                meta={statusLabel(item.status)}
              />
            ))}
          </DossierSection>

          <DossierSection index={3} title="Evidencia y Oportunidad">
            <h3>Síntesis de evidencia</h3>
            <p>
              {evidence.some((item) => item.id === "E-018")
                ? "El desperdicio medido se concentra aguas arriba: el 64% de la comida descartada en la muestra nunca salió de la cocina. La planificación por promedios históricos, las restricciones por plato y la flexibilidad de ejecución ahora deben analizarse en conjunto."
                : "La estimación inicial de desperdicio es relevante, pero su ubicación y mecanismo todavía no están resueltos."}
            </p>
            <h3>Oportunidad</h3>
            {api.state.opportunities.length ? (
              api.state.opportunities.map((item) => (
                <div className="dossier-callout" key={item.id}>
                  <span>{item.id}</span>
                  <strong>{item.statement}</strong>
                  <small>Evidencia: {item.evidenceIds.join(", ")}</small>
                </div>
              ))
            ) : (
              <Empty
                title="La oportunidad todavía no está formulada"
                text="El dossier compondrá esta sección después de investigar la flexibilidad operativa."
              />
            )}
          </DossierSection>

          <DossierSection index={4} title="Arquitectura de Solución">
            {api.state.alternatives.length ? (
              <div className="dossier-columns">
                {api.state.alternatives.map((item) => (
                  <div key={item.id}>
                    <Pill tone="blue">{item.id}</Pill>
                    <h3>{item.name}</h3>
                    <p>{item.mechanism}</p>
                    <small>
                      {statusLabel(`${item.cost} cost`)} · {item.tradeoffs}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                title="Todavía no hay arquitectura de solución"
                text="El trabajo de solución depende de una oportunidad defendida."
              />
            )}
          </DossierSection>

          <DossierSection index={5} title="Caso de Negocio de Innovación">
            {api.state.risks.length ? (
              api.state.risks.map((item) => (
                <DossierRow
                  key={item.id}
                  id={item.id}
                  title={item.text}
                  meta={`Probabilidad ${statusLabel(item.likelihood).toLowerCase()} · impacto ${statusLabel(item.impact).toLowerCase()}`}
                />
              ))
            ) : (
              <Empty
                title="Caso de negocio pendiente"
                text="La factibilidad, costos, recursos y riesgos se componen aquí después de seleccionar una alternativa."
              />
            )}
          </DossierSection>

          <DossierSection index={6} title="Paquete de Validación">
            {api.state.experiments.length ? (
              api.state.experiments.map((item) => (
                <div className="dossier-callout" key={item.id}>
                  <span>
                    {item.id} · {statusLabel(item.outcome)}
                  </span>
                  <strong>{item.hypothesis}</strong>
                  <p>{item.design}</p>
                  <small>Criterio de éxito: {item.successCriterion}</small>
                </div>
              ))
            ) : (
              <Empty
                title="No hay experimentos registrados"
                text="Los experimentos empiezan con una creencia capaz de cambiar la decisión, no con un formato de prototipo."
              />
            )}
          </DossierSection>

          <DossierSection index={7} title="Hoja de Ruta de Desarrollo">
            <Empty
              title="Hoja de ruta sin preparación decisoria"
              text="Esta vista se completará con alternativas seleccionadas, requisitos, entregables y dependencias después del gate de dirección de desarrollo."
            />
          </DossierSection>

          <DossierSection index={8} title="Plan de Implementación y Medición">
            <Empty
              title="Plan de implementación sin preparación decisoria"
              text="La línea base, los indicadores de resultado, las medidas operativas, los resguardos y las condiciones de escalado siguen siendo trabajo posterior."
            />
          </DossierSection>

          <DossierSection index={9} title="Informe Ejecutivo de Decisión">
            <div className="memo-grid">
              <div>
                <span>Qué recomendamos</span>
                <strong>{latestDecision?.title ?? "Pendiente"}</strong>
              </div>
              <div>
                <span>Por qué</span>
                <p>
                  {latestDecision?.rationale ??
                    "Ninguna decisión alcanzó su umbral de evidencia."}
                </p>
              </div>
              <div>
                <span>Qué evidencia la respalda</span>
                <p>{latestDecision?.evidenceIds.join(", ") || "Pendiente"}</p>
              </div>
              <div>
                <span>Qué permanece incierto</span>
                <p>
                  {api.state.uncertainties
                    .filter((u) => u.status === "Open")
                    .map((u) => u.description)
                    .join(" · ")}
                </p>
              </div>
              <div>
                <span>Qué debería ocurrir después</span>
                <p>{evaluateGate(api.state).nextAction}</p>
              </div>
            </div>
          </DossierSection>

          <DossierSection index={10} title="Registro de Decisiones">
            {api.state.decisions.length ? (
              api.state.decisions.map((item) => (
                <div className="dossier-decision" key={item.id}>
                  <div>
                    <strong>{item.id}</strong>
                    <span>{item.date}</span>
                    <StatusPill value={item.status} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.rationale}</p>
                  <small>
                    Evidencia: {item.evidenceIds.join(", ") || "Ninguna"} ·
                    Revisar si: {item.reviewCondition}
                  </small>
                </div>
              ))
            ) : (
              <Empty
                title="El registro de decisiones está vacío"
                text="Las decisiones y revisiones de contradicciones aparecerán aquí automáticamente."
              />
            )}
          </DossierSection>

          <DossierSection index={11} title="Apéndice de Evidencia">
            {evidence.map((item) => (
              <div className="appendix-row" key={item.id}>
                <strong>{item.id}</strong>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.finding}</p>
                  <small>
                    {item.source} · {item.method} · Calidad{" "}
                    {statusLabel(item.quality).toLowerCase()}
                  </small>
                </div>
                {item.contradicts.length ? (
                  <Pill tone="red">
                    Contradice {item.contradicts.join(", ")}
                  </Pill>
                ) : (
                  <Pill tone="green">Disponible</Pill>
                )}
              </div>
            ))}
          </DossierSection>

          <DossierSection index={12} title="Cómo cambió el proyecto">
            <div className="change-path">
              {api.state.problemVersions.map((item, index) => (
                <div key={item.version}>
                  <span>Problema v{item.version}</span>
                  <strong>{item.statement}</strong>
                  <p>{item.changedBecause}</p>
                  {index < api.state.problemVersions.length - 1 && <b>↓</b>}
                </div>
              ))}
            </div>
            <h3>Hipótesis y supuestos revisados</h3>
            {api.state.assumptions
              .filter((item) => item.status !== "Active")
              .map((item) => (
                <DossierRow
                  key={item.id}
                  id={item.id}
                  title={item.text}
                  meta={statusLabel(item.status)}
                />
              ))}
            {api.state.assumptions.every(
              (item) => item.status === "Active",
            ) && <p>Todavía no se revisó formalmente ningún supuesto.</p>}
          </DossierSection>
        </article>
      </div>
    </div>
  );
}

function DossierSection({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="dossier-section" id={`dossier-${index}`}>
      <div className="dossier-section-title">
        <span>{String(index).padStart(2, "0")}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DossierRow({
  id,
  title,
  meta,
}: {
  id: string;
  title: string;
  meta: string;
}) {
  return (
    <div className="dossier-row">
      <strong>{id}</strong>
      <p>{title}</p>
      <span>{meta}</span>
    </div>
  );
}
