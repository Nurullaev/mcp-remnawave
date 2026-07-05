import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

export function registerSystemTools(
    server: McpServer,
    client: RemnawaveClient,
) {
    server.tool(
        'system_stats',
        'Get overall Remnawave panel statistics (users, nodes, traffic, memory, CPU)',
        {},
        async () => {
            try {
                const result = await client.getStats();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_bandwidth_stats',
        'Get bandwidth statistics',
        {},
        async () => {
            try {
                const result = await client.getBandwidthStats();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'bandwidth_stats_users_by_nodes',
        'Get top per-user bandwidth usage across the given nodes for a date range',
        {
            nodesUuids: z
                .array(z.string())
                .min(1)
                .describe('Array of node UUIDs (at least one)'),
            start: z.string().describe('Start date (YYYY-MM-DD)'),
            end: z.string().describe('End date (YYYY-MM-DD)'),
            topUsersLimit: z
                .number()
                .int()
                .optional()
                .describe('Max number of top users to return (default 100)'),
        },
        async ({ nodesUuids, start, end, topUsersLimit }) => {
            try {
                const result = await client.getUsersUsageByNodes(
                    nodesUuids,
                    start,
                    end,
                    topUsersLimit,
                );
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_nodes_metrics',
        'Get detailed node metrics',
        {},
        async () => {
            try {
                const result = await client.getNodesMetrics();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_nodes_statistics',
        'Get node statistics',
        {},
        async () => {
            try {
                const result = await client.getNodesStatistics();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_health',
        'Check Remnawave panel health status',
        {},
        async () => {
            try {
                const result = await client.getHealth();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_metadata',
        'Get Remnawave panel metadata and version information',
        {},
        async () => {
            try {
                const result = await client.getSystemMetadata();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_generate_x25519',
        'Generate X25519 key pair for VLESS Reality',
        {},
        async () => {
            try {
                const result = await client.generateX25519();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'auth_status',
        'Check current authentication status with Remnawave panel',
        {},
        async () => {
            try {
                const result = await client.getAuthStatus();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_stats_recap',
        'Get system statistics recap',
        {},
        async () => {
            try {
                const result = await client.getStatsRecap();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'system_srr_matcher',
        'Test subscription request routing rules',
        {
            input: z.string().describe('Input string to test against SRR rules'),
        },
        async (params) => {
            try {
                const result = await client.testSrrMatcher(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );
}
