import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

export function registerSubscriptionSettingsTools(server: McpServer, client: RemnawaveClient, readonly: boolean) {
    server.tool(
        'subscription_settings_get',
        'Get Remnawave subscription settings',
        {},
        async () => {
            try { return toolResult(await client.getSubscriptionSettings()); } catch (e) { return toolError(e); }
        },
    );

    if (readonly) return;

    server.tool(
        'subscription_settings_update',
        'Update Remnawave subscription settings',
        {
            uuid: z.string().describe('Settings UUID (required by API)'),
            profileTitle: z.string().optional().describe('Profile title shown to clients'),
            supportLink: z.string().optional().describe('Support link URL'),
            profileUpdateInterval: z.number().int().optional().describe('Profile update interval in seconds'),
            isProfileWebpageUrlEnabled: z.boolean().optional().describe('Enable profile webpage URL'),
            serveJsonAtBaseSubscription: z.boolean().optional().describe('Serve JSON at base subscription URL'),
            happAnnounce: z.string().nullable().optional().describe('HAPP announce URL'),
            happRouting: z.string().nullable().optional().describe('HAPP routing configuration'),
            isShowCustomRemarks: z.boolean().optional().describe('Show custom remarks'),
            customRemarks: z.record(z.unknown()).optional().describe('Custom remarks object'),
            customResponseHeaders: z.record(z.unknown()).optional().describe('Custom response headers'),
            randomizeHosts: z.boolean().optional().describe('Randomize host order in subscriptions'),
            responseRules: z.record(z.unknown()).optional().describe('Response rules configuration'),
            hwidSettings: z.record(z.unknown()).optional().describe('HWID settings configuration'),
        },
        async (params) => {
            try { return toolResult(await client.updateSubscriptionSettings(params)); } catch (e) { return toolError(e); }
        },
    );
}
