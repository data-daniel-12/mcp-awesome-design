#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";

const server = new Server(
  {
    name: "mcp-awesome-design",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Constants
const CONFIG_DIR_NAME = ".design-mcp";
const CONFIG_FILE_NAME = "config.json";

// GitHub Repository Configuration
// Apuntando al repositorio original de VoltAgent para mantener la fuente de verdad.
const GITHUB_OWNER = "VoltAgent"; 
const GITHUB_REPO = "awesome-design-md";
const GITHUB_BRANCH = "main";
const GITHUB_BASE_DIR = "design-md";

const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_BASE_DIR}`;
const RAW_BASE_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_BASE_DIR}`;

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_available_designs",
                description: "List all design systems available in awesome-design-md from the cloud",
                inputSchema: {
                    type: "object",
                    properties: {},
                }
            },
            {
                name: "set_active_design",
                description: "Set the persistent active design system for a specific project.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectPath: { type: "string", description: "Absolute path to the user's project repository" },
                        designName: { type: "string", description: "Name of the design system (e.g. 'stripe')" }
                    },
                    required: ["projectPath", "designName"]
                }
            },
            {
                name: "get_active_design",
                description: "Fetch the active design system rules for a project based on its persistence config.",
                inputSchema: {
                    type: "object",
                    properties: {
                        projectPath: { type: "string", description: "Absolute path to the user's project repository" }
                    },
                    required: ["projectPath"]
                }
            }
        ]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (request.params.name === "list_available_designs") {
            const response = await fetch(GITHUB_API_URL, {
                headers: {
                    "User-Agent": "awesome-design-mcp",
                    "Accept": "application/vnd.github.v3+json"
                }
            });

            if (!response.ok) {
                return {
                    content: [{ type: "text", text: `Error fetching designs from GitHub: ${response.statusText}. Please verify the repo is public.`}],
                    isError: true
                };
            }

            const data = await response.json();
            const designs = data.filter((item: any) => item.type === 'dir').map((item: any) => item.name);
            
            return {
                content: [{ type: "text", text: `Available designs in cloud:\n${designs.join(", ")}` }],
            };

        } else if (request.params.name === "set_active_design") {
            const { projectPath, designName } = request.params.arguments as any;
            
            // Verify design exists by checking its README on raw.githubusercontent
            const readmeUrl = `${RAW_BASE_URL}/${designName}/README.md`;
            const res = await fetch(readmeUrl);
            
            if (!res.ok) {
                return { content: [{ type: "text", text: `Error: Design '${designName}' not found in the remote repository.`}], isError: true };
            }

            const configDirPath = path.join(projectPath, CONFIG_DIR_NAME);
            const configFilePath = path.join(configDirPath, CONFIG_FILE_NAME);
            
            await fs.mkdir(configDirPath, { recursive: true });
            await fs.writeFile(configFilePath, JSON.stringify({ design: designName }, null, 2), "utf-8");
            
            return {
                content: [{ type: "text", text: `Successfully set active design to '${designName}' for project at ${projectPath}.` }],
            };

        } else if (request.params.name === "get_active_design") {
            const { projectPath } = request.params.arguments as any;
            const configFilePath = path.join(projectPath, CONFIG_DIR_NAME, CONFIG_FILE_NAME);
            
            let designName = "";
            try {
                const content = await fs.readFile(configFilePath, "utf-8");
                const parsed = JSON.parse(content);
                designName = parsed.design;
            } catch (e) {
                return { content: [{ type: "text", text: `No active design found for this project. Please run set_active_design first to initialize the .design-mcp configuration.`}], isError: true };
            }
            
            // Fetch dynamically from Cloud
            const readmeUrl = `${RAW_BASE_URL}/${designName}/README.md`;
            let readmeContent = "";
            try {
                const response = await fetch(readmeUrl);
                if (!response.ok) {
                    return { content: [{ type: "text", text: `Error reading README.md from cloud for design '${designName}'`}], isError: true };
                }
                readmeContent = await response.text();
            } catch (e: any) {
                return { content: [{ type: "text", text: `Network error reading design '${designName}': ${e.message}`}], isError: true };
            }

            // Check if it's just a URL link
            const linkMatch = readmeContent.match(/https:\/\/getdesign\.md\/[^\s]+/);
            if (linkMatch) {
                const url = linkMatch[0];
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        return { content: [{ type: "text", text: `Found URL ${url} but failed to fetch it: ${response.statusText}`}], isError: true };
                    }
                    const remoteText = await response.text();
                    return {
                        content: [{ type: "text", text: `--- Design System: ${designName} (Fetched from ${url}) ---\n\n${remoteText}` }],
                    };
                } catch (e: any) {
                    return { content: [{ type: "text", text: `Found URL ${url} but failed to fetch: ${e.message}`}], isError: true };
                }
            }
            
            return {
                content: [{ type: "text", text: `--- Design System (Cloud): ${designName} ---\n\n${readmeContent}` }],
            };
        }
        return {
            content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }],
            isError: true,
        };
    } catch (error: any) {
         return {
            content: [{ type: "text", text: `Error executing tool: ${error.message}` }],
            isError: true,
        };
    }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("awesome-design-md Cloud MCP Server running on stdio");
}

main().catch((error) => console.error("MCP Server Error:", error));
