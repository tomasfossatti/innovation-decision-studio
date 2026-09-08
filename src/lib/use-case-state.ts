"use client";

import { useCallback, useEffect, useState } from "react";
import { campusCase, createInitialState } from "@/domain/seed";
import type {
  Decision,
  EpistemicStatus,
  StudentCaseState,
  Uncertainty,
} from "@/domain/types";

const STORAGE_KEY = "ids:campus-food-lab:es:v2";

export function useCaseState() {
  const [state, setState] = useState<StudentCaseState>(createInitialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<StudentCaseState>;
          setState({ ...createInitialState(), ...parsed });
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, updatedAt: new Date().toISOString() }),
    );
  }, [state, hydrated]);

  const update = useCallback(
    (recipe: (current: StudentCaseState) => StudentCaseState) =>
      setState((current) => recipe(current)),
    [],
  );

  const runResearch = useCallback(
    (actionId: string) => {
      const action = campusCase.researchActions.find(
        (item) => item.id === actionId,
      );
      if (!action)
        return { ok: false, message: "Acción de investigación no encontrada." };
      if (state.completedActions.includes(actionId))
        return { ok: false, message: "Esta investigación ya está completada." };
      if (state.researchCapacity < action.cost)
        return {
          ok: false,
          message:
            "No queda capacidad de investigación. Revisá la evidencia ya reunida.",
        };
      update((current) => ({
        ...current,
        researchCapacity: current.researchCapacity - action.cost,
        completedActions: [...current.completedActions, actionId],
      }));
      return {
        ok: true,
        message: `${action.evidenceIds.length} tarjetas de evidencia agregadas.`,
      };
    },
    [state.completedActions, state.researchCapacity, update],
  );

  const linkEvidence = useCallback(
    (claimId: string, evidenceId: string) =>
      update((current) => ({
        ...current,
        claims: current.claims.map((claim) =>
          claim.id === claimId && !claim.evidenceIds.includes(evidenceId)
            ? { ...claim, evidenceIds: [...claim.evidenceIds, evidenceId] }
            : claim,
        ),
      })),
    [update],
  );

  const setClaimStatus = useCallback(
    (claimId: string, status: EpistemicStatus) =>
      update((current) => ({
        ...current,
        claims: current.claims.map((claim) =>
          claim.id === claimId ? { ...claim, status } : claim,
        ),
      })),
    [update],
  );

  const reviewContradiction = useCallback(
    (
      evidenceId: string,
      response: "No" | "Partially" | "Yes",
      explanation: string,
    ) => {
      update((current) => {
        const evidence = campusCase.evidence.find(
          (item) => item.id === evidenceId,
        );
        const assumptionIds =
          evidence?.contradicts.filter((id) => id.startsWith("A-")) ?? [];
        const decision: Decision = {
          id: `D-${String(current.decisions.length + 1).padStart(2, "0")}`,
          title:
            response === "Yes"
              ? "Rechazar el comportamiento estudiantil como explicación principal"
              : "Mantener parte de la interpretación inicial del desperdicio",
          date: new Date().toISOString().slice(0, 10),
          context: `Revisión activada por ${evidenceId}`,
          alternatives:
            "Mantener, revisar parcialmente o rechazar la interpretación inicial",
          evidenceIds: [evidenceId],
          assumptionIds,
          risks:
            "El período de medición limitado puede no representar todo el ciclo.",
          rationale: explanation,
          reviewCondition:
            "Revisar si una auditoría más amplia cambia materialmente la distribución medida de los flujos de desperdicio.",
          status: "Active",
          affectedBy: [],
        };
        return {
          ...current,
          contradictionReviews: {
            ...current.contradictionReviews,
            [evidenceId]: response,
          },
          assumptions: current.assumptions.map((item) =>
            assumptionIds.includes(item.id)
              ? {
                  ...item,
                  status: response === "Yes" ? "Rejected" : "Challenged",
                  evidenceIds: [...new Set([...item.evidenceIds, evidenceId])],
                }
              : item,
          ),
          claims: current.claims.map((item) =>
            evidence?.contradicts.includes(item.id)
              ? {
                  ...item,
                  active: response !== "Yes",
                  contradictedBy: [
                    ...new Set([...item.contradictedBy, evidenceId]),
                  ],
                }
              : item,
          ),
          decisions: [...current.decisions, decision],
        };
      });
    },
    [update],
  );

  const addProblemVersion = useCallback(
    (statement: string, changedBecause: string, evidenceIds: string[]) =>
      update((current) => ({
        ...current,
        problemVersions: [
          ...current.problemVersions,
          {
            version: current.problemVersions.length + 1,
            statement,
            changedBecause,
            evidenceIds,
            createdAt: new Date().toISOString().slice(0, 10),
          },
        ],
      })),
    [update],
  );

  const addUncertainty = useCallback(
    (uncertainty: Omit<Uncertainty, "id">) =>
      update((current) => ({
        ...current,
        uncertainties: [
          ...current.uncertainties,
          {
            ...uncertainty,
            id: `U-${String(current.uncertainties.length + 1).padStart(2, "0")}`,
          },
        ],
      })),
    [update],
  );

  const reset = useCallback(() => {
    const initial = createInitialState();
    setState(initial);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  }, []);

  return {
    state,
    setState,
    hydrated,
    update,
    runResearch,
    linkEvidence,
    setClaimStatus,
    reviewContradiction,
    addProblemVersion,
    addUncertainty,
    reset,
  };
}

export type CaseStateApi = ReturnType<typeof useCaseState>;
