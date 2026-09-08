import { campusCase } from "./seed";
import type {
  Evidence,
  GateResult,
  Readiness,
  StudentCaseState,
} from "./types";

export function availableEvidence(state: StudentCaseState): Evidence[] {
  return campusCase.evidence.filter(
    (item) =>
      item.available ||
      state.completedActions.includes(item.actionId ?? "") ||
      state.savedInterviewEvidence.includes(item.id),
  );
}

export function impactedRelations(state: StudentCaseState, evidenceId: string) {
  const evidence = campusCase.evidence.find((item) => item.id === evidenceId);
  if (!evidence) return [];
  const claimImpacts = state.claims.filter(
    (claim) =>
      claim.evidenceIds.includes(evidenceId) ||
      evidence.contradicts.includes(claim.id),
  );
  const assumptionImpacts = state.assumptions.filter((assumption) =>
    evidence.contradicts.includes(assumption.id),
  );
  const decisionImpacts = state.decisions.filter(
    (decision) =>
      decision.evidenceIds.includes(evidenceId) ||
      decision.assumptionIds.some((id) => evidence.contradicts.includes(id)),
  );
  return [...claimImpacts, ...assumptionImpacts, ...decisionImpacts];
}

function readiness(score: number): Readiness {
  if (score < 35) return "Insufficient";
  if (score < 60) return "Fragile";
  if (score < 85) return "Defensible";
  return "Robust";
}

export function evaluateGate(
  state: StudentCaseState,
  stage = currentStage(state),
): GateResult {
  const evidence = availableEvidence(state);
  const has = (id: string) => evidence.some((item) => item.id === id);
  const reviewedContradiction = Boolean(state.contradictionReviews["E-018"]);
  const problemReframed = state.problemVersions.length >= 2;
  const operationalEvidence = ["E-023", "E-024", "E-025"].some(has);
  const base: GateResult = {
    stage,
    readiness: "Insufficient",
    score: 0,
    blocks: [],
    challenges: [],
    consequences: [],
    nextAction: "",
  };

  if (stage === 1) {
    base.score = [
      has("E-018") ? 25 : 0,
      reviewedContradiction ? 20 : 0,
      problemReframed ? 25 : 0,
      state.uncertainties.length >= 2 ? 15 : 0,
      state.questions.length >= 3 ? 15 : 0,
    ].reduce((a, b) => a + b, 0);
    if (!has("E-018"))
      base.blocks.push(
        "Localizá el flujo dominante de desperdicio con evidencia directa.",
      );
    if (!reviewedContradiction)
      base.blocks.push(
        "Revisá la evidencia que cuestiona el supuesto sobre el comportamiento estudiantil.",
      );
    if (!problemReframed)
      base.blocks.push(
        "Reformulá el problema y citá qué evidencia produjo el cambio.",
      );
    if (!operationalEvidence)
      base.challenges.push(
        "El pronóstico todavía se trata como causa antes de comprender la flexibilidad operativa.",
      );
    base.nextAction = !has("E-018")
      ? "Solicitar mediciones de desperdicio"
      : !problemReframed
        ? "Crear Problema v2"
        : "Investigar flexibilidad operativa";
  } else if (stage === 2) {
    base.score = [
      state.opportunities.length ? 35 : 0,
      operationalEvidence ? 30 : 0,
      state.opportunities[0]?.evidenceIds.length >= 2 ? 20 : 0,
      state.decisions.length ? 15 : 0,
    ].reduce((a, b) => a + b, 0);
    if (!operationalEvidence)
      base.blocks.push(
        "Resolvé si operaciones puede actuar sobre una mejor señal de demanda.",
      );
    if (!state.opportunities.length)
      base.blocks.push(
        "Formulá una oportunidad vinculada a evidencia y a la incertidumbre restante.",
      );
    base.nextAction = !operationalEvidence
      ? "Investigar flexibilidad operativa"
      : "Formular y defender la oportunidad";
  } else if (stage === 3) {
    base.score = Math.min(
      100,
      state.alternatives.length * 22 +
        state.requirements.length * 8 +
        (state.decisions.some((d) =>
          d.title.toLowerCase().includes("alternative"),
        )
          ? 18
          : 0),
    );
    if (state.alternatives.length < 3)
      base.blocks.push(
        "Creá tres mecanismos sustancialmente diferentes antes de seleccionar uno.",
      );
    if (state.requirements.length < 2)
      base.challenges.push(
        "Los criterios de selección son débiles sin requisitos trazables.",
      );
    base.nextAction =
      "Comparar tres mecanismos alternativos y sus compensaciones";
  } else if (stage === 4) {
    base.score = Math.min(
      100,
      state.risks.length * 18 +
        state.decisions.length * 8 +
        state.acceptedRisks.length * 15,
    );
    if (!state.risks.length)
      base.blocks.push("Registrá riesgos de factibilidad y viabilidad.");
    if (!state.acceptedRisks.length)
      base.challenges.push(
        "Todo riesgo crítico no resuelto debe aceptarse explícitamente o investigarse.",
      );
    base.nextAction = "Tomar una decisión de avanzar, esperar o abandonar";
  } else if (stage === 5) {
    base.score = Math.min(
      100,
      state.experiments.length * 45 + state.hypotheses.length * 25,
    );
    if (!state.hypotheses.length)
      base.blocks.push(
        "Nombrá la creencia que podría cambiar la decisión de inversión.",
      );
    if (!state.experiments.length)
      base.blocks.push(
        "Registrá de antemano un criterio de éxito y un experimento.",
      );
    base.nextAction = "Diseñar la prueba menos costosa de la creencia crítica";
  } else if (stage === 6) {
    base.score = state.decisions.length >= 4 ? 70 : 45;
    base.challenges.push(
      "Secuenciá entregables según dependencias y riesgo de aprendizaje.",
    );
    base.nextAction = "Registrar la decisión de dirección de desarrollo";
  } else {
    base.score = state.decisions.length >= 5 ? 70 : 45;
    base.challenges.push(
      "Definí indicadores de resultado, operación y resguardo antes de escalar.",
    );
    base.nextAction = "Registrar la decisión de implementación y medición";
  }
  base.readiness = readiness(base.score);
  if (
    has("E-018") &&
    state.assumptions.find((a) => a.id === "A-03")?.status !== "Active"
  )
    base.consequences.push(
      "El comportamiento de los estudiantes en el plato deja de tratarse como objetivo principal de intervención.",
    );
  if (operationalEvidence)
    base.consequences.push(
      "Un experimento de producción por etapas es ahora una opción posterior factible.",
    );
  return base;
}

export function currentStage(state: StudentCaseState) {
  for (let i = 1; i <= 7; i += 1)
    if (!state.completedGates.includes(i)) return i;
  return 7;
}

export function stageAccess(
  state: StudentCaseState,
  stage: number,
): "Working" | "Preview" | "Not decision-ready" {
  const current = currentStage(state);
  if (stage <= current) return "Working";
  if (stage === current + 1) return "Preview";
  return "Not decision-ready";
}

export function evidenceHealth(state: StudentCaseState) {
  const active = state.claims.filter((claim) => claim.active);
  if (!active.length) return 0;
  const scores = active.map((claim) => {
    if (claim.status === "Assumed") return 10;
    const linked = availableEvidence(state).filter((item) =>
      claim.evidenceIds.includes(item.id),
    );
    if (!linked.length) return claim.status === "Known" ? 25 : 15;
    return Math.min(
      100,
      linked.reduce(
        (sum, item) => sum + { Low: 20, Medium: 35, High: 50 }[item.quality],
        0,
      ),
    );
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function getCurrentDecision(state: StudentCaseState) {
  const stage = currentStage(state);
  if (stage === 1)
    return "¿El problema dominante es el comportamiento del consumidor o las operaciones previas al consumo?";
  if (stage === 2)
    return "¿La producción por etapas sensible a la demanda es una oportunidad que vale la pena perseguir?";
  return (
    campusCase.stages[stage - 1]?.decision ??
    "¿Qué puede defender la evidencia disponible?"
  );
}
