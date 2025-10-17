┌─────────────────────────────────────────────────────────────────┐
│                    USUARIO ENVÍA PREGUNTA                        │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │  1️⃣ RECIBIR MENSAJE EN stream.js  │
        │  (api/chat/stream.js)             │
        │  messageContent = pregunta         │
        └───────────────┬───────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────────────────────┐
        │  2️⃣ CLASIFICAR QUERY con needsKnowledgeBase()        │
        │  ├─ Busca PALABRAS CLAVE Nuxchain                     │
        │  ├─ Busca PATRONES GENÉRICOS (What is blockchain?)   │
        │  └─ Decide: ¿Buscar en KB o responder directamente?  │
        └───────────────┬───────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
   ┌─────────────┐              ┌──────────────┐
   │  KB SEARCH  │              │ NO KB SEARCH │
   │  (SI)       │              │  (NO)        │
   └─────┬───────┘              └────┬─────────┘
         │                            │
         ▼                            ▼
  getRelevantContext()         relevantContext = ''
  Busca docs en KB             (sin contexto)
         │                            │
         └────────────┬───────────────┘
                      │
                      ▼
        ┌───────────────────────────────────────┐
        │  3️⃣ CONSTRUIR SYSTEM INSTRUCTION      │
        │  buildSystemInstructionWithContext()  │
        │  ├─ Si hay KB context: reglas KB      │
        │  └─ Si no hay: permite conocimiento   │
        └───────────────┬───────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │  4️⃣ LLAMAR A GEMINI API               │
        │  generateContentStream()              │
        │  ├─ Modelo: gemini-2.5-flash-lite     │
        │  ├─ System instruction                │
        │  ├─ User message                      │
        │  └─ Config (temp, maxTokens, etc)     │
        └───────────────┬───────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │  5️⃣ GEMINI PROCESA RESPUESTA          │
        │  ├─ Recibe system instruction         │
        │  ├─ Si tiene KB context:              │
        │  │  └─ SOLO USAR CONTEXTO DE KB      │
        │  └─ Si NO tiene KB context:           │
        │     └─ USAR CONOCIMIENTO GENERAL      │
        └───────────────┬───────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │  6️⃣ FORMATEAR RESPUESTA               │
        │  formatResponseForMarkdown()          │
        │  ├─ Espaciado correcto                │
        │  ├─ Listas markdown                   │
        │  └─ Headers y formatting              │
        └───────────────┬───────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │  7️⃣ STREAMING SEMÁNTICO               │
        │  semanticStreamingService()           │
        │  └─ Enviar respuesta por chunks       │
        └───────────────┬───────────────────────┘
                        │
                        ▼
                   USUARIO LEE RESPUESTA