import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

export function registerConnectionTools(server: McpServer, client: RemnawaveClient, readonly: boolean) {
    server.tool('connections_fetch_by_user', 'Fetch active connections for a user (async job, returns jobId)', {
        userId: z.number().int().describe('User numeric ID'),
    }, async ({ userId }) => {
        try { return toolResult(await client.fetchConnectionsByUser(userId)); } catch (e) { return toolError(e); }
    });

    server.tool('connections_get_user_result', 'Get result of a user connections fetch job', {
        jobId: z.string().describe('Job ID from connections_fetch_by_user'),
    }, async ({ jobId }) => {
        try { return toolResult(await client.getConnectionsByUserResult(jobId)); } catch (e) { return toolError(e); }
    });

    server.tool('connections_fetch_by_node', 'Fetch connections for all users on a node (async job, returns jobId)', {
        nodeUuid: z.string().describe('Node UUID'),
    }, async ({ nodeUuid }) => {
        try { return toolResult(await client.fetchConnectionsByNode(nodeUuid)); } catch (e) { return toolError(e); }
    });

    server.tool('connections_get_node_result', 'Get result of a node connections fetch job', {
        jobId: z.string().describe('Job ID from connections_fetch_by_node'),
    }, async ({ jobId }) => {
        try { return toolResult(await client.getConnectionsByNodeResult(jobId)); } catch (e) { return toolError(e); }
    });

    if (readonly) return;

    server.tool('connections_drop', 'Drop active connections by user IDs or IP addresses on all or specific nodes (async, 202)', {
        userIds: z.array(z.number().int()).optional().describe('Drop connections of these user numeric IDs'),
        ipAddresses: z.array(z.string()).optional().describe('Drop connections from these IP addresses'),
        nodeUuids: z.array(z.string()).optional().describe('Limit to these node UUIDs (omit = all connected nodes)'),
    }, async ({ userIds, ipAddresses, nodeUuids }) => {
        try {
            if ((userIds === undefined) === (ipAddresses === undefined)) {
                throw new Error('Provide exactly one of userIds or ipAddresses');
            }
            const dropBy = userIds !== undefined
                ? { by: 'userIds', userIds }
                : { by: 'ipAddresses', ipAddresses };
            const targetNodes = nodeUuids && nodeUuids.length > 0
                ? { target: 'specificNodes', nodeUuids }
                : { target: 'allNodes' };
            return toolResult(await client.dropConnections({ dropBy, targetNodes }));
        } catch (e) { return toolError(e); }
    });
}
