"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ExternalLink,
  Link2,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { availableEvidence } from "@/domain/engine";
import { campusCase } from "@/domain/seed";
import type { EpistemicStatus } from "@/domain/types";
import type { CaseStateApi } from "@/lib/use-case-state";
import type { Area } from "../studio";
import {
  AlertNotice,
  Empty,
  Pill,
  SectionHeading,
  statusLabel,
  StatusPill,
} from "../ui";

export function EvidenceView({
  api,
  navigate,
}: {
  api: CaseStateApi;
  navigate: (area: Area) => void;
}) {
  const [tab, setTab] = useState<"library" | "claims">("library");
  const [query, setQuery] = useState("");
  const [calidad, setCalidad] = useState("All");
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const [linkingClaim, setLinkingClaim] = useState<string | null>(null);
  const [newClaim, setNewClaim] = useState("");
  const [reviewChoice, setReviewChoice] = useState<"No" | "Partially" | "Yes">(
    "Yes",
  );
  const [reviewReason, setReviewReason] = useState("");
  const evidence = availableEvidence(api.state);
  const e18Available = evidence.some((item) => item.id === "E-018");
  const needsReview = e18Available && !api.state.contradictionReviews["E-018"];

  const filtered = useMemo(
    () =>
      evidence.filter(
        (item) =>
          (calidad === "All" || item.quality === calidad) &&
          `${item.id} ${item.title} ${item.finding} ${item.source}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [evidence, calidad, query],
  );
  const activeEvidence = campusCase.evidence.find(
    (item) => item.id === selectedEvidence,
  );

  const addClaim = () => {
    if (!newClaim.trim()) return;
    api.update((current) => ({
      ...current,
      claims: [
        ...current.claims,
        {
          id: `C-${String(current.claims.length + 1).padStart(2, "0")}`,
          text: newClaim.trim(),
          status: "Assumed",
          evidenceIds: [],
          contradictedBy: [],
          active: true,
        },
      ],
    }));
    setNewClaim("");
  };

  return (
    <div className="page evidence-page">
      <SectionHeading
        eyebrow="TRAZABILIDAD AFIRMACIÓN ↔ EVIDENCIA"
        title="¿Qué respalda realmente el caso?"
        action={
          <button className="button-secondary" onClick={() => navigate("case")}>
            <Search size={16} /> Encargar investigación
          </button>
        }
      />
      {needsReview && (
        <button
          className="impact-banner"
          onClick={() => setSelectedEvidence("E-018")}
        >
          <span className="impact-icon">
            <AlertTriangle size={20} />
          </span>
          <div>
            <strong>
              Nueva evidencia contradictoria requiere interpretación
            </strong>
            <p>
              E-018 entra en conflicto con la afirmación C-02 y el supuesto
              A-03. El sistema no reescribirá tu razonamiento por vos.
            </p>
          </div>
          <span>
            Revisar impacto <ArrowRight size={16} />
          </span>
        </button>
      )}
      <div className="subtabs" role="tablist">
        <button
          className={tab === "library" ? "active" : ""}
          onClick={() => setTab("library")}
        >
          Biblioteca de evidencia <span>{evidence.length}</span>
        </button>
        <button
          className={tab === "claims" ? "active" : ""}
          onClick={() => setTab("claims")}
        >
          Afirmaciones y supuestos{" "}
          <span>{api.state.claims.length + api.state.assumptions.length}</span>
        </button>
      </div>

      {tab === "library" && (
        <>
          <div className="evidence-toolbar">
            <div className="search-field">
              <Search size={17} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar evidencia, fuente o hallazgo…"
              />
            </div>
            <label>
              <SlidersHorizontal size={16} />
              <select
                value={calidad}
                onChange={(e) => setCalidad(e.target.value)}
              >
                <option value="All">Todas</option>
                <option value="High">Alta</option>
                <option value="Medium">Media</option>
                <option value="Low">Baja</option>
              </select>
            </label>
            <span className="result-count">{filtered.length} tarjetas</span>
          </div>
          <div className="evidence-table-wrap">
            <table className="evidence-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Evidencia</th>
                  <th>Método / fuente</th>
                  <th>Calidad</th>
                  <th>Trazabilidad</th>
                  <th aria-label="Abrir" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const linked = api.state.claims.filter((claim) =>
                    claim.evidenceIds.includes(item.id),
                  );
                  return (
                    <tr
                      key={item.id}
                      className={item.contradicts.length ? "contradictory" : ""}
                      onClick={() => setSelectedEvidence(item.id)}
                    >
                      <td>
                        <strong>{item.id}</strong>
                      </td>
                      <td>
                        <div className="table-primary">
                          <strong>{item.title}</strong>
                          <p>{item.finding}</p>
                          {item.contradicts.length ? (
                            <Pill tone="red">
                              <AlertTriangle size={12} /> Contradice{" "}
                              {item.contradicts.join(", ")}
                            </Pill>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <span>{item.method}</span>
                        <small>{item.source}</small>
                      </td>
                      <td>
                        <StatusPill value={item.quality} />
                      </td>
                      <td>
                        {linked.length ? (
                          <div className="link-stack">
                            {linked.map((claim) => (
                              <span key={claim.id}>
                                <Link2 size={12} /> {claim.id}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="unlinked">Sin vincular</span>
                        )}
                      </td>
                      <td>
                        <ExternalLink size={15} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!filtered.length && (
              <Empty
                title="No hay evidencia coincidente"
                text="Cambiá el filtro o encargá otra acción de investigación."
              />
            )}
          </div>
        </>
      )}

      {tab === "claims" && (
        <div className="claims-layout">
          <section>
            <div className="claim-compose">
              <input
                value={newClaim}
                onChange={(e) => setNewClaim(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addClaim()}
                placeholder="Agregar una afirmación o interpretación de trabajo…"
              />
              <button className="button-primary" onClick={addClaim}>
                <Plus size={16} /> Agregar afirmación
              </button>
            </div>
            <div className="claim-list">
              {api.state.claims.map((claim) => (
                <article
                  key={claim.id}
                  className={!claim.active ? "inactive" : ""}
                >
                  <div className="claim-top">
                    <strong>{claim.id}</strong>
                    <select
                      value={claim.status}
                      onChange={(e) =>
                        api.setClaimStatus(
                          claim.id,
                          e.target.value as EpistemicStatus,
                        )
                      }
                      aria-label={`Estado epistémico de ${claim.id}`}
                    >
                      <option value="Known">Conocido</option>
                      <option value="Inferred">Inferido</option>
                      <option value="Assumed">Supuesto</option>
                    </select>
                  </div>
                  <p>{claim.text}</p>
                  <div className="claim-links">
                    {claim.evidenceIds.map((id) => (
                      <button key={id} onClick={() => setSelectedEvidence(id)}>
                        <Link2 size={12} /> {id}
                      </button>
                    ))}
                    {!claim.evidenceIds.length && (
                      <span>Sin evidencia de respaldo vinculada</span>
                    )}
                    {claim.contradictedBy.map((id) => (
                      <button
                        className="conflict"
                        key={id}
                        onClick={() => setSelectedEvidence(id)}
                      >
                        <AlertTriangle size={12} /> {id} en conflicto
                      </button>
                    ))}
                  </div>
                  <button
                    className="button-link"
                    onClick={() => setLinkingClaim(claim.id)}
                  >
                    <Plus size={14} /> Vincular evidencia
                  </button>
                </article>
              ))}
            </div>
          </section>
          <aside className="assumption-panel">
            <span className="eyebrow">REGISTRO DE SUPUESTOS</span>
            <h3>Las afirmaciones sin prueba son deuda visible</h3>
            {api.state.assumptions.map((item) => (
              <div
                className={`assumption-row ${item.status.toLowerCase()}`}
                key={item.id}
              >
                <div>
                  <strong>{item.id}</strong>
                  <StatusPill value={item.status} />
                </div>
                <p>{item.text}</p>
                {item.evidenceIds.length > 0 && (
                  <small>Cuestionado por {item.evidenceIds.join(", ")}</small>
                )}
              </div>
            ))}
          </aside>
        </div>
      )}

      {activeEvidence && (
        <div
          className="drawer-backdrop"
          onClick={() => setSelectedEvidence(null)}
        >
          <aside
            className="drawer evidence-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button drawer-close"
              onClick={() => setSelectedEvidence(null)}
              aria-label="Cerrar evidencia"
            >
              <X size={19} />
            </button>
            <div className="evidence-id">{activeEvidence.id}</div>
            <span className="eyebrow">TARJETA DE EVIDENCIA</span>
            <h2>{activeEvidence.title}</h2>
            <div className="evidence-meta">
              <div>
                <span>Fuente</span>
                <strong>{activeEvidence.source}</strong>
              </div>
              <div>
                <span>Fecha</span>
                <strong>{activeEvidence.date}</strong>
              </div>
              <div>
                <span>Método</span>
                <strong>{activeEvidence.method}</strong>
              </div>
              <div>
                <span>Calidad</span>
                <StatusPill value={activeEvidence.quality} />
              </div>
            </div>
            <div className="evidence-section">
              <span>Observación / hallazgo</span>
              <p>{activeEvidence.finding}</p>
            </div>
            <div className="evidence-section inference">
              <span>Interpretación</span>
              <p>{activeEvidence.inference}</p>
            </div>
            <div className="evidence-section limitation">
              <span>Limitación</span>
              <p>{activeEvidence.limitations}</p>
            </div>
            {activeEvidence.contradicts.length > 0 && (
              <AlertNotice
                title={`Contradice ${activeEvidence.contradicts.join(", ")}`}
              >
                Esta evidencia puede afectar supuestos activos, afirmaciones y
                decisiones anteriores.
              </AlertNotice>
            )}
            {activeEvidence.id === "E-018" &&
              !api.state.contradictionReviews["E-018"] && (
                <div className="review-form">
                  <h3>¿Esto cambia tu interpretación?</h3>
                  <div className="segmented">
                    {(["No", "Partially", "Yes"] as const).map((choice) => (
                      <button
                        className={choice === reviewChoice ? "active" : ""}
                        key={choice}
                        onClick={() => setReviewChoice(choice)}
                      >
                        {
                          { No: "No", Partially: "Parcialmente", Yes: "Sí" }[
                            choice
                          ]
                        }
                      </button>
                    ))}
                  </div>
                  <label>
                    Explicá tu razonamiento
                    <textarea
                      rows={4}
                      value={reviewReason}
                      onChange={(e) => setReviewReason(e.target.value)}
                      placeholder="¿Qué cambia esta evidencia y qué no permite concluir?"
                    />
                  </label>
                  <button
                    className="button-primary full"
                    disabled={reviewReason.trim().length < 20}
                    onClick={() => {
                      api.reviewContradiction(
                        "E-018",
                        reviewChoice,
                        reviewReason,
                      );
                      setSelectedEvidence(null);
                    }}
                  >
                    Registrar interpretación y decisión
                  </button>
                </div>
              )}
            <button
              className="button-secondary full"
              onClick={() => {
                setLinkingClaim(api.state.claims[0]?.id ?? null);
                setSelectedEvidence(null);
              }}
            >
              <Link2 size={16} /> Vincular a una afirmación
            </button>
          </aside>
        </div>
      )}

      {linkingClaim && (
        <div className="modal-backdrop">
          <div className="modal link-modal">
            <button
              className="icon-button modal-close"
              onClick={() => setLinkingClaim(null)}
            >
              <X size={18} />
            </button>
            <span className="eyebrow">TRAZABILIDAD</span>
            <h3>Vincular evidencia a {linkingClaim}</h3>
            <p>
              Seleccioná una fuente disponible. Vincular evidencia no convierte
              automáticamente una afirmación en conocimiento verificado.
            </p>
            <div className="link-options">
              {evidence.map((item) => {
                const linked = api.state.claims
                  .find((c) => c.id === linkingClaim)
                  ?.evidenceIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    disabled={linked}
                    onClick={() => {
                      api.linkEvidence(linkingClaim, item.id);
                      setLinkingClaim(null);
                    }}
                  >
                    <span>{item.id}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <small>
                        {statusLabel(item.quality)} · {item.source}
                      </small>
                    </div>
                    {linked ? <Check size={16} /> : <Link2 size={16} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
