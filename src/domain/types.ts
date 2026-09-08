export type EpistemicStatus = "Known" | "Inferred" | "Assumed";
export type Quality = "Low" | "Medium" | "High";
export type Readiness = "Insufficient" | "Fragile" | "Defensible" | "Robust";
export type Criticality = "Low" | "Medium" | "High" | "Critical";
export type UncertaintyStatus =
  "Open" | "Investigating" | "Resolved" | "Accepted risk";
export type DecisionStatus = "Active" | "Maintained" | "Modified" | "Reverted";

export interface RelationRef {
  type:
    | "claim"
    | "evidence"
    | "assumption"
    | "uncertainty"
    | "opportunity"
    | "requirement"
    | "alternative"
    | "hypothesis"
    | "decision"
    | "risk";
  id: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  perspective: string;
  bias: string;
  knows: string[];
  avatar: string;
  prompts: { question: string; answer: string; evidenceId?: string }[];
}

export interface CaseDocument {
  id: string;
  title: string;
  type: string;
  summary: string;
  content: string;
  available: boolean;
}

export interface Evidence {
  id: string;
  title: string;
  source: string;
  date: string;
  method: string;
  finding: string;
  inference: string;
  limitations: string;
  quality: Quality;
  supports: string[];
  contradicts: string[];
  available: boolean;
  actionId?: string;
}

export interface Claim {
  id: string;
  text: string;
  status: EpistemicStatus;
  evidenceIds: string[];
  contradictedBy: string[];
  active: boolean;
}

export interface Assumption {
  id: string;
  text: string;
  status: "Active" | "Challenged" | "Rejected";
  evidenceIds: string[];
}

export interface Constraint {
  id: string;
  text: string;
  category: string;
  evidenceIds: string[];
}
export interface ResearchQuestion {
  id: string;
  text: string;
  status: "Open" | "Answered";
  evidenceIds: string[];
}
export interface Observation {
  id: string;
  text: string;
  source: string;
  evidenceId?: string;
}

export interface Uncertainty {
  id: string;
  category:
    | "People / problem"
    | "Technical"
    | "Business"
    | "Operational"
    | "Regulatory"
    | "Impact";
  description: string;
  impact: Criticality;
  evidenceLevel: Quality;
  criticality: Criticality;
  status: UncertaintyStatus;
  evidenceIds: string[];
}

export interface ProblemVersion {
  version: number;
  statement: string;
  changedBecause: string;
  evidenceIds: string[];
  createdAt: string;
}

export interface Opportunity {
  id: string;
  statement: string;
  evidenceIds: string[];
  uncertaintyIds: string[];
  status: "Draft" | "Defensible";
}
export interface Requirement {
  id: string;
  text: string;
  sourceIds: string[];
  priority: "Must" | "Should" | "Could";
}
export interface Risk {
  id: string;
  text: string;
  likelihood: Criticality;
  impact: Criticality;
  mitigation: string;
}

export interface Alternative {
  id: string;
  name: string;
  mechanism: string;
  stakeholders: string;
  requirements: string;
  technology: string;
  cost: "Low" | "Medium" | "High";
  risks: string;
  effects: string;
  tradeoffs: string;
  selectionCriteria: string;
}

export interface Hypothesis {
  id: string;
  belief: string;
  expectedEvidence: string;
  falsifier: string;
  uncertaintyId: string;
}
export interface Experiment {
  id: string;
  hypothesis: string;
  neededEvidence: string;
  cheapestMethod: string;
  successCriterion: string;
  design: string;
  conclusion: string;
  outcome:
    | "Pending"
    | "Persevere"
    | "Modify"
    | "Pivot"
    | "Experiment again"
    | "Abandon";
}

export interface Deliverable {
  id: string;
  name: string;
  stage: number;
  sourceIds: string[];
  status: "Draft" | "Ready";
}
export interface KPI {
  id: string;
  name: string;
  definition: string;
  baseline: string;
  target: string;
  sourceIds: string[];
  type: "Outcome" | "Operational" | "Guardrail";
}
export interface CaseEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  evidenceId?: string;
}

export interface Decision {
  id: string;
  title: string;
  date: string;
  context: string;
  alternatives: string;
  evidenceIds: string[];
  assumptionIds: string[];
  risks: string;
  rationale: string;
  reviewCondition: string;
  status: DecisionStatus;
  affectedBy: string[];
}

export interface ResearchAction {
  id: string;
  label: string;
  description: string;
  cost: number;
  evidenceIds: string[];
  stakeholderId?: string;
  repeatable?: boolean;
}

export interface StageDefinition {
  id: number;
  short: string;
  title: string;
  decision: string;
}

export interface CaseDefinition {
  id: string;
  name: string;
  organization: string;
  brief: string;
  sponsorRequest: string;
  suggestedSolution: string;
  image: string;
  stakeholders: Stakeholder[];
  documents: CaseDocument[];
  evidence: Evidence[];
  researchActions: ResearchAction[];
  stages: StageDefinition[];
  events: CaseEvent[];
}

export interface StudentCaseState {
  caseId: string;
  researchCapacity: number;
  completedActions: string[];
  openedDocuments: string[];
  savedInterviewEvidence: string[];
  claims: Claim[];
  assumptions: Assumption[];
  observations: Observation[];
  constraints: Constraint[];
  questions: ResearchQuestion[];
  uncertainties: Uncertainty[];
  problemVersions: ProblemVersion[];
  opportunities: Opportunity[];
  requirements: Requirement[];
  alternatives: Alternative[];
  risks: Risk[];
  hypotheses: Hypothesis[];
  experiments: Experiment[];
  deliverables: Deliverable[];
  kpis: KPI[];
  decisions: Decision[];
  contradictionReviews: Record<string, "No" | "Partially" | "Yes">;
  acceptedRisks: string[];
  completedGates: number[];
  updatedAt: string;
}

export interface GateResult {
  stage: number;
  readiness: Readiness;
  score: number;
  blocks: string[];
  challenges: string[];
  consequences: string[];
  nextAction: string;
}
