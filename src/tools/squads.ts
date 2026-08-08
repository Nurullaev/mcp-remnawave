import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

export function registerSquadTools(
    server: McpServer,
    client: RemnawaveClient,
    readonly: boolean,
) {
    server.tool(
        'squads_list',
        'List all internal squads',
        {},
        async () => {
            try {
                const result = await client.getInternalSquads();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_get',
        'Get a specific internal squad by UUID',
        {
            uuid: z.string().describe('Squad UUID'),
        },
        async ({ uuid }) => {
            try {
                const result = await client.getInternalSquadByUuid(uuid);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_accessible_nodes',
        'Get nodes accessible to a specific squad',
        {
            uuid: z.string().describe('Squad UUID'),
        },
        async ({ uuid }) => {
            try {
                const result = await client.getSquadAccessibleNodes(uuid);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    if (readonly) return;

    server.tool(
        'squads_create',
        'Create a new internal squad',
        {
            name: z.string().describe('Squad name'),
        },
        async (params) => {
            try {
                const result = await client.createInternalSquad(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_update',
        'Update an internal squad',
        {
            uuid: z.string().describe('Squad UUID'),
            name: z.string().optional().describe('New squad name'),
        },
        async (params) => {
            try {
                const result = await client.updateInternalSquad(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_delete',
        'Delete an internal squad',
        {
            uuid: z.string().describe('Squad UUID to delete'),
        },
        async ({ uuid }) => {
            try {
                await client.deleteInternalSquad(uuid);
                return toolResult({
                    success: true,
                    message: `Squad ${uuid} deleted`,
                });
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_add_users',
        'Add specific users to an internal squad (1-1000 per call, async 202)',
        {
            squadUuid: z.string().describe('Squad UUID'),
            userIds: z
                .array(z.number().int())
                .min(1)
                .max(1000)
                .describe('Array of user numeric IDs to add'),
        },
        async ({ squadUuid, userIds }) => {
            try {
                const result = await client.addUsersToSquad(
                    squadUuid,
                    userIds,
                );
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_remove_users',
        'Remove specific users from an internal squad (1-1000 per call, async 202)',
        {
            squadUuid: z.string().describe('Squad UUID'),
            userIds: z
                .array(z.number().int())
                .min(1)
                .max(1000)
                .describe('Array of user numeric IDs to remove'),
        },
        async ({ squadUuid, userIds }) => {
            try {
                const result = await client.removeUsersFromSquad(
                    squadUuid,
                    userIds,
                );
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_add_all_users',
        'Add ALL users to an internal squad (async 202)',
        {
            squadUuid: z.string().describe('Squad UUID'),
        },
        async ({ squadUuid }) => {
            try {
                const result = await client.addAllUsersToSquad(squadUuid);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_remove_all_users',
        'Remove ALL users from an internal squad (async 202)',
        {
            squadUuid: z.string().describe('Squad UUID'),
        },
        async ({ squadUuid }) => {
            try {
                const result = await client.removeAllUsersFromSquad(squadUuid);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'squads_reorder',
        'Reorder internal squads by providing each squad UUID with its new position',
        {
            items: z
                .array(
                    z.object({
                        uuid: z.string().describe('Squad UUID'),
                        viewPosition: z.number().int().describe('New position (0-based)'),
                    }),
                )
                .describe('Array of squads with their new positions'),
        },
        async ({ items }) => {
            try {
                const result = await client.reorderInternalSquads({ items });
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );
}
