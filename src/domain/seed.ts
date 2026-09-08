import type { CaseDefinition, StudentCaseState } from "./types";

export const stages = [
  {
    id: 1,
    short: "Problema",
    title: "Arquitectura del Problema y del Sistema",
    decision: "¿Qué está ocurriendo y qué necesitamos comprender?",
  },
  {
    id: 2,
    short: "Evidencia",
    title: "Investigación, Evidencia y Oportunidad",
    decision: "¿Existe una oportunidad que valga la pena abordar?",
  },
  {
    id: 3,
    short: "Solución",
    title: "Arquitectura de Solución",
    decision: "¿Qué mecanismo aborda mejor la oportunidad?",
  },
  {
    id: 4,
    short: "Avance",
    title: "Factibilidad, Viabilidad y Decisión de Avance",
    decision: "¿Vale la pena invertir en esto ahora?",
  },
  {
    id: 5,
    short: "Validar",
    title: "Prototipado y Aprendizaje Validado",
    decision: "¿Qué creencia crítica debemos poner a prueba?",
  },
  {
    id: 6,
    short: "Desarrollar",
    title: "Dirección del Desarrollo",
    decision: "¿Qué deberíamos construir y en qué orden?",
  },
  {
    id: 7,
    short: "Escalar",
    title: "Implementación, Medición y Escalado",
    decision: "¿Debemos implementar, adaptar, escalar o detenernos?",
  },
] satisfies CaseDefinition["stages"];

export const campusCase: CaseDefinition = {
  id: "campus-food-lab",
  name: "Iniciativa de Desperdicio de Alimentos",
  organization:
    "Northbridge Institute · Laboratorio de Alimentación del Campus",
  brief:
    "El comedor del campus informa que se descarta aproximadamente el 28% de la comida preparada. La cifra combina sobreproducción de cocina, pérdidas en la línea de servicio y desperdicio en los platos, pero el informe inicial no los separa de manera confiable.",
  sponsorRequest:
    "Reducir el desperdicio de alimentos un 40% en seis meses sin degradar el nivel de servicio ni la seguridad alimentaria.",
  suggestedSolution:
    "Instalar contenedores inteligentes con sensores en todo el comedor.",
  image: "/campus-kitchen.png",
  stages,
  events: [
    {
      id: "EV-01",
      date: "2026-05-04",
      title: "La dirección propone contenedores inteligentes",
      description:
        "Una demostración de un proveedor condiciona la solicitud del patrocinador antes de separar los flujos de desperdicio.",
    },
    {
      id: "EV-02",
      date: "2026-05-15",
      title: "Finaliza la auditoría de flujos de desperdicio",
      description:
        "Queda disponible el primer desglose directo entre desperdicio de cocina, línea de servicio y platos.",
      evidenceId: "E-018",
    },
    {
      id: "EV-03",
      date: "2026-05-20",
      title: "Operaciones confirma una ventana para el piloto",
      description:
        "Dos estaciones pueden probar producción por etapas usando el equipamiento actual.",
      evidenceId: "E-025",
    },
  ],
  stakeholders: [
    {
      id: "s-01",
      name: "Maya Chen",
      role: "Directora de Sostenibilidad",
      avatar: "MC",
      perspective:
        "Necesita un resultado de sostenibilidad visible y medible este semestre.",
      bias: "Prefiere soluciones que exhiban tecnología y puedan comunicarse públicamente.",
      knows: [
        "Objetivos institucionales",
        "Expectativas del patrocinador",
        "Informe inicial de desperdicio",
      ],
      prompts: [
        {
          question: "¿Por qué contenedores inteligentes?",
          answer:
            "Harían visible la iniciativa y nos darían datos continuos. El directorio vio un piloto en otra organización, aunque todavía no mapeamos nuestros propios flujos de desperdicio.",
        },
        {
          question: "¿Qué significaría tener éxito?",
          answer:
            "Cuarenta por ciento menos comida descartada en seis meses, manteniendo estables los reclamos y los tiempos de servicio.",
        },
        {
          question: "¿Dónde ocurre el desperdicio?",
          answer:
            "La cifra principal no distingue desperdicio de cocina y de platos. Supuse que el comportamiento estudiantil era una parte importante, pero eso no está medido.",
          evidenceId: "E-003",
        },
      ],
    },
    {
      id: "s-02",
      name: "Luis Ortega",
      role: "Responsable de Cocina",
      avatar: "LO",
      perspective:
        "Protege la continuidad del servicio, la seguridad y a un equipo que trabaja con tiempos muy ajustados.",
      bias: "Normaliza restricciones operativas que existen desde hace años.",
      knows: [
        "Rutinas de producción",
        "Restricciones de lotes",
        "Decisiones de turno",
      ],
      prompts: [
        {
          question: "¿Cómo deciden cuánto cocinar?",
          answer:
            "Usamos principalmente el promedio de las semanas anteriores. Los martes y jueves son impredecibles porque cambian las actividades y los horarios de clase.",
          evidenceId: "E-012",
        },
        {
          question: "¿Pueden ajustar la producción en tiempo real?",
          answer:
            "Muy poco. Una vez preparado un lote normalmente no podemos reutilizarlo al día siguiente, pero varios platos pueden cocinarse en tandas más pequeñas si planificamos el personal.",
          evidenceId: "E-013",
        },
        {
          question: "¿Qué dificulta producir un lote más pequeño?",
          answer:
            "La restricción no es sólo el pronóstico. También importan la capacidad de los hornos, los mínimos de receta, el personal de preparación y los tamaños de empaque de proveedores.",
        },
      ],
    },
    {
      id: "s-03",
      name: "Aisha Bello",
      role: "Representante de la Unión Estudiantil",
      avatar: "AB",
      perspective:
        "Los estudiantes quieren variedad, precios accesibles y suficiente comida al final del servicio.",
      bias: "Recuerda con mayor facilidad el desperdicio visible en platos que el desperdicio invisible de cocina.",
      knows: [
        "Hábitos estudiantiles",
        "Reclamos del comedor",
        "Horarios de clase",
      ],
      prompts: [
        {
          question: "¿Por qué los estudiantes dejan comida?",
          answer:
            "Las porciones son fijas para algunas comidas y a veces los estudiantes eligen platos que no conocen. Pero el mayor reclamo es que las opciones populares se terminan cerca de las 13:30.",
        },
        {
          question: "¿Ayudarían porciones más pequeñas?",
          answer:
            "Posiblemente, si se puede repetir. Servir menos sin más podría percibirse como un aumento de precio.",
        },
        {
          question: "¿Varía la demanda?",
          answer:
            "Mucho. Los eventos de clubes y los calendarios de exámenes desplazan el flujo de personas, pero el comedor rara vez recibe esa información con anticipación.",
          evidenceId: "E-009",
        },
      ],
    },
    {
      id: "s-04",
      name: "Noah Williams",
      role: "Responsable de Compras",
      avatar: "NW",
      perspective:
        "Equilibra precio, mínimos contractuales y confiabilidad de proveedores.",
      bias: "Interpreta la variación como un problema de abastecimiento.",
      knows: [
        "Registros de pedidos",
        "Contratos con proveedores",
        "Tamaños de empaque",
      ],
      prompts: [
        {
          question: "¿Los proveedores restringen la producción?",
          answer:
            "Algunos productos tienen mínimos semanales, pero la mayoría de los ingredientes refrigerados pueden pedirse en cantidades menores con un sobreprecio de 6–9%.",
        },
        {
          question: "¿Qué registros existen?",
          answer:
            "Tenemos doce meses de órdenes de compra por ingrediente, no por plato terminado. Vincularlos con el desperdicio requiere datos de recetas.",
          evidenceId: "E-015",
        },
        {
          question: "¿Pueden cambiar rápido las entregas?",
          answer:
            "Los proveedores principales necesitan 72 horas. Los proveedores locales pueden responder más rápido, pero su disponibilidad varía.",
        },
      ],
    },
    {
      id: "s-05",
      name: "Priya Raman",
      role: "Responsable de Seguridad Alimentaria",
      avatar: "PR",
      perspective:
        "Todo cambio operativo debe preservar el control de temperatura y la trazabilidad de alérgenos.",
      bias: "Da mucho peso a fallas de cumplimiento de baja probabilidad.",
      knows: [
        "Política de seguridad",
        "Límites de reutilización",
        "Hallazgos de auditoría",
      ],
      prompts: [
        {
          question: "¿Se pueden reutilizar sobrantes?",
          answer:
            "Algunos componentes sin servir pueden enfriarse y reutilizarse bajo controles estrictos. Los platos mezclados de la línea caliente normalmente no. La regla general actual es más conservadora que lo exigido por la regulación.",
          evidenceId: "E-017",
        },
        {
          question: "¿Los lotes más pequeños podrían generar riesgo?",
          answer:
            "Más cambios de lote implican más controles de temperatura. Es manejable, pero el flujo de trabajo y la responsabilidad deben ser explícitos.",
        },
        {
          question: "¿Hubo incidentes recientes?",
          answer:
            "No hubo incidentes críticos durante el último año. Dos auditorías señalaron registros manuales de temperatura incompletos.",
        },
      ],
    },
    {
      id: "s-06",
      name: "Ethan Brooks",
      role: "Analista de Datos de Planificación",
      avatar: "EB",
      perspective:
        "Ve datos fragmentados y cruces débiles entre planificación, transacciones y producción.",
      bias: "Tiende a tratar la disponibilidad de datos como el principal cuello de botella.",
      knows: [
        "Datos de punto de venta",
        "Calendario académico",
        "Factibilidad del pronóstico",
      ],
      prompts: [
        {
          question: "¿Se puede predecir la demanda?",
          answer:
            "Probablemente mejor que con un promedio semanal. Existen históricos de ventas y señales de horarios, pero los registros de producción están incompletos; la precisión del modelo por sí sola no demostraría impacto operativo.",
        },
        {
          question: "¿Qué señal importa más?",
          answer:
            "El día de la semana, el menú, el clima y los eventos del campus parecen prometedores. Necesitamos una línea base limpia antes de afirmar causalidad.",
          evidenceId: "E-021",
        },
        {
          question: "¿Qué falta?",
          answer:
            "Horarios y cantidades reales de cada lote. Sin ellos no podemos distinguir error de predicción de decisiones de ejecución.",
        },
      ],
    },
  ],
  documents: [
    {
      id: "doc-01",
      title: "Informe de Desperdicio · T2",
      type: "Informe operativo",
      summary:
        "Estimación principal del desperdicio y un problema de medición no resuelto.",
      available: true,
      content:
        "La auditoría del T2 estima que se descarta el 28% de la comida preparada. Los datos combinan descartes de cocina, devoluciones de la línea de servicio y una muestra de desperdicio en platos. La medición cubrió 10 días de servicio; faltan dos turnos de cena.",
    },
    {
      id: "doc-02",
      title: "Correo de Sostenibilidad",
      type: "Nota del patrocinador",
      summary: "Objetivo, cronograma y tecnología sugerida por la dirección.",
      available: true,
      content:
        "Evalúen una iniciativa de seis meses para reducir el desperdicio un 40%. La dirección está interesada en contenedores inteligentes después de ver una demostración de un proveedor. Necesitamos una propuesta antes de la próxima revisión presupuestaria.",
    },
    {
      id: "doc-03",
      title: "Panorama de Operaciones del Comedor",
      type: "Resumen de proceso",
      summary:
        "Desde la planificación de demanda hasta la preparación y el servicio.",
      available: true,
      content:
        "Los menús se planifican con cuatro semanas de anticipación. Las cantidades parten de promedios de semanas anteriores y se ajustan informalmente. La preparación empieza a las 07:00 y el almuerzo funciona de 11:30 a 14:00. La comida caliente restante normalmente se descarta.",
    },
    {
      id: "doc-04",
      title: "Medición de Flujos de Desperdicio",
      type: "Informe de datos",
      summary: "Separa el desperdicio previo y posterior al consumo.",
      available: false,
      content:
        "En cinco servicios de almuerzo medidos, el 64% del peso de comida descartada nunca salió de la cocina. El desperdicio en platos representó el 23% y las pérdidas de línea y manipulación, el 13%.",
    },
    {
      id: "doc-05",
      title: "Producción vs. Demanda",
      type: "Resumen del conjunto de datos",
      summary: "Muestra patrones de desajuste por día de servicio.",
      available: false,
      content:
        "La sobreproducción varía entre 8% y 37%. La alta variación se concentra los martes y jueves con muchos eventos. El error de pronóstico explica parte, pero no toda, la variación de los lotes.",
    },
    {
      id: "doc-06",
      title: "Evaluación de Flexibilidad de Lotes",
      type: "Informe de operaciones",
      summary:
        "Evalúa si producción puede responder a una demanda actualizada.",
      available: false,
      content:
        "Cuatro de siete platos con alto desperdicio pueden pasar a lotes por etapas con el equipamiento actual. Tres requieren cambios de receta, personal o tamaño de empaque. Es factible un piloto de dos semanas.",
    },
  ],
  evidence: [
    {
      id: "E-001",
      title: "Tasa de desperdicio reportada",
      source: "Informe de Desperdicio T2",
      date: "2026-04-30",
      method: "Auditoría de desperdicio de 10 días",
      finding: "Se registró como descartado el 28% de la comida preparada.",
      inference: "El nivel total de desperdicio es material.",
      limitations:
        "Flujos de desperdicio combinados; faltan dos turnos de cena.",
      quality: "Medium",
      supports: ["C-01"],
      contradicts: [],
      available: true,
    },
    {
      id: "E-002",
      title: "Objetivo de reducción",
      source: "Correo del patrocinador",
      date: "2026-05-04",
      method: "Solicitud de la dirección",
      finding: "El patrocinador solicita una reducción del 40% en seis meses.",
      inference: "La iniciativa tiene un objetivo con plazo definido.",
      limitations: "El objetivo no está vinculado a una línea base validada.",
      quality: "Medium",
      supports: ["C-02"],
      contradicts: [],
      available: true,
    },
    {
      id: "E-003",
      title: "Fuente del desperdicio no separada",
      source: "Directora de Sostenibilidad",
      date: "2026-05-07",
      method: "Entrevista con parte interesada",
      finding:
        "El informe principal no distingue desperdicio de cocina y de platos.",
      inference:
        "Todavía no se puede afirmar que el comportamiento estudiantil sea la causa dominante.",
      limitations: "El patrocinador no participa de la operación cotidiana.",
      quality: "Medium",
      supports: ["C-03"],
      contradicts: ["A-03"],
      available: false,
      actionId: "ra-sponsor",
    },
    {
      id: "E-004",
      title: "Menú fijado con cuatro semanas de anticipación",
      source: "Panorama de Operaciones",
      date: "2026-04-18",
      method: "Revisión documental",
      finding: "Los menús se fijan cuatro semanas antes del servicio.",
      inference:
        "Algunas decisiones de planificación tienen tiempos de anticipación largos.",
      limitations: "No describe el ajuste de cantidades.",
      quality: "High",
      supports: ["C-04"],
      contradicts: [],
      available: true,
    },
    {
      id: "E-005",
      title: "Ajuste informal de cantidades",
      source: "Panorama de Operaciones",
      date: "2026-04-18",
      method: "Revisión documental",
      finding:
        "Los planificadores ajustan informalmente los promedios de semanas anteriores.",
      inference:
        "El proceso de planificación no está parametrizado de manera consistente.",
      limitations: "No se proporciona una comparación de precisión.",
      quality: "Medium",
      supports: ["C-05"],
      contradicts: [],
      available: true,
    },
    {
      id: "E-006",
      title: "Faltan dos turnos de cena",
      source: "Informe de Desperdicio T2",
      date: "2026-04-30",
      method: "Revisión de calidad de datos",
      finding: "Dos turnos de cena están ausentes de la auditoría.",
      inference: "La línea base del 28% tiene limitaciones de cobertura.",
      limitations: "Se desconoce el efecto sobre la tasa principal.",
      quality: "High",
      supports: ["C-06"],
      contradicts: [],
      available: true,
    },
    {
      id: "E-007",
      title: "Muestra de desperdicio en platos",
      source: "Muestra de bandejas estudiantiles",
      date: "2026-05-09",
      method: "Observación de 48 bandejas",
      finding:
        "El desperdicio visible en platos varía sustancialmente según el ítem del menú.",
      inference:
        "La aceptación del menú puede afectar parte del desperdicio posterior al consumo.",
      limitations: "Un almuerzo, muestra por conveniencia.",
      quality: "Low",
      supports: ["C-07"],
      contradicts: [],
      available: false,
      actionId: "ra-students",
    },
    {
      id: "E-008",
      title: "Elección de porción",
      source: "Entrevistas a estudiantes",
      date: "2026-05-09",
      method: "8 entrevistas de interceptación",
      finding:
        "Seis estudiantes dijeron que no podían elegir el tamaño de la porción del plato principal.",
      inference:
        "Las porciones fijas pueden contribuir al desperdicio en platos.",
      limitations: "Muestra pequeña y autoseleccionada.",
      quality: "Low",
      supports: ["C-07"],
      contradicts: [],
      available: false,
      actionId: "ra-students",
    },
    {
      id: "E-009",
      title: "Flujo determinado por horarios",
      source: "Representante de la Unión Estudiantil",
      date: "2026-05-10",
      method: "Entrevista con parte interesada",
      finding:
        "Los eventos de clubes y los calendarios de exámenes desplazan el flujo del comedor.",
      inference:
        "Señales conocidas del calendario pueden mejorar la planificación de demanda.",
      limitations: "La percepción no está cruzada con datos de transacciones.",
      quality: "Low",
      supports: ["C-05"],
      contradicts: [],
      available: false,
      actionId: "ra-students",
    },
    {
      id: "E-010",
      title: "Faltantes al final del servicio",
      source: "Observación del almuerzo",
      date: "2026-05-11",
      method: "Observación estructurada",
      finding:
        "Dos platos populares se agotaron mientras otros permanecieron con exceso de stock.",
      inference:
        "El volumen agregado no es el único problema de planificación; la mezcla importa.",
      limitations: "Un único período de servicio.",
      quality: "Medium",
      supports: ["C-08"],
      contradicts: [],
      available: false,
      actionId: "ra-observe",
    },
    {
      id: "E-011",
      title: "Ajustes no registrados",
      source: "Observación del almuerzo",
      date: "2026-05-11",
      method: "Observación estructurada",
      finding:
        "Los supervisores cambiaron verbalmente las cantidades de los lotes sin registrar el motivo.",
      inference:
        "Las decisiones de ejecución no aparecen en la traza de datos.",
      limitations: "El comportamiento observado podría no ser típico.",
      quality: "Medium",
      supports: ["C-09"],
      contradicts: [],
      available: false,
      actionId: "ra-observe",
    },
    {
      id: "E-012",
      title: "Planificación por promedio histórico",
      source: "Responsable de Cocina",
      date: "2026-05-12",
      method: "Entrevista con parte interesada",
      finding:
        "La producción se basa principalmente en promedios de semanas anteriores.",
      inference:
        "La planificación actual se adapta poco a señales previsibles de demanda.",
      limitations: "Práctica reportada; todavía no hay cálculo de precisión.",
      quality: "Medium",
      supports: ["C-05"],
      contradicts: [],
      available: false,
      actionId: "ra-kitchen",
    },
    {
      id: "E-013",
      title: "Ajuste limitado en tiempo real",
      source: "Responsable de Cocina",
      date: "2026-05-12",
      method: "Entrevista con parte interesada",
      finding:
        "El ajuste es limitado una vez iniciado un lote; algunos platos podrían producirse en tandas menores.",
      inference: "La flexibilidad operativa varía según el plato.",
      limitations: "Requiere verificación mediante un piloto.",
      quality: "Medium",
      supports: ["C-10"],
      contradicts: ["A-07"],
      available: false,
      actionId: "ra-kitchen",
    },
    {
      id: "E-014",
      title: "Variabilidad en pedidos de ingredientes",
      source: "Registros de compras",
      date: "2026-05-13",
      method: "Revisión de registros de 12 meses",
      finding:
        "Las cantidades pedidas varían menos que los cubiertos servidos.",
      inference:
        "Compras puede reducir la capacidad de respuesta a la demanda.",
      limitations:
        "Los ingredientes no están mapeados limpiamente a los platos.",
      quality: "Medium",
      supports: ["C-11"],
      contradicts: [],
      available: false,
      actionId: "ra-purchasing",
    },
    {
      id: "E-015",
      title: "Mínimos de proveedores",
      source: "Responsable de Compras",
      date: "2026-05-13",
      method: "Revisión de registros + entrevista",
      finding:
        "Es posible pedir cantidades menores de la mayoría de los productos refrigerados con un sobreprecio de 6–9%.",
      inference:
        "Los mínimos de proveedores son una compensación, no una restricción rígida universal.",
      limitations: "La disponibilidad varía según el proveedor.",
      quality: "High",
      supports: ["C-11"],
      contradicts: ["A-06"],
      available: false,
      actionId: "ra-purchasing",
    },
    {
      id: "E-016",
      title: "Práctica general de descarte",
      source: "Registros de operaciones",
      date: "2026-05-14",
      method: "Revisión de procedimiento",
      finding:
        "La mayor parte de la comida restante de la línea caliente se registra como descartada.",
      inference:
        "La política actual puede sobredimensionar el desperdicio inevitable.",
      limitations:
        "Los registros no identifican elegibilidad según seguridad alimentaria.",
      quality: "Medium",
      supports: ["C-12"],
      contradicts: [],
      available: false,
      actionId: "ra-flexibility",
    },
    {
      id: "E-017",
      title: "Reutilización segura selectiva",
      source: "Responsable de Seguridad Alimentaria",
      date: "2026-05-14",
      method: "Entrevista sobre políticas",
      finding:
        "Algunos componentes no servidos pueden reutilizarse con enfriamiento controlado y trazabilidad.",
      inference: "La regla general actual es más restrictiva de lo necesario.",
      limitations: "No se evaluó el costo del flujo de trabajo.",
      quality: "High",
      supports: ["C-12"],
      contradicts: ["A-08"],
      available: false,
      actionId: "ra-flexibility",
    },
    {
      id: "E-018",
      title: "La mayor parte del desperdicio nunca sale de cocina",
      source: "Medición de Flujos de Desperdicio",
      date: "2026-05-15",
      method: "Auditoría pesada de cinco servicios",
      finding:
        "El 64% de la comida descartada medida nunca salió de cocina; el desperdicio en platos fue 23%.",
      inference:
        "En esta muestra, los procesos previos al consumo explican más desperdicio que el comportamiento estudiantil en el plato.",
      limitations:
        "Cinco servicios de almuerzo; variación estacional desconocida.",
      quality: "High",
      supports: ["C-13"],
      contradicts: ["A-03", "C-02"],
      available: false,
      actionId: "ra-measure",
    },
    {
      id: "E-019",
      title: "Concentración por plato",
      source: "Medición de Flujos de Desperdicio",
      date: "2026-05-15",
      method: "Análisis de composición del desperdicio",
      finding:
        "Cuatro platos representan el 58% del peso del desperdicio de cocina.",
      inference:
        "Una intervención focalizada puede superar un despliegue en todo el sistema.",
      limitations:
        "El costo y el impacto ambiental difieren según el ingrediente.",
      quality: "High",
      supports: ["C-14"],
      contradicts: [],
      available: false,
      actionId: "ra-measure",
    },
    {
      id: "E-020",
      title: "Pérdidas en la línea de servicio",
      source: "Medición de Flujos de Desperdicio",
      date: "2026-05-15",
      method: "Separación de flujos de desperdicio",
      finding:
        "Las pérdidas de línea de servicio y manipulación representan el 13% del desperdicio medido.",
      inference: "Este flujo es secundario pero material.",
      limitations: "Las categorías causales fueron asignadas por el personal.",
      quality: "Medium",
      supports: ["C-15"],
      contradicts: [],
      available: false,
      actionId: "ra-measure",
    },
    {
      id: "E-021",
      title: "Patrón de variación de demanda",
      source: "Conjunto de datos de Producción vs. Demanda",
      date: "2026-05-18",
      method: "Comparación de serie temporal de 40 días",
      finding:
        "La sobreproducción varía entre 8% y 37% y se concentra los martes y jueves con muchos eventos.",
      inference:
        "Una planificación sensible al calendario podría reducir parte del desajuste.",
      limitations:
        "Los registros de producción contienen estimaciones manuales.",
      quality: "High",
      supports: ["C-16"],
      contradicts: [],
      available: false,
      actionId: "ra-demand",
    },
    {
      id: "E-022",
      title: "El pronóstico no es suficiente",
      source: "Conjunto de datos de Producción vs. Demanda",
      date: "2026-05-18",
      method: "Descomposición de varianza",
      finding:
        "El error de pronóstico explica sólo parte de la variación de los lotes.",
      inference:
        "Las reglas de ejecución y las restricciones de lotes también requieren atención.",
      limitations: "El modelo es exploratorio, no causal.",
      quality: "Medium",
      supports: ["C-17"],
      contradicts: ["A-07"],
      available: false,
      actionId: "ra-demand",
    },
    {
      id: "E-023",
      title: "Cuatro platos admiten lotes por etapas",
      source: "Evaluación de Flexibilidad de Lotes",
      date: "2026-05-20",
      method: "Revisión de recetas y equipamiento",
      finding:
        "Cuatro de siete platos con alto desperdicio pueden pasar a lotes por etapas con el equipamiento existente.",
      inference:
        "La respuesta operativa es posible para un subconjunto relevante.",
      limitations: "El impacto en el personal es estimado, no observado.",
      quality: "High",
      supports: ["C-18"],
      contradicts: [],
      available: false,
      actionId: "ra-flexibility",
    },
    {
      id: "E-024",
      title: "Tres platos requieren rediseño",
      source: "Evaluación de Flexibilidad de Lotes",
      date: "2026-05-20",
      method: "Análisis de restricciones",
      finding:
        "Tres platos con alto desperdicio requieren cambios de receta, personal o tamaño de empaque.",
      inference: "Un único mecanismo no servirá para todo el menú.",
      limitations: "Todavía no se probaron recetas alternativas.",
      quality: "High",
      supports: ["C-18"],
      contradicts: [],
      available: false,
      actionId: "ra-flexibility",
    },
    {
      id: "E-025",
      title: "El piloto es operacionalmente factible",
      source: "Evaluación de Flexibilidad de Lotes",
      date: "2026-05-20",
      method: "Taller de operaciones",
      finding:
        "Un piloto de producción por etapas de dos semanas puede ejecutarse con el equipamiento actual en dos estaciones.",
      inference: "El mecanismo central puede probarse a bajo costo.",
      limitations: "Requiere cambios temporales en la planificación de turnos.",
      quality: "Medium",
      supports: ["C-19"],
      contradicts: [],
      available: false,
      actionId: "ra-flexibility",
    },
  ],
  researchActions: [
    {
      id: "ra-students",
      label: "Entrevistar estudiantes",
      description:
        "Investigar porciones, aceptación del menú y efectos de los horarios.",
      cost: 1,
      evidenceIds: ["E-007", "E-008", "E-009"],
      stakeholderId: "s-03",
    },
    {
      id: "ra-kitchen",
      label: "Entrevistar a la Responsable de Cocina",
      description: "Comprender planificación, lotes y ajustes en tiempo real.",
      cost: 1,
      evidenceIds: ["E-012", "E-013"],
      stakeholderId: "s-02",
    },
    {
      id: "ra-observe",
      label: "Observar el servicio de almuerzo",
      description:
        "Observar decisiones de producción y comportamiento de la línea de servicio.",
      cost: 1,
      evidenceIds: ["E-010", "E-011"],
    },
    {
      id: "ra-purchasing",
      label: "Solicitar registros de compras",
      description: "Evaluar restricciones de proveedores y tamaños de empaque.",
      cost: 1,
      evidenceIds: ["E-014", "E-015"],
      stakeholderId: "s-04",
    },
    {
      id: "ra-measure",
      label: "Solicitar mediciones de desperdicio",
      description: "Separar desperdicio de cocina, línea de servicio y platos.",
      cost: 1,
      evidenceIds: ["E-018", "E-019", "E-020"],
    },
    {
      id: "ra-demand",
      label: "Datos de producción vs. demanda",
      description:
        "Comparar volumen planificado con patrones reales de demanda.",
      cost: 1,
      evidenceIds: ["E-021", "E-022"],
    },
    {
      id: "ra-flexibility",
      label: "Investigar flexibilidad operativa",
      description:
        "Evaluar si un cambio de demanda puede modificar la producción.",
      cost: 1,
      evidenceIds: ["E-016", "E-017", "E-023", "E-024", "E-025"],
    },
  ],
};

export function createInitialState(): StudentCaseState {
  return {
    caseId: campusCase.id,
    researchCapacity: 4,
    completedActions: [],
    openedDocuments: [],
    savedInterviewEvidence: [],
    claims: [
      {
        id: "C-01",
        text: "El desperdicio es material: aproximadamente 28% de la comida preparada.",
        status: "Known",
        evidenceIds: ["E-001"],
        contradictedBy: [],
        active: true,
      },
      {
        id: "C-02",
        text: "Los estudiantes que toman demasiada comida son la fuente dominante del desperdicio.",
        status: "Assumed",
        evidenceIds: [],
        contradictedBy: ["E-018"],
        active: true,
      },
      {
        id: "C-03",
        text: "El informe actual no permite localizar el flujo dominante de desperdicio.",
        status: "Known",
        evidenceIds: ["E-006"],
        contradictedBy: [],
        active: true,
      },
    ],
    assumptions: [
      {
        id: "A-03",
        text: "Que los estudiantes se sirvan demasiado es la causa principal.",
        status: "Active",
        evidenceIds: [],
      },
      {
        id: "A-06",
        text: "Los mínimos de proveedores impiden producir volúmenes menores.",
        status: "Active",
        evidenceIds: [],
      },
      {
        id: "A-07",
        text: "Un mejor pronóstico reducirá automáticamente el desperdicio.",
        status: "Active",
        evidenceIds: [],
      },
      {
        id: "A-08",
        text: "Ningún componente preparado puede reutilizarse de forma segura.",
        status: "Active",
        evidenceIds: [],
      },
    ],
    observations: [
      {
        id: "O-01",
        text: "El patrocinador solicitó una tecnología antes de separar los flujos de desperdicio.",
        source: "Ingreso del caso",
      },
    ],
    constraints: [
      {
        id: "K-01",
        text: "La iniciativa debe mostrar resultados en seis meses.",
        category: "Tiempo",
        evidenceIds: ["E-002"],
      },
      {
        id: "K-02",
        text: "El nivel de servicio y la seguridad alimentaria no pueden degradarse.",
        category: "Operación",
        evidenceIds: [],
      },
    ],
    questions: [
      {
        id: "RQ-01",
        text: "¿En qué etapa se genera el desperdicio?",
        status: "Open",
        evidenceIds: [],
      },
      {
        id: "RQ-02",
        text: "¿Qué productos representan el mayor volumen?",
        status: "Open",
        evidenceIds: [],
      },
      {
        id: "RQ-03",
        text: "¿Cómo decide cocina cuánto preparar?",
        status: "Open",
        evidenceIds: [],
      },
    ],
    uncertainties: [
      {
        id: "U-01",
        category: "People / problem",
        description:
          "¿En qué parte del sistema se genera la mayor parte del desperdicio?",
        impact: "Critical",
        evidenceLevel: "Low",
        criticality: "Critical",
        status: "Open",
        evidenceIds: [],
      },
      {
        id: "U-02",
        category: "Operational",
        description:
          "¿Puede operaciones ajustar la producción cuando cambia la demanda?",
        impact: "Critical",
        evidenceLevel: "Low",
        criticality: "Critical",
        status: "Open",
        evidenceIds: [],
      },
    ],
    problemVersions: [
      {
        version: 1,
        statement:
          "Los estudiantes desperdician demasiada comida en el comedor del campus.",
        changedBecause: "Encuadre inicial de la dirección",
        evidenceIds: [],
        createdAt: "2026-05-04",
      },
    ],
    opportunities: [],
    requirements: [],
    alternatives: [],
    risks: [],
    hypotheses: [],
    experiments: [],
    deliverables: [],
    kpis: [],
    decisions: [],
    contradictionReviews: {},
    acceptedRisks: [],
    completedGates: [],
    updatedAt: new Date().toISOString(),
  };
}
