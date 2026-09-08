# Innovation Decision Studio

Una V1 funcional de un simulador de innovación centrado en decisiones. El caso insignia es Laboratorio de Alimentación del Campus / Iniciativa de Desperdicio de Alimentos de Northbridge Institute.

## Stack

- Next.js App Router + React + TypeScript
- Persistencia local en el navegador mediante `localStorage`
- Caso inicial estructurado y determinístico
- Motor de gates basado en reglas con revisor adversarial externo opcional
- Dossier listo para imprimir y exportación del estado del caso en JSON

## Ejecución

```bash
npm install
npm run dev
```

Abrí `http://localhost:3000`. Para verificar la compilación de producción:

```bash
npm run build
npm start
```

## Arquitectura

```text
src/
  app/                 Shell de App Router, estilos y adaptador del revisor
  components/views/    Seis áreas de producto y tablero de la iniciativa
  domain/types.ts      Modelo de entidades del caso de decisión
  domain/seed.ts       Mundo y evidencia prediseñados de Campus Food Lab
  domain/engine.ts     Gates, preparación, acceso, impactos y salud de evidencia
  lib/use-case-state   Persistencia y mutaciones del trabajo del estudiante
```

El producto mantiene separadas las tres capas conceptuales:

- **Mundo del caso:** partes interesadas, documentos, evidencia, restricciones, eventos y acciones de investigación en `seed.ts`.
- **Espacio de decisión:** afirmaciones, versiones del problema, matriz de incertidumbres, oportunidad, alternativas, experimentos y dossier.
- **Motor de decisiones:** reglas de dependencia, puntajes de preparación, bloqueos, desafíos, consecuencias y acceso a etapas en `engine.ts`.

El caso diseñado y el trabajo del estudiante están separados. Reiniciar el estado del navegador recrea el mismo caso, mientras que clasificaciones, vínculos, elecciones de investigación, decisiones y progreso persisten de manera independiente.

## Modelo del caso

El modelo tipado cubre `Stakeholder`, `Observation`, `Evidence`, `Claim`, `Assumption`, `Constraint`, `Uncertainty`, `ResearchQuestion`, `Opportunity`, `Requirement`, `Alternative`, `Risk`, `Hypothesis`, `Experiment`, `Decision`, entregables e indicadores. Los ID y campos de relación permiten trazabilidad Afirmación ↔ Evidencia ↔ Decisión. Los artefactos y el dossier final son vistas derivadas y no duplican respuestas guardadas.

## Motor de decisiones

Cada etapa evalúa evidencia requerida, relaciones entre entidades, incertidumbres no resueltas y decisiones del estudiante. Devuelve un diagnóstico de preparación (`Insufficient`, `Fragile`, `Defensible` o `Robust`) y tres tipos de respuesta:

- `Dependency Block`: un prerrequisito metodológico impide avanzar.
- `Challenge`: la decisión podría defenderse, pero mantiene debilidades.
- `Consequence`: evidencia o decisiones anteriores afectan trabajo posterior.

El acceso a etapas depende de gates completados, nunca de visitas a pantallas. Las reglas de Campus Food Lab permanecen en los datos del caso o la lógica de dominio, no en los componentes visuales.

## Revisor LLM opcional

El MVP no requiere una API key. `/api/reviewer` devuelve preguntas determinísticas basadas en el contexto enviado. Para conectar un proveedor, copiá `.env.example` a `.env.local` y configurá:

```bash
LLM_REVIEWER_ENDPOINT=https://your-gateway.example/review
LLM_REVIEWER_API_KEY=your-secret
```

El endpoint recibe una solicitud JSON restringida y debe devolver `{ "text": "..." }`. Ante timeout, error o salida inválida, la ruta usa el revisor determinístico. El revisor recibe instrucciones de cuestionar el razonamiento y nunca recomendar una decisión.

## Implementado

- Caso insignia con 25 evidencias y seis partes interesadas parciales y sesgadas
- Seis áreas persistentes y siete etapas visibles
- Capacidad de investigación limitada y acciones determinísticas
- Clasificación Conocido / Inferido / Supuesto
- Vínculos Afirmación ↔ Evidencia y diagnósticos de calidad y contradicción
- Flujo de contradicción E-018, interpretación explícita y decisión automática
- Declaraciones del problema versionadas con citas obligatorias
- Preguntas de investigación y matriz de incertidumbres editables
- Bloqueo del espacio de solución según dependencias y gates progresivos
- Alternativas, requisitos, constructor de experimentos, decisiones y revisiones
- Dossier vivo de 12 secciones, impresión y exportación JSON
- Persistencia, reinicio, estados vacíos/carga/error y diseño adaptable

## Limitaciones actuales

- La V1 tiene un caso y un perfil local; no incluye autenticación ni base compartida.
- Las etapas posteriores son funcionales, pero tienen menor profundidad narrativa que problema y evidencia.
- Las conversaciones usan ramas de respuesta diseñadas, no chat libre.
- Modelado financiero, herramientas docentes, multijugador, voz y generación dinámica quedan fuera del alcance.

Los próximos pasos naturales son persistencia del lado servidor con cuentas, eventos más ricos por etapa, validación de esquemas de casos, revisión automática de impactos relacionales y adaptadores LLM específicos con observabilidad.
