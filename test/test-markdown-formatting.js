// Test de formateo de markdown mejorado
// Este script envía mensajes con diferentes elementos de markdown para probar el formateo

const BASE_URL = 'http://localhost:3002';

const testMessages = [
  {
    name: "Títulos y jerarquía",
    content: `# Título Principal
## Subtítulo Importante
### Sección Específica
#### Detalle Menor

Este es un párrafo normal que debería tener buen espaciado y legibilidad.

**Texto en negrita muy prominente** y *texto en cursiva*.`
  },
  {
    name: "Listas y organización",
    content: `## Lista de Características

- **Títulos más grandes** y prominentes
- **Mejor espaciado** entre párrafos y secciones
- **Negritas más visibles** con sombra de texto
- **Colores mejorados** para mejor contraste
- **Responsive design** para móviles

### Lista numerada:

1. Primer elemento importante
2. Segundo elemento con **énfasis**
3. Tercer elemento con detalles`
  },
  {
    name: "Código y bloques",
    content: `## Ejemplos de Código

Código inline: \`const variable = "valor"\`

\`\`\`javascript
// Bloque de código con sintaxis
function ejemploFormateado() {
  return {
    titulo: "Mejor formateo",
    descripcion: "Texto más legible",
    caracteristicas: ["espaciado", "colores", "tipografía"]
  };
}
\`\`\`

> **Nota importante**: Este es un blockquote que debería destacar visualmente del resto del contenido.`
  },
  {
    name: "Contenido mixto complejo",
    content: `# 🚀 Guía Completa de Formateo

## ✨ Características Principales

### 📝 **Tipografía Mejorada**

- **Títulos más grandes** y con mejor jerarquía visual
- **Negritas prominentes** con sombra de texto
- **Espaciado optimizado** entre elementos
- **Colores contrastantes** para mejor legibilidad

### 🎨 **Elementos Visuales**

El nuevo sistema incluye:

1. **Separadores visuales** para títulos principales
2. **Bordes coloridos** para subtítulos
3. **Fondos sutiles** para blockquotes
4. **Animaciones suaves** de aparición

### 💻 **Código y Ejemplos**

Ejemplo de configuración:

\`\`\`json
{
  "formateo": {
    "titulos": "más grandes",
    "negritas": "más prominentes", 
    "espaciado": "mejorado",
    "colores": "optimizados"
  }
}
\`\`\`

> **💡 Tip**: Los cambios son especialmente notables en respuestas largas con múltiples secciones.

---

## 📱 **Responsive Design**

El formateo se adapta automáticamente a:

- **Desktop**: Tamaños de fuente completos
- **Mobile**: Tamaños optimizados para pantallas pequeñas
- **Tablet**: Configuración intermedia

### ✅ **Resultado Final**

El texto ahora es **mucho más fácil de leer** y **visualmente atractivo**.`
  }
];

async function testMarkdownFormatting() {
  console.log('🎨 Iniciando pruebas de formateo de markdown...\n');
  
  for (const test of testMessages) {
    console.log(`📝 Probando: ${test.name}`);
    
    try {
      const response = await fetch(`${BASE_URL}/server/gemini/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Por favor, responde exactamente con este contenido markdown para probar el formateo:\n\n${test.content}`
            }
          ],
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${test.name} - Enviado correctamente`);
      } else {
        console.log(`❌ ${test.name} - Error: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
    }
    
    // Esperar un poco entre requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Pruebas completadas. Revisa el chat para ver las mejoras de formateo!');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testMarkdownFormatting();
}

export { testMarkdownFormatting, testMessages };