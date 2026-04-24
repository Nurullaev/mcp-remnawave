import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

export function registerSnippetTools(server: McpServer, client: RemnawaveClient, readonly: boolean) {
    server.tool('snippets_list', 'List all configuration snippets', {}, async () => {
        try { return toolResult(await client.getSnippets()); } catch (e) { return toolError(e); }
    });

    if (readonly) return;

    server.tool('snippets_create', 'Create a new configuration snippet', {
        name: z.string().describe('Snippet name (alphanumeric, spaces, underscores, hyphens; 2–255 chars)'),
        snippet: z.array(z.record(z.unknown())).describe('Snippet content — array of Outbound or Rule objects'),
    }, async (params) => {
        try { return toolResult(await client.createSnippet(params)); } catch (e) { return toolError(e); }
    });

    server.tool('snippets_update', 'Update an existing snippet (identified by name)', {
        name: z.string().describe('Current snippet name (used to identify the snippet)'),
        newName: z.string().optional().describe('New name to rename the snippet to'),
        snippet: z.array(z.record(z.unknown())).optional().describe('New content — array of Outbound or Rule objects'),
    }, async (params) => {
        try { return toolResult(await client.updateSnippet(params)); } catch (e) { return toolError(e); }
    });

    server.tool('snippets_delete', 'Delete a snippet by name', {
        name: z.string().describe('Snippet name to delete'),
    }, async (params) => {
        try { return toolResult(await client.deleteSnippet(params)); } catch (e) { return toolError(e); }
    });
}
