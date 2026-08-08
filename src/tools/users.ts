import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

const USER_STATUSES = ['ACTIVE', 'DISABLED', 'LIMITED', 'EXPIRED'] as const;
const TRAFFIC_STRATEGIES = ['NO_RESET', 'DAY', 'WEEK', 'MONTH', 'MONTH_ROLLING'] as const;

export function registerUserTools(server: McpServer, client: RemnawaveClient, readonly: boolean) {
    server.tool(
        'users_list',
        'List all Remnawave VPN users with pagination',
        {
            start: z.number().default(0).describe('Offset for pagination'),
            size: z.number().default(25).describe('Number of users to return'),
        },
        async ({ start, size }) => {
            try {
                const result = await client.getUsers(start, size);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_get',
        'Get a specific Remnawave user by their numeric ID (API 3.x: uuid is gone, id is the primary key)',
        {
            userId: z.number().int().describe('User numeric ID'),
        },
        async ({ userId }) => {
            try {
                const result = await client.getUserById(userId);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_get_by_username',
        'Get a Remnawave user by their username',
        {
            username: z.string().describe('Username'),
        },
        async ({ username }) => {
            try {
                const result = await client.getUserByUsername(username);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_get_by_short_uuid',
        'Get a Remnawave user by their short UUID',
        {
            shortUuid: z.string().describe('Short UUID'),
        },
        async ({ shortUuid }) => {
            try {
                const result = await client.getUserByShortUuid(shortUuid);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_get_by_telegram_id',
        'Find Remnawave users by their Telegram ID (via the users stream filter)',
        {
            telegramId: z.string().describe('Telegram user ID'),
        },
        async ({ telegramId }) => {
            try {
                const result = await client.streamUsers({ telegramId });
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_get_by_email',
        'Find Remnawave users by their email (via the users stream filter)',
        {
            email: z.string().describe('User email'),
        },
        async ({ email }) => {
            try {
                const result = await client.streamUsers({ email });
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_get_by_tag',
        'Find Remnawave users by tag (via the users stream filter)',
        {
            tag: z.string().describe('User tag'),
        },
        async ({ tag }) => {
            try {
                const result = await client.streamUsers({ tag });
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_stream',
        'Stream users with cursor pagination and filters (status, traffic strategy, telegramId, email, tag, external squad)',
        {
            cursor: z.string().optional().describe('Pagination cursor from the previous page'),
            size: z.number().int().optional().describe('Page size'),
            status: z.enum(USER_STATUSES).optional().describe('Filter by user status'),
            trafficLimitStrategy: z.enum(TRAFFIC_STRATEGIES).optional().describe('Filter by traffic reset strategy'),
            telegramId: z.string().optional().describe('Filter by Telegram ID'),
            email: z.string().optional().describe('Filter by email'),
            tag: z.string().optional().describe('Filter by tag'),
            externalSquadUuid: z.string().optional().describe('Filter by external squad UUID'),
        },
        async (params) => {
            try {
                const result = await client.streamUsers(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_accessible_nodes',
        'Get nodes accessible to a specific user',
        {
            userId: z.number().int().describe('User numeric ID'),
        },
        async ({ userId }) => {
            try {
                const result = await client.getUserAccessibleNodes(userId);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_subscription_request_history',
        'Get subscription request history for a specific user',
        {
            userId: z.number().int().describe('User numeric ID'),
        },
        async ({ userId }) => {
            try {
                const result = await client.getUserSubscriptionRequestHistory(userId);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_tags_list',
        'List all user tags',
        {},
        async () => {
            try {
                const result = await client.getUserTags();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_resolve',
        'Resolve a single user by numeric ID, short UUID, or username (provide exactly one)',
        {
            id: z.number().int().optional().describe('User numeric ID'),
            shortUuid: z.string().optional().describe('Short UUID'),
            username: z.string().optional().describe('Username'),
        },
        async (params) => {
            try {
                const result = await client.resolveUser(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    if (readonly) return;

    server.tool(
        'users_create',
        'Create a new VPN user in Remnawave',
        {
            username: z.string().describe('Unique username'),
            expireAt: z.string().describe('Expiration date in ISO 8601 format'),
            trafficLimitBytes: z
                .number()
                .optional()
                .describe('Traffic limit in bytes (0 = unlimited)'),
            trafficLimitStrategy: z
                .enum(TRAFFIC_STRATEGIES)
                .optional()
                .describe('Traffic reset period'),
            status: z
                .enum(['ACTIVE', 'DISABLED'])
                .optional()
                .describe('Initial user status'),
            description: z.string().optional().describe('User description'),
            tag: z.string().optional().describe('User tag for grouping'),
            telegramId: z.number().optional().describe('Telegram user ID'),
            email: z.string().optional().describe('User email'),
            hwidDeviceLimit: z
                .number()
                .optional()
                .describe('Max number of HWID devices'),
            activeInternalSquads: z
                .array(z.string())
                .optional()
                .describe('Array of internal squad UUIDs'),
            externalSquadUuid: z
                .string()
                .optional()
                .describe('External squad UUID'),
        },
        async (params) => {
            try {
                const result = await client.createUser(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_update',
        'Update an existing Remnawave user (identified by numeric ID)',
        {
            id: z.number().int().describe('User numeric ID to update'),
            username: z.string().optional().describe('New username'),
            expireAt: z
                .string()
                .optional()
                .describe('New expiration date (ISO 8601)'),
            trafficLimitBytes: z
                .number()
                .optional()
                .describe('New traffic limit in bytes'),
            trafficLimitStrategy: z
                .enum(TRAFFIC_STRATEGIES)
                .optional()
                .describe('Traffic reset period'),
            status: z
                .enum(['ACTIVE', 'DISABLED'])
                .optional()
                .describe('User status'),
            description: z.string().optional().describe('User description'),
            tag: z.string().optional().describe('User tag'),
            telegramId: z.number().optional().describe('Telegram user ID'),
            email: z.string().optional().describe('User email'),
            hwidDeviceLimit: z
                .number()
                .optional()
                .describe('Max HWID devices'),
            activeInternalSquads: z
                .array(z.string())
                .optional()
                .describe('Internal squad UUIDs'),
            externalSquadUuid: z
                .string()
                .optional()
                .describe('External squad UUID'),
        },
        async (params) => {
            try {
                const result = await client.updateUser(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_delete',
        'Permanently delete a Remnawave user',
        {
            userId: z.number().int().describe('User numeric ID to delete'),
        },
        async ({ userId }) => {
            try {
                await client.deleteUser(userId);
                return toolResult({ success: true, message: `User ${userId} deleted` });
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_enable',
        'Enable a disabled Remnawave user (restore VPN access)',
        {
            userId: z.number().int().describe('User numeric ID'),
        },
        async ({ userId }) => {
            try {
                const result = await client.enableUser(userId);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_disable',
        'Disable a Remnawave user (block VPN access)',
        {
            userId: z.number().int().describe('User numeric ID'),
        },
        async ({ userId }) => {
            try {
                const result = await client.disableUser(userId);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_revoke_subscription',
        'Revoke subscription for a Remnawave user (generates new subscription link)',
        {
            userId: z.number().int().describe('User numeric ID'),
        },
        async ({ userId }) => {
            try {
                const result = await client.revokeUserSubscription(userId);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_reset_traffic',
        'Reset traffic counter for a Remnawave user',
        {
            userId: z.number().int().describe('User numeric ID'),
        },
        async ({ userId }) => {
            try {
                const result = await client.resetUserTraffic(userId);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_extend_expiration',
        'Extend user subscription by N days (expired users become ACTIVE with +N days from now; active users get +N days added)',
        {
            userId: z.number().int().describe('User numeric ID'),
            days: z.number().int().min(1).describe('Number of days to extend'),
        },
        async ({ userId, days }) => {
            try {
                const result = await client.extendUserExpiration(userId, days);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_delete_by_status',
        'Bulk delete users by status',
        {
            status: z.enum(USER_STATUSES).describe('User status to delete'),
        },
        async (params) => {
            try {
                const result = await client.bulkDeleteUsersByStatus(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_update',
        'Bulk update selected users (async, returns 202)',
        {
            userIds: z.array(z.number().int()).describe('Array of user numeric IDs to update'),
            status: z.enum(['ACTIVE', 'DISABLED']).optional().describe('New status'),
            expireAt: z.string().optional().describe('New expiration date (ISO 8601)'),
            trafficLimitBytes: z.number().optional().describe('New traffic limit'),
            trafficLimitStrategy: z.enum(TRAFFIC_STRATEGIES).optional().describe('Traffic reset period'),
            description: z.string().optional().describe('New description'),
            telegramId: z.number().optional().describe('New Telegram ID'),
            email: z.string().optional().describe('New email'),
            tag: z.string().optional().describe('New tag'),
            hwidDeviceLimit: z.number().optional().describe('New HWID device limit'),
            externalSquadUuid: z.string().optional().describe('New external squad UUID'),
        },
        async (params) => {
            try {
                const { userIds, ...fields } = params;
                const cleanFields: Record<string, unknown> = {};
                for (const [k, v] of Object.entries(fields)) {
                    if (v !== undefined) cleanFields[k] = v;
                }
                const result = await client.bulkUpdateUsers({ userIds, fields: cleanFields });
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_reset_traffic',
        'Bulk reset traffic for selected users',
        {
            userIds: z.array(z.number().int()).describe('Array of user numeric IDs'),
        },
        async (params) => {
            try {
                const result = await client.bulkResetUsersTraffic(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_revoke_subscription',
        'Bulk revoke subscriptions for selected users',
        {
            userIds: z.array(z.number().int()).describe('Array of user numeric IDs'),
        },
        async (params) => {
            try {
                const result = await client.bulkRevokeUsersSubscription(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_delete',
        'Bulk delete selected users',
        {
            userIds: z.array(z.number().int()).describe('Array of user numeric IDs to delete'),
        },
        async (params) => {
            try {
                const result = await client.bulkDeleteUsers(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_update_squads',
        'Bulk update internal squad assignments for selected users',
        {
            userIds: z.array(z.number().int()).describe('Array of user numeric IDs'),
            activeInternalSquads: z.array(z.string()).describe('Squad UUIDs to assign'),
        },
        async (params) => {
            try {
                const result = await client.bulkUpdateUserSquads(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_extend_expiration',
        'Bulk extend expiration date for selected users',
        {
            userIds: z.array(z.number().int()).describe('Array of user numeric IDs'),
            days: z.number().int().min(1).describe('Number of days to extend'),
        },
        async (params) => {
            try {
                const result = await client.bulkExtendUsersExpiration(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_all_update',
        'Update ALL users at once (async, returns 202)',
        {
            status: z.enum(['ACTIVE', 'DISABLED']).optional().describe('New status for all'),
            expireAt: z.string().optional().describe('New expiration date for all'),
            trafficLimitBytes: z.number().optional().describe('New traffic limit for all'),
            trafficLimitStrategy: z.enum(TRAFFIC_STRATEGIES).optional().describe('Traffic reset period for all'),
            description: z.string().optional().describe('New description for all'),
            telegramId: z.number().optional().describe('New Telegram ID for all'),
            email: z.string().optional().describe('New email for all'),
            tag: z.string().optional().describe('New tag for all'),
            hwidDeviceLimit: z.number().optional().describe('New HWID device limit for all'),
        },
        async (params) => {
            try {
                const result = await client.bulkAllUpdateUsers(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_all_reset_traffic',
        'Reset traffic counters for ALL users',
        {},
        async () => {
            try {
                const result = await client.bulkAllResetUsersTraffic();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'users_bulk_all_extend_expiration',
        'Extend expiration date for ALL users',
        {
            days: z.number().int().min(1).describe('Number of days to extend'),
        },
        async (params) => {
            try {
                const result = await client.bulkAllExtendUsersExpiration(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );
}
