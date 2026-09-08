import { NextResponse } from "next/server";

interface ReviewRequest {
  problem?: string;
  decision?: string;
  evidence?: string[];
  uncertainty?: string;
}

function deterministicReview(input: ReviewRequest) {
  const prompts = [
    input.evidence?.length
      ? `Citás ${input.evidence.length} fuentes. ¿Cuál distingue realmente causalidad de correlación?`
      : "¿Qué observación haría que esto fuera más que un relato plausible?",
    input.uncertainty
      ? `Mantenés esta incertidumbre: “${input.uncertainty}”. ¿Por qué es aceptable decidir antes de resolverla?`
      : "¿Qué incertidumbre podría revertir esta decisión?",
    input.decision
      ? `Tu compromiso propuesto es “${input.decision}”. ¿Qué compromiso reversible y de menor costo descartaste, y por qué?`
      : "Enunciá el compromiso con suficiente precisión como para que un revisor pueda estar en desacuerdo.",
  ];
  return { text: prompts.join(" "), provider: "deterministic" };
}

export async function POST(request: Request) {
  const input = (await request.json()) as ReviewRequest;
  const endpoint = process.env.LLM_REVIEWER_ENDPOINT;
  const apiKey = process.env.LLM_REVIEWER_API_KEY;
  if (!endpoint || !apiKey)
    return NextResponse.json(deterministicReview(input));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        task: "innovation-decision-adversarial-review",
        input,
        constraints: [
          "Hacé preguntas; no recomiendes una decisión.",
          "Usá únicamente el contexto provisto del caso.",
          "Devolvé JSON con un campo text.",
        ],
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`Provider returned ${response.status}`);
    const result = (await response.json()) as { text?: string };
    if (!result.text)
      throw new Error("La respuesta del proveedor no incluyó text");
    return NextResponse.json({ text: result.text, provider: "configured" });
  } catch {
    return NextResponse.json({
      ...deterministicReview(input),
      warning:
        "El revisor configurado no está disponible; se utilizó la revisión determinística.",
    });
  }
}
