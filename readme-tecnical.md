# 🛠 Awesome Design MD - MCP: Guía Técnica

Este documento explica la arquitectura, instalación y uso básico del servidor Model Context Protocol (MCP) que automatiza y persiste los sistemas de diseño de la biblioteca `awesome-design-md`.

---

## 🏗 Cómo está hecho el MCP

Este servidor MCP está construido en **Node.js** y **TypeScript**, utilizando el SDK oficial `@modelcontextprotocol/sdk`. Funciona bajo el protocolo estándar de comunicación de la industria a través de `stdio`, lo que le permite integrarse directamente con IA's locales y asistentes.

### Arquitectura Principal

1. **Dependencias principales**:
   - `@modelcontextprotocol/sdk`: Proporciona la capa fundamental del servidor MCP.
   - Funciones nativas de Node (`fs/promises`, `path`, `url`) para persistencia local.
   - `fetch` nativo para solicitar los diseños directamente de GitHub.

2. **Herramientas Expuestas (Tools)**:
   El servidor registra y expone tres herramientas fundamentales para que el modelo de lenguaje interactúe con el entorno:
   - `list_available_designs`: Hace una petición en vivo a la API de GitHub del repositorio maestro (`awesome-design-md`) y retorna la lista de todos los sistemas de diseño que están disponibles.
   - `set_active_design`: Crea o actualiza un archivo local persistente en `.design-mcp/config.json` dentro de un proyecto. Guarda el estado de la UI que se está usando de forma automática y verifica mediante red (HTTP) que el diseño realmente exista en la nube.
   - `get_active_design`: Lee el archivo de configuración `.design-mcp/config.json` y hace un *Fetch* en tiempo real del archivo `README.md` respectivo desde la URL *raw* de GitHub. Si el archivo en la nube contiene otra redirección (e.g., `https://getdesign.md/...`), extrae automáticamente el contenido final.

---

## 📦 Cómo se Instala y Publica

Este servidor está empaquetado para que **no tengas que instalar otras dependencias complicadas ni descargar el repositorio de diseños** en tu disco. Todo funciona dinámicamente conectándose a la nube.

**Opción A (Publicación Pública en NPM - Para usar con npx)**:
1. Publica este repositorio a NPM usando:
   ```bash
   npm publish
   ```
2. Una vez publicado, tus clientes MCP (en cualquier computadora) simplemente incluyen:
   ```json
   {
     "mcpServers": {
       "awesome-design": {
         "command": "npx",
         "args": ["-y", "mcp-awesome-design"]
       }
     }
   }
   ```

---

## 🚀 Cómo se Usa

Una vez el MCP está corriendo en tu entorno de Agente o IA, el ciclo de automatización de diseño (Cero Fricción) es el siguiente:

1. **Listar Diseños Disponibles**: El Agente, si necesita ver las opciones, puede consultar `list_available_designs` y el MCP le entregará las carpetas disponibles (por ejemplo: `stripe`, `vercel`, `refactoring-ui`).

2. **Inicializar y Fijar un Sistema de Diseño para un Proyecto**:
   Si quieres que tu proyecto en `C:/MisProyectos/App` utilice diseño estilo Vercel, la IA utilizará la tool `set_active_design`:
   - `projectPath`: `C:/MisProyectos/App`
   - `designName`: `vercel`
   El MCP generará en el proyecto: `C:/MisProyectos/App/.design-mcp/config.json` y el agente sabrá que *siempre* deberá usar ese diseño allí.

3. **Inyectar el Contexto (Get Design)**:
   A medida que progresa el desarrollo y requieres que la inteligencia artificial genere nuevo código de una página, llamará de forma automatizada mediante el sistema a `get_active_design(projectPath)`. El MCP detectará el archivo de configuración, consultará el markdown y, si hay una fuente externa viva (fetch), la extraerá en tiempo real y la inyectará en la ventana de contexto de la IA para un resultado visual y técnico perfecto.
