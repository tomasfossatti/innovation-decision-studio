"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  MessageSquareText,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { campusCase } from "@/domain/seed";
import type { CaseStateApi } from "@/lib/use-case-state";
import type { Area } from "../studio";
import { AlertNotice, Pill, SectionHeading } from "../ui";

export function CaseView({
  api,
  navigate,
}: {
  api: CaseStateApi;
  navigate: (area: Area) => void;
}) {
  const [tab, setTab] = useState<
    "brief" | "documents" | "stakeholders" | "research"
  >("brief");
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [stakeholderId, setStakeholderId] = useState<string | null>(null);
  const [asked, setAsked] = useState<Record<string, number[]>>({});
  const [toast, setToast] = useState("");
  const stakeholder = campusCase.stakeholders.find(
    (item) => item.id === stakeholderId,
  );
  const activeDocument = campusCase.documents.find(
    (item) => item.id === documentId,
  );

  const availableDocs = useMemo(
    () =>
      campusCase.documents.map((doc) => ({
        ...doc,
        available:
          doc.available ||
          (doc.id === "doc-04" &&
            api.state.completedActions.includes("ra-measure")) ||
          (doc.id === "doc-05" &&
            api.state.completedActions.includes("ra-demand")) ||
          (doc.id === "doc-06" &&
            api.state.completedActions.includes("ra-flexibility")),
      })),
    [api.state.completedActions],
  );

  const openDoc = (id: string) => {
    const doc = availableDocs.find((item) => item.id === id);
    if (!doc?.available) return;
    setDocumentId(id);
    api.update((current) => ({
      ...current,
      openedDocuments: [...new Set([...current.openedDocuments, id])],
    }));
  };

  const performAction = (id: string) => {
    const result = api.runResearch(id);
    setToast(result.message);
    if (result.ok) setTimeout(() => setToast(""), 3500);
  };

  return (
    <div className="page case-page">
      <SectionHeading
        eyebrow="MUNDO DEL CASO"
        title="Investigá el sistema antes de nombrar la solución"
        action={
          <div className="capacity-inline">
            <Clock3 size={16} />
            <span>Capacidad de investigación</span>
            <strong>{api.state.researchCapacity}</strong>
          </div>
        }
      />
      <div className="subtabs" role="tablist">
        {(
          [
            ["brief", "Resumen del caso"],
            ["documents", "Documentos"],
            ["stakeholders", "Partes interesadas"],
            ["research", "Acciones de investigación"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
            {id === "research" && (
              <span>
                {campusCase.researchActions.length -
                  api.state.completedActions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "brief" && (
        <div className="brief-layout">
          <section className="brief-main">
            <div className="case-code">CASO 01 · INICIATIVA VIVA</div>
            <h1>{campusCase.name}</h1>
            <p className="lead">{campusCase.brief}</p>
            <div className="brief-callouts">
              <div>
                <span>Solicitud del patrocinador</span>
                <strong>{campusCase.sponsorRequest}</strong>
              </div>
              <div className="premature">
                <span>Solución sugerida prematuramente por la dirección</span>
                <strong>{campusCase.suggestedSolution}</strong>
                <small>
                  Tratá esto como una propuesta, no como una definición del
                  problema.
                </small>
              </div>
            </div>
            <div className="event-strip">
              {campusCase.events.map((event) => {
                const available =
                  !event.evidenceId ||
                  api.state.completedActions.some((actionId) =>
                    campusCase.researchActions
                      .find((action) => action.id === actionId)
                      ?.evidenceIds.includes(event.evidenceId ?? ""),
                  );
                return (
                  <div key={event.id} className={available ? "" : "pending"}>
                    <span>{event.date}</span>
                    <strong>
                      {available ? event.title : "Evento del caso pendiente"}
                    </strong>
                    <p>
                      {available
                        ? event.description
                        : "Este evento depende de evidencia que todavía no fue solicitada."}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
          <aside className="brief-side">
            <h3>Encuadre inicial del sistema</h3>
            <dl>
              <div>
                <dt>Organización</dt>
                <dd>{campusCase.organization}</dd>
              </div>
              <div>
                <dt>Síntoma observado</dt>
                <dd>28% de la comida preparada reportada como desperdicio</dd>
              </div>
              <div>
                <dt>Relato causal inicial</dt>
                <dd>Los estudiantes toman más comida de la que consumen</dd>
              </div>
              <div>
                <dt>Vacío de medición conocido</dt>
                <dd>Los flujos de desperdicio fueron combinados</dd>
              </div>
            </dl>
            <button
              className="button-primary full"
              onClick={() => setTab("research")}
            >
              Elegir qué investigar <ArrowRight size={16} />
            </button>
          </aside>
        </div>
      )}

      {tab === "documents" && (
        <div className="document-grid">
          {availableDocs.map((doc) => (
            <button
              key={doc.id}
              className={`document-card ${!doc.available ? "locked" : ""}`}
              disabled={!doc.available}
              onClick={() => openDoc(doc.id)}
            >
              <div className="doc-icon">
                <FileText size={21} />
              </div>
              <span>{doc.type}</span>
              <strong>{doc.title}</strong>
              <p>
                {doc.available
                  ? doc.summary
                  : "Disponible después de la acción de investigación correspondiente."}
              </p>
              <small>
                {doc.available
                  ? "Abrir documento"
                  : "Dependencia de investigación"}{" "}
                <ChevronRight size={14} />
              </small>
            </button>
          ))}
        </div>
      )}

      {tab === "stakeholders" && (
        <div className="stakeholder-grid">
          {campusCase.stakeholders.map((person) => (
            <button
              className="stakeholder-card"
              key={person.id}
              onClick={() => setStakeholderId(person.id)}
            >
              <span className="avatar">{person.avatar}</span>
              <div>
                <strong>{person.name}</strong>
                <small>{person.role}</small>
                <p>{person.perspective}</p>
              </div>
              <MessageSquareText size={18} />
            </button>
          ))}
        </div>
      )}

      {tab === "research" && (
        <div className="research-layout">
          <section>
            <AlertNotice title="Capacidad de investigación limitada">
              Podés encargar {api.state.researchCapacity} acción adicional
              {api.state.researchCapacity === 1 ? "" : "es"}. Priorizá la
              evidencia capaz de cambiar la decisión actual.
            </AlertNotice>
            <div className="research-list">
              {campusCase.researchActions.map((action) => {
                const done = api.state.completedActions.includes(action.id);
                return (
                  <article key={action.id} className={done ? "done" : ""}>
                    <div className="research-symbol">
                      {done ? <Check size={18} /> : <Search size={18} />}
                    </div>
                    <div>
                      <strong>{action.label}</strong>
                      <p>{action.description}</p>
                      <small>
                        Produce {action.evidenceIds.length} tarjetas de
                        evidencia · Capacidad {action.cost}
                      </small>
                    </div>
                    <button
                      className={done ? "button-quiet" : "button-secondary"}
                      disabled={
                        done || api.state.researchCapacity < action.cost
                      }
                      onClick={() => performAction(action.id)}
                    >
                      {done ? "Completada" : "Encargar"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
          <aside className="research-guidance">
            <span className="eyebrow">LENTE DE INVESTIGACIÓN</span>
            <h3>¿Qué incógnita podría cambiar tu próxima decisión?</h3>
            <p>
              Un gran volumen de evidencia no es útil por sí mismo. Priorizá
              acciones que permitan distinguir explicaciones causales en
              competencia.
            </p>
            <div className="question-list">
              {api.state.questions.map((q) => (
                <div key={q.id}>
                  <span>{q.id}</span>
                  <p>{q.text}</p>
                </div>
              ))}
            </div>
            {api.state.researchCapacity === 0 &&
              api.state.completedActions.length === 4 && (
                <div className="research-cycle">
                  <strong>Primer ciclo de investigación completo</strong>
                  <p>
                    Abrí un ciclo de seguimiento focalizado después de revisar
                    qué cambiaron las primeras cuatro acciones.
                  </p>
                  <button
                    className="button-secondary full"
                    onClick={() =>
                      api.update((current) => ({
                        ...current,
                        researchCapacity: 3,
                      }))
                    }
                  >
                    Abrir ciclo de seguimiento · 3 acciones
                  </button>
                </div>
              )}
            <button className="button-link" onClick={() => navigate("model")}>
              Editar preguntas de investigación <ArrowRight size={15} />
            </button>
          </aside>
        </div>
      )}

      {activeDocument && (
        <div className="drawer-backdrop" onClick={() => setDocumentId(null)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <button
              className="icon-button drawer-close"
              onClick={() => setDocumentId(null)}
              aria-label="Cerrar documento"
            >
              <X size={19} />
            </button>
            <div className="drawer-icon">
              <BookOpenText size={24} />
            </div>
            <span className="eyebrow">{activeDocument.type}</span>
            <h2>{activeDocument.title}</h2>
            <p className="document-content">{activeDocument.content}</p>
            <div className="source-note">
              <strong>Nota del analista</strong>
              <p>
                Esta fuente forma parte del mundo del caso diseñado. Sus
                limitaciones importan tanto como sus hallazgos.
              </p>
            </div>
          </aside>
        </div>
      )}

      {stakeholder && (
        <div className="drawer-backdrop" onClick={() => setStakeholderId(null)}>
          <aside
            className="drawer interview-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button drawer-close"
              onClick={() => setStakeholderId(null)}
              aria-label="Cerrar entrevista"
            >
              <X size={19} />
            </button>
            <div className="person-header">
              <span className="avatar large">{stakeholder.avatar}</span>
              <div>
                <span className="eyebrow">ENTREVISTA CON PARTE INTERESADA</span>
                <h2>{stakeholder.name}</h2>
                <p>{stakeholder.role}</p>
              </div>
            </div>
            <div className="stakeholder-context">
              <div>
                <span>Perspectiva</span>
                <p>{stakeholder.perspective}</p>
              </div>
              <div>
                <span>Sesgo posible</span>
                <p>{stakeholder.bias}</p>
              </div>
            </div>
            <div className="conversation">
              <div className="message system">
                <UserRound size={15} />
                <p>
                  Preguntá por lo que esta persona realmente conoce. Las
                  respuestas se basan en el modelo del caso.
                </p>
              </div>
              {(asked[stakeholder.id] ?? []).map((index) => (
                <div className="exchange" key={index}>
                  <div className="message user">
                    {stakeholder.prompts[index].question}
                  </div>
                  <div className="message person">
                    <span className="avatar tiny">{stakeholder.avatar}</span>
                    <div>
                      <p>{stakeholder.prompts[index].answer}</p>
                      {stakeholder.prompts[index].evidenceId && (
                        <Pill tone="green">
                          Evidencia potencial ·{" "}
                          {stakeholder.prompts[index].evidenceId}
                        </Pill>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="prompt-options">
              <span>Hacer una pregunta basada en el caso</span>
              {stakeholder.prompts.map((prompt, index) => (
                <button
                  key={prompt.question}
                  disabled={(asked[stakeholder.id] ?? []).includes(index)}
                  onClick={() =>
                    setAsked((current) => ({
                      ...current,
                      [stakeholder.id]: [
                        ...(current[stakeholder.id] ?? []),
                        index,
                      ],
                    }))
                  }
                >
                  {prompt.question}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}

      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
          <button onClick={() => navigate("evidence")}>
            Revisar evidencia
          </button>
        </div>
      )}
    </div>
  );
}
