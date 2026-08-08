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
        'Update Remnawave subscription settings (API 3.x: profile title/support link/update interval/HAPP fields moved to custom response headers)',
        {
            uuid: z.string().describe('Settings UUID (required by API)'),
            serveJsonAtBaseSubscription: z.boolean().optional().describe('Serve JSON at base subscription URL'),
            isShowCustomRemarks: z.boolean().optional().describe('Show custom remarks'),
            customRemarks: z.record(z.unknown()).optional().describe('Custom remarks object'),
            customResponseHeaders: z.record(z.unknown()).optional().describe('Custom response headers (supports {{STATUS}} and {{RESET_STRATEGY}} template variables)'),
            randomizeHosts: z.boolean().optional().describe('Randomize host order in subscriptions'),
            responseRules: z.record(z.unknown()).optional().describe('Response rules configuration (supports encryption and disableHwidCheck)'),
            hwidSettings: z.record(z.unknown()).optional().describe('HWID settings configuration'),
        },
        async (params) => {
            try { return toolResult(await client.updateSubscriptionSettings(params)); } catch (e) { return toolError(e); }
        },
    );
}
