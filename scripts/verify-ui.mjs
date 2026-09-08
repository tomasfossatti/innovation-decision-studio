import { chromium } from "playwright-core";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const baseURL = process.env.VERIFY_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({
  headless: true,
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));
await mkdir("artifacts", { recursive: true });

const nav = async (name) =>
  page
    .getByRole("navigation", { name: "Navegación principal" })
    .locator("button")
    .filter({ hasText: name })
    .click();
const fillGate = async (prefix) => {
  const form = page.locator(".gate-form");
  const fields = form.locator("textarea");
  await fields
    .nth(0)
    .fill(`${prefix}: avanzar según el límite actual de la evidencia.`);
  await fields
    .nth(1)
    .fill(
      "Se consideraron un compromiso centrado en tecnología y la opción de no actuar.",
    );
  await fields
    .nth(2)
    .fill("La variación por plato permanece y requiere seguimiento.");
  await fields
    .nth(3)
    .fill("Una auditoría mayor con una distribución materialmente diferente.");
  await fields
    .nth(4)
    .fill(
      "Las fuentes triangulan ubicación, práctica de planificación y capacidad operativa de actuar.",
    );
};

try {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page
    .getByRole("heading", {
      name: "Iniciativa de Desperdicio de Alimentos",
      exact: true,
    })
    .waitFor();
  assert.equal(
    await page.locator("[data-nextjs-dialog]").count(),
    0,
    "Next.js error overlay present",
  );
  await page.screenshot({
    path: "artifacts/dashboard-desktop.png",
    fullPage: true,
  });

  await nav("Construir");
  await page
    .getByRole("heading", { name: "Espacio de solución no disponible" })
    .waitFor();

  await nav("Decisiones");
  await page.getByRole("button", { name: "Registrar decisión" }).click();
  const manual = page.locator(".decision-modal");
  await manual
    .getByLabel("Decisión", { exact: true })
    .fill("Mantener el comportamiento estudiantil como explicación de trabajo");
  await manual
    .getByLabel("Contexto")
    .fill("Encuadre inicial de la dirección previo a la medición de flujos.");
  await manual
    .getByLabel("Alternativas consideradas")
    .fill("Sobreproducción de cocina y gestión de la línea de servicio.");
  await manual.locator(".citation-picker label").first().click();
  await manual.locator(".check-grid label").first().click();
  await manual
    .getByLabel("Riesgos")
    .fill("La línea base combinada puede ocultar la fuente dominante.");
  await manual
    .getByLabel("Motivo")
    .fill(
      "Este es un compromiso provisorio para probar la revisión posterior de decisiones.",
    );
  await manual
    .getByLabel("Condición de revisión")
    .fill("Revisar cuando exista una medición directa de los flujos.");
  await manual.getByRole("button", { name: "Registrar decisión" }).click();

  await nav("Caso");
  await page
    .locator(".subtabs button")
    .filter({ hasText: "Acciones de investigación" })
    .click();
  for (const action of [
    "Entrevistar a la Responsable de Cocina",
    "Solicitar mediciones de desperdicio",
    "Datos de producción vs. demanda",
    "Investigar flexibilidad operativa",
  ]) {
    const card = page
      .locator(".research-list article")
      .filter({ hasText: action });
    await card.getByRole("button", { name: "Encargar" }).click();
  }
  await page.getByText("0", { exact: true }).first().waitFor();

  await nav("Evidencia");
  await page
    .getByRole("button", {
      name: /Nueva evidencia contradictoria requiere interpretación/,
    })
    .click();
  await page
    .getByLabel("Explicá tu razonamiento")
    .fill(
      "La evidencia medida ubica la mayor parte del desperdicio antes del consumo, por lo que el comportamiento estudiantil no puede seguir como explicación principal, aunque todavía contribuya.",
    );
  await page
    .getByRole("button", { name: "Registrar interpretación y decisión" })
    .click();
  await page
    .locator(".subtabs button")
    .filter({ hasText: "Afirmaciones y supuestos" })
    .click();
  const c3 = page.locator(".claim-list article").filter({ hasText: "C-03" });
  await c3.getByRole("button", { name: "Vincular evidencia" }).click();
  await page
    .locator(".link-options button")
    .filter({ hasText: "E-018" })
    .click();

  await nav("Modelo");
  await page.getByRole("button", { name: /Crear Problema v2/ }).click();
  await page.getByRole("button", { name: "Guardar nueva versión" }).click();
  await page
    .locator(".subtabs button")
    .filter({ hasText: "Oportunidad" })
    .click();
  await page.getByRole("button", { name: "Formular oportunidad" }).click();

  await nav("Decisiones");
  await page
    .getByRole("button", { name: "Poner a prueba el razonamiento" })
    .click();
  await page.locator(".reviewer-box p").waitFor();
  await fillGate(
    "Descartar el comportamiento del consumidor como encuadre dominante",
  );
  await page
    .getByRole("button", { name: "Defender decisión y avanzar" })
    .click();
  await page.getByText("GATE DE LA ETAPA 2", { exact: true }).waitFor();
  await fillGate("Perseguir la producción adaptativa como oportunidad");
  await page
    .getByRole("button", { name: "Defender decisión y avanzar" })
    .click();

  await nav("Construir");
  await page
    .getByText("Compará mecanismos, no variantes cosméticas", { exact: true })
    .waitFor();

  await nav("Decisiones");
  await page
    .locator(".subtabs button")
    .filter({ hasText: "Registro de decisiones" })
    .click();
  const impacted = page
    .locator(".decision-card")
    .filter({ hasText: "E-018 afecta D-01" });
  await impacted.getByRole("button", { name: "Revisar" }).click();
  await page.getByRole("button", { name: /Mantenida/ }).click();

  await nav("Dossier");
  await page.getByText("Problema v2", { exact: true }).waitFor();
  await page.getByText("E-018", { exact: true }).last().waitFor();
  await page.screenshot({
    path: "artifacts/dossier-desktop.png",
    fullPage: true,
  });

  await page.reload({ waitUntil: "networkidle" });
  await nav("Construir");
  await page
    .getByText("Compará mecanismos, no variantes cosméticas", { exact: true })
    .waitFor();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  assert.ok(
    overflow <= 1,
    `Mobile page overflows horizontally by ${overflow}px`,
  );
  await page.screenshot({ path: "artifacts/build-mobile.png", fullPage: true });

  assert.deepEqual(errors, [], `Browser console errors: ${errors.join("\n")}`);
  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: [
          "tablero renderizado",
          "bloqueo de dependencia inicial",
          "capacidad de investigación",
          "revisión de contradicción",
          "vínculo afirmación-evidencia",
          "versión del problema",
          "gate de oportunidad",
          "revisor determinístico",
          "desbloqueo progresivo",
          "revisión de impacto en decisión",
          "dossier derivado",
          "persistencia tras recarga",
          "desborde móvil",
        ],
        screenshots: [
          "artifacts/dashboard-desktop.png",
          "artifacts/dossier-desktop.png",
          "artifacts/build-mobile.png",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
