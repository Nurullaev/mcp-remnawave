import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RemnawaveClient } from '../client/index.js';
import { toolResult, toolError } from './helpers.js';

// Panel 3.4.x added tag listing/assignment for these domains. Users, nodes and
// hosts have their own long-standing `*_tags_list` tools and are not included here.
const TAG_DOMAINS = [
    'config-profiles',
    'internal-squads',
    'external-squads',
    'node-plugins',
    'subscription-page-configs',
    'subscription-templates',
] as const;

export function registerTagTools(server: McpServer, client: RemnawaveClient, readonly: boolean) {
    server.tool(
        'tags_list',
        'List all tags used in a domain (config profiles, internal/external squads, node plugins, subscription page configs, subscription templates)',
        {
            domain: z.enum(TAG_DOMAINS).describe('Domain to list tags for'),
        },
        async ({ domain }) => {
            try { return toolResult(await client.getDomainTags(domain)); } catch (e) { return toolError(e); }
        },
    );

    if (readonly) return;

    server.tool(
        'tags_assign',
        'Replace the tags of one entity in a domain (config profiles, internal/external squads, node plugins, subscription page configs, subscription templates)',
        {
            domain: z.enum(TAG_DOMAINS).describe('Domain the entity belongs to'),
            uuid: z.string().describe('UUID of the entity to tag'),
            tags: z
                .array(z.string())
                .describe('Full replacement tag list (uppercase letters, numbers, underscores, colons)'),
        },
        async ({ domain, uuid, tags }) => {
            try { return toolResult(await client.setDomainTags(domain, uuid, tags)); } catch (e) { return toolError(e); }
        },
    );
}
