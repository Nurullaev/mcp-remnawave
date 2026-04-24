import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

const TEMPLATE_TYPES = ['XRAY_JSON', 'XRAY_BASE64', 'MIHOMO', 'STASH', 'CLASH', 'SINGBOX'] as const;

export function registerSubscriptionTemplateTools(server: McpServer, client: RemnawaveClient, readonly: boolean) {
    server.tool(
        'subscription_templates_list',
        'List all subscription templates',
        {},
        async () => {
            try { return toolResult(await client.getSubscriptionTemplates()); } catch (e) { return toolError(e); }
        },
    );

    server.tool(
        'subscription_templates_get',
        'Get a subscription template by UUID',
        {
            uuid: z.string().describe('Template UUID'),
        },
        async ({ uuid }) => {
            try { return toolResult(await client.getSubscriptionTemplateByUuid(uuid)); } catch (e) { return toolError(e); }
        },
    );

    if (readonly) return;

    server.tool(
        'subscription_templates_create',
        'Create a new subscription template',
        {
            name: z.string().describe('Template name'),
            templateType: z.enum(TEMPLATE_TYPES).describe('Template type (client format)'),
        },
        async (params) => {
            try { return toolResult(await client.createSubscriptionTemplate(params)); } catch (e) { return toolError(e); }
        },
    );

    server.tool(
        'subscription_templates_update',
        'Update an existing subscription template',
        {
            uuid: z.string().describe('Template UUID'),
            name: z.string().optional().describe('New template name'),
            templateJson: z.record(z.unknown()).optional().describe('Template JSON configuration object'),
            encodedTemplateYaml: z.string().optional().describe('Base64-encoded YAML template'),
        },
        async (params) => {
            try { return toolResult(await client.updateSubscriptionTemplate(params)); } catch (e) { return toolError(e); }
        },
    );

    server.tool(
        'subscription_templates_delete',
        'Delete a subscription template',
        {
            uuid: z.string().describe('Template UUID to delete'),
        },
        async ({ uuid }) => {
            try {
                await client.deleteSubscriptionTemplate(uuid);
                return toolResult({ success: true, message: `Template ${uuid} deleted` });
            } catch (e) { return toolError(e); }
        },
    );

    server.tool(
        'subscription_templates_reorder',
        'Reorder subscription templates by providing each template UUID with its new position',
        {
            items: z
                .array(
                    z.object({
                        uuid: z.string().describe('Template UUID'),
                        viewPosition: z.number().int().describe('New position (0-based)'),
                    }),
                )
                .describe('Array of templates with their new positions'),
        },
        async ({ items }) => {
            try { return toolResult(await client.reorderSubscriptionTemplates({ items })); } catch (e) { return toolError(e); }
        },
    );
}
