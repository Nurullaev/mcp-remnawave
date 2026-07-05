import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

const SUBSCRIPTION_TYPES = ['XRAY_JSON', 'XRAY_BASE64', 'MIHOMO', 'STASH', 'CLASH', 'SINGBOX'] as const;
const ALPN_VALUES = ['h3', 'h2', 'http/1.1', 'h2,http/1.1', 'h3,h2,http/1.1', 'h3,h2'] as const;
const MIHOMO_IP_VERSION = ['dual', 'ipv4', 'ipv6', 'ipv4-prefer', 'ipv6-prefer'] as const;
const TAGS_DESC =
    'Array of tags (uppercase letters, numbers, underscores and colons only; max 36 chars each, up to 10 tags)';

export function registerHostTools(server: McpServer, client: RemnawaveClient, readonly: boolean) {
    server.tool(
        'hosts_list',
        'List all Remnawave hosts',
        {},
        async () => {
            try {
                const result = await client.getHosts();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'hosts_get',
        'Get a specific host by UUID',
        {
            uuid: z.string().describe('Host UUID'),
        },
        async ({ uuid }) => {
            try {
                const result = await client.getHostByUuid(uuid);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'hosts_tags_list',
        'List all host tags',
        {},
        async () => {
            try {
                const result = await client.getHostTags();
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    if (readonly) return;

    server.tool(
        'hosts_create',
        'Create a new host in Remnawave',
        {
            remark: z.string().describe('Host remark/name'),
            address: z.string().describe('Host address'),
            port: z.number().describe('Host port'),
            configProfileUuid: z
                .string()
                .describe('Config profile UUID'),
            configProfileInboundUuid: z
                .string()
                .describe('Config profile inbound UUID'),
            path: z.string().nullish().describe('URL path'),
            sni: z.string().nullish().describe('SNI (Server Name Indication)'),
            host: z.string().nullish().describe('Host header'),
            alpn: z
                .enum(ALPN_VALUES)
                .optional()
                .describe('ALPN protocol'),
            fingerprint: z
                .string()
                .optional()
                .describe('TLS fingerprint (free-form, e.g. chrome, firefox, safari)'),
            isDisabled: z
                .boolean()
                .optional()
                .describe('Create in disabled state'),
            securityLayer: z
                .enum(['DEFAULT', 'TLS', 'NONE'])
                .optional()
                .describe('Security layer'),
            tags: z
                .array(z.string())
                .optional()
                .describe(TAGS_DESC),
            pinnedPeerCertSha256: z
                .string()
                .nullish()
                .describe('Pin peer certificate by SHA-256 fingerprint'),
            verifyPeerCertByName: z
                .string()
                .nullish()
                .describe('Verify peer certificate by name'),
            mihomoIpVersion: z
                .enum(MIHOMO_IP_VERSION)
                .nullish()
                .describe('IP version used by Mihomo clients'),
            serverDescription: z
                .string()
                .optional()
                .describe('Server description'),
            nodes: z
                .array(z.string())
                .optional()
                .describe('Array of node UUIDs to assign'),
            excludeFromSubscriptionTypes: z
                .array(z.enum(SUBSCRIPTION_TYPES))
                .optional()
                .describe('Subscription types to exclude this host from'),
        },
        async (params) => {
            try {
                const body: Record<string, unknown> = {
                    remark: params.remark,
                    address: params.address,
                    port: params.port,
                    inbound: {
                        configProfileUuid: params.configProfileUuid,
                        configProfileInboundUuid:
                            params.configProfileInboundUuid,
                    },
                };
                if (params.path !== undefined) body.path = params.path;
                if (params.sni !== undefined) body.sni = params.sni;
                if (params.host !== undefined) body.host = params.host;
                if (params.alpn !== undefined) body.alpn = params.alpn;
                if (params.fingerprint !== undefined)
                    body.fingerprint = params.fingerprint;
                if (params.isDisabled !== undefined)
                    body.isDisabled = params.isDisabled;
                if (params.securityLayer !== undefined)
                    body.securityLayer = params.securityLayer;
                if (params.tags !== undefined) body.tags = params.tags;
                if (params.pinnedPeerCertSha256 !== undefined)
                    body.pinnedPeerCertSha256 = params.pinnedPeerCertSha256;
                if (params.verifyPeerCertByName !== undefined)
                    body.verifyPeerCertByName = params.verifyPeerCertByName;
                if (params.mihomoIpVersion !== undefined)
                    body.mihomoIpVersion = params.mihomoIpVersion;
                if (params.serverDescription !== undefined)
                    body.serverDescription = params.serverDescription;
                if (params.nodes !== undefined) body.nodes = params.nodes;
                if (params.excludeFromSubscriptionTypes !== undefined)
                    body.excludeFromSubscriptionTypes = params.excludeFromSubscriptionTypes;

                const result = await client.createHost(body);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'hosts_update',
        'Update an existing host',
        {
            uuid: z.string().describe('Host UUID to update'),
            remark: z.string().optional().describe('New remark/name'),
            address: z.string().optional().describe('New address'),
            port: z.number().optional().describe('New port'),
            path: z.string().nullish().describe('New URL path'),
            sni: z.string().nullish().describe('New SNI'),
            host: z.string().nullish().describe('New host header'),
            alpn: z
                .enum(ALPN_VALUES)
                .optional()
                .describe('New ALPN'),
            fingerprint: z
                .string()
                .optional()
                .describe('New TLS fingerprint (free-form)'),
            isDisabled: z
                .boolean()
                .optional()
                .describe('Enable/disable host'),
            securityLayer: z
                .enum(['DEFAULT', 'TLS', 'NONE'])
                .optional()
                .describe('New security layer'),
            tags: z
                .array(z.string())
                .optional()
                .describe(TAGS_DESC),
            pinnedPeerCertSha256: z
                .string()
                .nullish()
                .describe('Pin peer certificate by SHA-256 fingerprint'),
            verifyPeerCertByName: z
                .string()
                .nullish()
                .describe('Verify peer certificate by name'),
            mihomoIpVersion: z
                .enum(MIHOMO_IP_VERSION)
                .nullish()
                .describe('IP version used by Mihomo clients'),
            serverDescription: z
                .string()
                .optional()
                .describe('New server description'),
            excludeFromSubscriptionTypes: z
                .array(z.enum(SUBSCRIPTION_TYPES))
                .optional()
                .describe('Subscription types to exclude this host from'),
        },
        async (params) => {
            try {
                const result = await client.updateHost(params);
                return toolResult(result);
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'hosts_delete',
        'Delete a host from Remnawave',
        {
            uuid: z.string().describe('Host UUID to delete'),
        },
        async ({ uuid }) => {
            try {
                await client.deleteHost(uuid);
                return toolResult({
                    success: true,
                    message: `Host ${uuid} deleted`,
                });
            } catch (e) {
                return toolError(e);
            }
        },
    );

    server.tool(
        'hosts_bulk_enable',
        'Bulk enable selected hosts',
        { uuids: z.array(z.string()).describe('Array of host UUIDs') },
        async (params) => {
            try { return toolResult(await client.bulkEnableHosts(params)); } catch (e) { return toolError(e); }
        },
    );

    server.tool(
        'hosts_bulk_disable',
        'Bulk disable selected hosts',
        { uuids: z.array(z.string()).describe('Array of host UUIDs') },
        async (params) => {
            try { return toolResult(await client.bulkDisableHosts(params)); } catch (e) { return toolError(e); }
        },
    );

    server.tool(
        'hosts_bulk_delete',
        'Bulk delete selected hosts',
        { uuids: z.array(z.string()).describe('Array of host UUIDs') },
        async (params) => {
            try { return toolResult(await client.bulkDeleteHosts(params)); } catch (e) { return toolError(e); }
        },
    );

    server.tool(
        'hosts_bulk_update',
        'Bulk update fields on selected hosts (replaces the removed set-inbound / set-port endpoints)',
        {
            uuids: z.array(z.string()).describe('Array of host UUIDs to update'),
            port: z.number().optional().describe('New port for all selected hosts'),
            configProfileUuid: z
                .string()
                .optional()
                .describe('Config profile UUID (set together with configProfileInboundUuid to change inbound)'),
            configProfileInboundUuid: z
                .string()
                .optional()
                .describe('Inbound UUID (set together with configProfileUuid to change inbound)'),
            sni: z.string().nullish().describe('New SNI'),
            host: z.string().nullish().describe('New host header'),
            path: z.string().nullish().describe('New URL path'),
            alpn: z.enum(ALPN_VALUES).optional().describe('New ALPN'),
            fingerprint: z.string().optional().describe('New TLS fingerprint (free-form)'),
            securityLayer: z.enum(['DEFAULT', 'TLS', 'NONE']).optional().describe('New security layer'),
            isDisabled: z.boolean().optional().describe('Enable/disable selected hosts'),
            tags: z.array(z.string()).optional().describe(TAGS_DESC),
            mihomoIpVersion: z.enum(MIHOMO_IP_VERSION).nullish().describe('IP version used by Mihomo clients'),
            excludeFromSubscriptionTypes: z
                .array(z.enum(SUBSCRIPTION_TYPES))
                .optional()
                .describe('Subscription types to exclude these hosts from'),
        },
        async (params) => {
            try {
                const {
                    configProfileUuid,
                    configProfileInboundUuid,
                    ...rest
                } = params;
                const body: Record<string, unknown> = { ...rest };
                if (
                    configProfileUuid !== undefined &&
                    configProfileInboundUuid !== undefined
                ) {
                    body.inbound = {
                        configProfileUuid,
                        configProfileInboundUuid,
                    };
                }
                return toolResult(await client.bulkUpdateHosts(body));
            } catch (e) { return toolError(e); }
        },
    );

    server.tool(
        'hosts_reorder',
        'Reorder hosts by providing each host UUID with its new position',
        {
            hosts: z
                .array(
                    z.object({
                        uuid: z.string().describe('Host UUID'),
                        viewPosition: z.number().int().describe('New position (0-based)'),
                    }),
                )
                .describe('Array of hosts with their new positions'),
        },
        async ({ hosts }) => {
            try { return toolResult(await client.reorderHosts(hosts)); } catch (e) { return toolError(e); }
        },
    );
}
