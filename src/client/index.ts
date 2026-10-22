import { REST_API } from '@remnawave/backend-contract';
import { Config } from '../config.js';

export class RemnawaveClient {
    private baseUrl: string;
    private headers: Record<string, string>;

    constructor(config: Config) {
        this.baseUrl = config.baseUrl;
        this.headers = {
            Authorization: `Bearer ${config.apiToken}`,
            'Content-Type': 'application/json',
        };
        if (config.apiKey) {
            this.headers['X-Api-Key'] = config.apiKey;
        }
    }

    private async request<T = unknown>(
        method: string,
        path: string,
        body?: unknown,
    ): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const options: RequestInit = {
            method,
            headers: this.headers,
        };
        if (body !== undefined) {
            options.body = JSON.stringify(body);
        }
        const res = await fetch(url, options);
        if (!res.ok) {
            let errorMessage: string;
            try {
                const errorBody = await res.json();
                errorMessage =
                    (errorBody as { message?: string }).message ||
                    JSON.stringify(errorBody);
            } catch {
                errorMessage = `HTTP ${res.status} ${res.statusText}`;
            }
            throw new Error(`Remnawave API error: ${errorMessage}`);
        }
        // API 3.x: DELETE returns 204 and bulk/async operations return 202,
        // both with empty bodies — res.json() would throw on those.
        const text = await res.text();
        if (res.status === 204 || res.status === 202 || text === '') {
            return { success: true, statusCode: res.status } as T;
        }
        return JSON.parse(text) as T;
    }

    private async get<T = unknown>(path: string): Promise<T> {
        return this.request<T>('GET', path);
    }

    private async post<T = unknown>(path: string, body?: unknown): Promise<T> {
        return this.request<T>('POST', path, body);
    }

    private async patch<T = unknown>(
        path: string,
        body?: unknown,
    ): Promise<T> {
        return this.request<T>('PATCH', path, body);
    }

    private async put<T = unknown>(path: string, body?: unknown): Promise<T> {
        return this.request<T>('PUT', path, body);
    }

    private async delete<T = unknown>(path: string): Promise<T> {
        return this.request<T>('DELETE', path);
    }

    // Users

    async getUsers(start = 0, size = 25) {
        return this.get(
            `${REST_API.USERS.GET}?start=${start}&size=${size}`,
        );
    }

    async getUserById(userId: number) {
        return this.get(REST_API.USERS.GET_BY_ID(String(userId)));
    }

    async getUserByUsername(username: string) {
        return this.get(REST_API.USERS.GET_BY.USERNAME(username));
    }

    async getUserByShortUuid(shortUuid: string) {
        return this.get(REST_API.USERS.GET_BY.SHORT_UUID(shortUuid));
    }

    // API 3.x: the by-telegram-id/by-email/by-tag lookups were removed in favour
    // of GET /api/users/stream with query filters and cursor pagination.
    async streamUsers(filters: {
        cursor?: string;
        size?: number;
        status?: string;
        trafficLimitStrategy?: string;
        telegramId?: string;
        email?: string;
        tag?: string;
        externalSquadUuid?: string;
    }) {
        const query = new URLSearchParams();
        for (const [k, v] of Object.entries(filters)) {
            if (v !== undefined) query.set(k, String(v));
        }
        const qs = query.toString();
        return this.get(`${REST_API.USERS.STREAM}${qs ? `?${qs}` : ''}`);
    }

    async getUserAccessibleNodes(userId: number) {
        return this.get(REST_API.USERS.ACCESSIBLE_NODES(String(userId)));
    }

    async getUserSubscriptionRequestHistory(userId: number) {
        return this.get(REST_API.USERS.SUBSCRIPTION_REQUEST_HISTORY(String(userId)));
    }

    async getUserTags() {
        return this.get(REST_API.USERS.TAGS.GET);
    }

    async resolveUser(params: { id?: number; shortUuid?: string; username?: string }) {
        return this.post(REST_API.USERS.RESOLVE, params);
    }

    async createUser(params: Record<string, unknown>) {
        return this.post(REST_API.USERS.CREATE, params);
    }

    async updateUser(params: Record<string, unknown>) {
        return this.patch(REST_API.USERS.UPDATE, params);
    }

    async deleteUser(userId: number) {
        return this.delete(REST_API.USERS.DELETE(String(userId)));
    }

    async enableUser(userId: number) {
        return this.post(REST_API.USERS.ACTIONS.ENABLE(String(userId)));
    }

    async disableUser(userId: number) {
        return this.post(REST_API.USERS.ACTIONS.DISABLE(String(userId)));
    }

    async revokeUserSubscription(userId: number) {
        return this.post(REST_API.USERS.ACTIONS.REVOKE_SUBSCRIPTION(String(userId)));
    }

    async resetUserTraffic(userId: number) {
        return this.post(REST_API.USERS.ACTIONS.RESET_TRAFFIC(String(userId)));
    }

    async extendUserExpiration(userId: number, days: number) {
        return this.post(REST_API.USERS.ACTIONS.EXTEND_EXPIRATION_DATE(String(userId)), { days });
    }

    async bulkDeleteUsersByStatus(params: Record<string, unknown>) {
        return this.post(REST_API.USERS.BULK.DELETE_BY_STATUS, params);
    }

    async bulkUpdateUsers(params: Record<string, unknown>) {
        return this.post(REST_API.USERS.BULK.UPDATE, params);
    }

    async bulkResetUsersTraffic(params: Record<string, unknown>) {
        return this.post(REST_API.USERS.BULK.RESET_TRAFFIC, params);
    }

    async bulkRevokeUsersSubscription(params: Record<string, unknown>) {
        return this.post(REST_API.USERS.BULK.REVOKE_SUBSCRIPTION, params);
    }

    async bulkDeleteUsers(params: Record<string, unknown>) {
        return this.post(REST_API.USERS.BULK.DELETE, params);
    }

    async bulkUpdateUserSquads(params: Record<string, unknown>) {
        return this.post(REST_API.USERS.BULK.UPDATE_SQUADS, params);
    }

    async bulkExtendUsersExpiration(params: Record<string, unknown>) {
        return this.post(REST_API.USERS.BULK.EXTEND_EXPIRATION_DATE, params);
    }

    async bulkAllUpdateUsers(params: Record<string, unknown>) {
        return this.post(REST_API.USERS.BULK.ALL.UPDATE, params);
    }

    async bulkAllResetUsersTraffic() {
        return this.post(REST_API.USERS.BULK.ALL.RESET_TRAFFIC);
    }

    async bulkAllExtendUsersExpiration(params: Record<string, unknown>) {
        return this.post(REST_API.USERS.BULK.ALL.EXTEND_EXPIRATION_DATE, params);
    }

    // Nodes

    async getNodes() {
        return this.get(REST_API.NODES.GET);
    }

    async getNodeByUuid(uuid: string) {
        return this.get(REST_API.NODES.GET_BY_UUID(uuid));
    }

    async getNodeTags() {
        return this.get(REST_API.NODES.TAGS.GET);
    }

    async createNode(params: Record<string, unknown>) {
        return this.post(REST_API.NODES.CREATE, params);
    }

    async updateNode(params: Record<string, unknown>) {
        return this.patch(REST_API.NODES.UPDATE, params);
    }

    async deleteNode(uuid: string) {
        return this.delete(REST_API.NODES.DELETE(uuid));
    }

    async enableNode(uuid: string) {
        return this.post(REST_API.NODES.ACTIONS.ENABLE(uuid));
    }

    async disableNode(uuid: string) {
        return this.post(REST_API.NODES.ACTIONS.DISABLE(uuid));
    }

    async restartNode(uuid: string, forceRestart = false) {
        return this.post(REST_API.NODES.ACTIONS.RESTART(uuid), { forceRestart });
    }

    async restartAllNodes(forceRestart = false) {
        return this.post(REST_API.NODES.ACTIONS.RESTART_ALL, { forceRestart });
    }

    async resetNodeTraffic(uuid: string) {
        return this.post(REST_API.NODES.ACTIONS.RESET_TRAFFIC(uuid));
    }

    async reorderNodes(nodes: { uuid: string; viewPosition: number }[]) {
        return this.post(REST_API.NODES.ACTIONS.REORDER, { nodes });
    }

    async bulkNodeProfileModification(params: Record<string, unknown>) {
        return this.post(REST_API.NODES.BULK_ACTIONS.PROFILE_MODIFICATION, params);
    }

    async bulkNodeActions(params: Record<string, unknown>) {
        return this.post(REST_API.NODES.BULK_ACTIONS.ACTIONS, params);
    }

    async bulkUpdateNodes(params: { uuids: string[]; fields: Record<string, unknown> }) {
        return this.post(REST_API.NODES.BULK_ACTIONS.UPDATE, params);
    }

    // Hosts

    async getHosts() {
        return this.get(REST_API.HOSTS.GET);
    }

    async getHostByUuid(uuid: string) {
        return this.get(REST_API.HOSTS.GET_BY_UUID(uuid));
    }

    async getHostTags() {
        return this.get(REST_API.HOSTS.TAGS.GET);
    }

    async createHost(params: Record<string, unknown>) {
        return this.post(REST_API.HOSTS.CREATE, params);
    }

    async updateHost(params: Record<string, unknown>) {
        return this.patch(REST_API.HOSTS.UPDATE, params);
    }

    async deleteHost(uuid: string) {
        return this.delete(REST_API.HOSTS.DELETE(uuid));
    }

    async bulkEnableHosts(params: Record<string, unknown>) {
        return this.post(REST_API.HOSTS.BULK.ENABLE_HOSTS, params);
    }

    async bulkDisableHosts(params: Record<string, unknown>) {
        return this.post(REST_API.HOSTS.BULK.DISABLE_HOSTS, params);
    }

    async bulkDeleteHosts(params: Record<string, unknown>) {
        return this.post(REST_API.HOSTS.BULK.DELETE_HOSTS, params);
    }

    async bulkUpdateHosts(params: Record<string, unknown>) {
        return this.patch(REST_API.HOSTS.BULK.UPDATE, params);
    }

    async reorderHosts(hosts: { uuid: string; viewPosition: number }[]) {
        return this.post(REST_API.HOSTS.ACTIONS.REORDER, { hosts });
    }

    // Panel 3.4.7 added host cloning; the 3.4.7 contract omits the route
    // (HOSTS.ACTIONS only carries REORDER), so it is declared as a literal.
    async cloneHost(cloneFromUuid: string) {
        return this.post('/api/hosts/actions/clone', { cloneFromUuid });
    }

    // System

    async getStats() {
        return this.get(REST_API.SYSTEM.STATS.SYSTEM_STATS);
    }

    async getBandwidthStats() {
        return this.get(REST_API.SYSTEM.STATS.BANDWIDTH_STATS);
    }

    async getNodesMetrics() {
        return this.get(REST_API.SYSTEM.STATS.NODES_METRICS);
    }

    async getNodesStatistics() {
        return this.get(REST_API.SYSTEM.STATS.NODES_STATS);
    }

    async getStatsRecap() {
        return this.get(REST_API.SYSTEM.STATS.RECAP);
    }

    async getHealth() {
        return this.get(REST_API.SYSTEM.HEALTH);
    }

    async getSystemMetadata() {
        return this.get(REST_API.SYSTEM.METADATA);
    }

    async getSystemConfiguration() {
        return this.get(REST_API.SYSTEM.CONFIGURATION);
    }

    async getStatsDigest(start: string, end: string) {
        const query = new URLSearchParams({ start, end });
        return this.get(`${REST_API.SYSTEM.STATS.DIGEST}?${query.toString()}`);
    }

    async getStatsHttp() {
        return this.get(REST_API.SYSTEM.STATS.HTTP);
    }

    async generateX25519() {
        return this.get(REST_API.SYSTEM.TOOLS.GENERATE_X25519);
    }

    async testSrrMatcher(params: Record<string, unknown>) {
        return this.post(REST_API.SYSTEM.TESTERS.SRR_MATCHER, params);
    }

    // Subscriptions

    async getSubscriptions(start = 0, size = 25) {
        return this.get(
            `${REST_API.SUBSCRIPTIONS.GET}?start=${start}&size=${size}`,
        );
    }

    async getSubscriptionByUserId(userId: number) {
        return this.get(REST_API.SUBSCRIPTIONS.GET_BY.ID(String(userId)));
    }

    async getSubscriptionByUsername(username: string) {
        return this.get(REST_API.SUBSCRIPTIONS.GET_BY.USERNAME(username));
    }

    async getSubscriptionByShortUuid(shortUuid: string) {
        return this.get(REST_API.SUBSCRIPTIONS.GET_BY.SHORT_UUID(shortUuid));
    }

    async getSubscriptionByShortUuidRaw(shortUuid: string) {
        return this.get(REST_API.SUBSCRIPTIONS.GET_BY.SHORT_UUID_RAW(shortUuid));
    }

    async getSubscriptionSubpageConfig(shortUuid: string) {
        return this.get(REST_API.SUBSCRIPTIONS.SUBPAGE.GET_CONFIG(shortUuid));
    }

    async getConnectionKeysByUserId(userId: number) {
        return this.get(REST_API.SUBSCRIPTIONS.GET_CONNECTION_KEYS_BY_USER_ID(String(userId)));
    }

    async getSubscriptionInfo(shortUuid: string) {
        return this.get(REST_API.SUBSCRIPTION.GET_INFO(shortUuid));
    }

    async getSubscriptionRequestHistory() {
        return this.get(REST_API.SUBSCRIPTION_REQUEST_HISTORY.GET);
    }

    async getSubscriptionRequestHistoryStats() {
        return this.get(REST_API.SUBSCRIPTION_REQUEST_HISTORY.STATS);
    }

    // Config Profiles / Inbounds

    async getConfigProfiles() {
        return this.get(REST_API.CONFIG_PROFILES.GET);
    }

    async getConfigProfileByUuid(uuid: string) {
        return this.get(REST_API.CONFIG_PROFILES.GET_BY_UUID(uuid));
    }

    async getAllInbounds() {
        return this.get(REST_API.CONFIG_PROFILES.GET_ALL_INBOUNDS);
    }

    async getInboundsByProfileUuid(uuid: string) {
        return this.get(REST_API.CONFIG_PROFILES.GET_INBOUNDS_BY_PROFILE_UUID(uuid));
    }

    async getComputedConfigByProfileUuid(uuid: string) {
        return this.get(REST_API.CONFIG_PROFILES.GET_COMPUTED_CONFIG_BY_PROFILE_UUID(uuid));
    }

    async createConfigProfile(params: Record<string, unknown>) {
        return this.post(REST_API.CONFIG_PROFILES.CREATE, params);
    }

    async updateConfigProfile(params: Record<string, unknown>) {
        return this.patch(REST_API.CONFIG_PROFILES.UPDATE, params);
    }

    async deleteConfigProfile(uuid: string) {
        return this.delete(REST_API.CONFIG_PROFILES.DELETE(uuid));
    }

    async reorderConfigProfiles(params: Record<string, unknown>) {
        return this.post(REST_API.CONFIG_PROFILES.ACTIONS.REORDER, params);
    }

    // Internal Squads

    async getInternalSquads() {
        return this.get(REST_API.INTERNAL_SQUADS.GET);
    }

    async getInternalSquadByUuid(uuid: string) {
        return this.get(REST_API.INTERNAL_SQUADS.GET_BY_UUID(uuid));
    }

    async getSquadAccessibleNodes(uuid: string) {
        return this.get(REST_API.INTERNAL_SQUADS.ACCESSIBLE_NODES(uuid));
    }

    async createInternalSquad(params: Record<string, unknown>) {
        return this.post(REST_API.INTERNAL_SQUADS.CREATE, params);
    }

    async updateInternalSquad(params: Record<string, unknown>) {
        return this.patch(REST_API.INTERNAL_SQUADS.UPDATE, params);
    }

    async deleteInternalSquad(uuid: string) {
        return this.delete(REST_API.INTERNAL_SQUADS.DELETE(uuid));
    }

    async reorderInternalSquads(params: Record<string, unknown>) {
        return this.post(REST_API.INTERNAL_SQUADS.ACTIONS.REORDER, params);
    }

    // API 3.x: add-many/remove-many take numeric userIds (1-1000 per call);
    // add-users/remove-users have no body and affect ALL users.
    async addUsersToSquad(squadUuid: string, userIds: number[]) {
        return this.post(
            REST_API.INTERNAL_SQUADS.BULK_ACTIONS.ADD_MANY_USERS(squadUuid),
            { userIds },
        );
    }

    async removeUsersFromSquad(squadUuid: string, userIds: number[]) {
        return this.request(
            'DELETE',
            REST_API.INTERNAL_SQUADS.BULK_ACTIONS.REMOVE_MANY_USERS(squadUuid),
            { userIds },
        );
    }

    async addAllUsersToSquad(squadUuid: string) {
        return this.post(REST_API.INTERNAL_SQUADS.BULK_ACTIONS.ADD_USERS(squadUuid));
    }

    async removeAllUsersFromSquad(squadUuid: string) {
        return this.delete(REST_API.INTERNAL_SQUADS.BULK_ACTIONS.REMOVE_USERS(squadUuid));
    }

    // HWID

    async getUserHwidDevices(userId: number) {
        return this.get(REST_API.HWID.GET_USER_HWID_DEVICES(String(userId)));
    }

    async getAllHwidDevices() {
        return this.get(REST_API.HWID.GET_ALL_HWID_DEVICES);
    }

    async getHwidStats() {
        return this.get(REST_API.HWID.STATS);
    }

    async getHwidTopUsers() {
        return this.get(REST_API.HWID.TOP_USERS_BY_DEVICES);
    }

    async createUserHwidDevice(params: Record<string, unknown>) {
        return this.post(REST_API.HWID.CREATE_USER_HWID_DEVICE, params);
    }

    // API 3.x: a device is identified by the pair {userId, hwid}, not a device uuid.
    async deleteHwidDevice(userId: number, hwid: string) {
        return this.post(REST_API.HWID.DELETE_USER_HWID_DEVICE, {
            userId,
            hwid,
        });
    }

    async deleteAllUserHwidDevices(userId: number) {
        return this.post(REST_API.HWID.DELETE_ALL_USER_HWID_DEVICES, {
            userId,
        });
    }

    // Bandwidth Stats

    async getNodesBandwidth() {
        return this.get(REST_API.BANDWIDTH_STATS.NODES.GET);
    }

    // Tag listing/assignment for domains added in panel 3.4.x. The 3.4.3 contract
    // does not expose these routes, so they are declared as literals (verified live).
    private static readonly TAG_ROUTES = {
        'config-profiles': '/api/config-profiles/tags',
        'internal-squads': '/api/internal-squads/tags',
        'external-squads': '/api/external-squads/tags',
        'node-plugins': '/api/node-plugins/tags',
        'subscription-page-configs': '/api/subscription-page-configs/tags',
        'subscription-templates': '/api/subscription-templates/tags',
    } as const;

    async getDomainTags(domain: keyof typeof RemnawaveClient.TAG_ROUTES) {
        return this.get(RemnawaveClient.TAG_ROUTES[domain]);
    }

    async setDomainTags(
        domain: keyof typeof RemnawaveClient.TAG_ROUTES,
        uuid: string,
        tags: string[],
    ) {
        return this.patch(RemnawaveClient.TAG_ROUTES[domain], { uuid, tags });
    }

    async getUserBandwidthById(userId: number) {
        return this.get(REST_API.BANDWIDTH_STATS.USERS.GET_BY_ID(String(userId)));
    }

    async getUsersUsageByNodes(
        nodesUuids: string[],
        start: string,
        end: string,
        topUsersLimit?: number,
    ) {
        const query = new URLSearchParams({ start, end });
        if (topUsersLimit !== undefined) {
            query.set('topUsersLimit', String(topUsersLimit));
        }
        return this.post(
            `${REST_API.BANDWIDTH_STATS.NODES.GET_USERS_BY_NODES}?${query.toString()}`,
            { nodesUuids },
        );
    }

    // Auth

    async getAuthStatus() {
        return this.get(REST_API.AUTH.GET_STATUS);
    }

    // API Tokens

    async getApiTokens() {
        return this.get(REST_API.API_TOKENS.GET);
    }

    async createApiToken(params: Record<string, unknown>) {
        return this.post(REST_API.API_TOKENS.CREATE, params);
    }

    async deleteApiToken(uuid: string) {
        return this.delete(REST_API.API_TOKENS.DELETE(uuid));
    }

    async getApiTokenScopes() {
        return this.get(REST_API.API_TOKENS.GET_SCOPES);
    }

    // Keygen

    async getKeygen() {
        return this.get(REST_API.KEYGEN.GET);
    }

    // Infra Billing

    async getBillingProviders() {
        return this.get(REST_API.INFRA_BILLING.GET_PROVIDERS);
    }

    async getBillingProviderByUuid(uuid: string) {
        return this.get(REST_API.INFRA_BILLING.GET_PROVIDER_BY_UUID(uuid));
    }

    async createBillingProvider(params: Record<string, unknown>) {
        return this.post(REST_API.INFRA_BILLING.CREATE_PROVIDER, params);
    }

    async updateBillingProvider(params: Record<string, unknown>) {
        return this.patch(REST_API.INFRA_BILLING.UPDATE_PROVIDER, params);
    }

    async deleteBillingProvider(uuid: string) {
        return this.delete(REST_API.INFRA_BILLING.DELETE_PROVIDER(uuid));
    }

    async getBillingNodes() {
        return this.get(REST_API.INFRA_BILLING.GET_BILLING_NODES);
    }

    async createBillingNode(params: Record<string, unknown>) {
        return this.post(REST_API.INFRA_BILLING.CREATE_BILLING_NODE, params);
    }

    async updateBillingNode(params: Record<string, unknown>) {
        return this.patch(REST_API.INFRA_BILLING.UPDATE_BILLING_NODE, params);
    }

    async deleteBillingNode(uuid: string) {
        return this.delete(REST_API.INFRA_BILLING.DELETE_BILLING_NODE(uuid));
    }

    async getBillingHistory() {
        return this.get(REST_API.INFRA_BILLING.GET_BILLING_HISTORY);
    }

    async createBillingHistory(params: Record<string, unknown>) {
        return this.post(REST_API.INFRA_BILLING.CREATE_BILLING_HISTORY, params);
    }

    async deleteBillingHistory(uuid: string) {
        return this.delete(REST_API.INFRA_BILLING.DELETE_BILLING_HISTORY(uuid));
    }

    // Snippets

    async getSnippets() {
        return this.get(REST_API.SNIPPETS.GET);
    }

    async createSnippet(params: Record<string, unknown>) {
        const body: Record<string, unknown> = { name: params.name };
        if (params.snippet !== undefined) {
            body.snippet = typeof params.snippet === 'string'
                ? JSON.parse(params.snippet as string)
                : params.snippet;
        }
        return this.post(REST_API.SNIPPETS.CREATE, body);
    }

    async updateSnippet(params: Record<string, unknown>) {
        const body: Record<string, unknown> = { name: params.name };
        if (params.newName !== undefined) body.name = params.newName;
        if (params.snippet !== undefined) {
            body.snippet = typeof params.snippet === 'string'
                ? JSON.parse(params.snippet as string)
                : params.snippet;
        }
        return this.patch(REST_API.SNIPPETS.UPDATE, body);
    }

    async deleteSnippet(params: Record<string, unknown>) {
        return this.request('DELETE', REST_API.SNIPPETS.DELETE as string, { name: params.name });
    }

    async syncSnippet(name: string) {
        return this.post(REST_API.SNIPPETS.ACTIONS.SYNC, { name });
    }

    // External Squads

    async getExternalSquads() {
        return this.get(REST_API.EXTERNAL_SQUADS.GET);
    }

    async getExternalSquadByUuid(uuid: string) {
        return this.get(REST_API.EXTERNAL_SQUADS.GET_BY_UUID(uuid));
    }

    async createExternalSquad(params: Record<string, unknown>) {
        return this.post(REST_API.EXTERNAL_SQUADS.CREATE, params);
    }

    async updateExternalSquad(params: Record<string, unknown>) {
        return this.patch(REST_API.EXTERNAL_SQUADS.UPDATE, params);
    }

    async deleteExternalSquad(uuid: string) {
        return this.delete(REST_API.EXTERNAL_SQUADS.DELETE(uuid));
    }

    // API 3.x: external-squad add-users/remove-users take no body — they add or
    // remove ALL users for the squad (202 async).
    async addAllUsersToExternalSquad(squadUuid: string) {
        return this.post(REST_API.EXTERNAL_SQUADS.BULK_ACTIONS.ADD_USERS(squadUuid));
    }

    async removeAllUsersFromExternalSquad(squadUuid: string) {
        return this.delete(REST_API.EXTERNAL_SQUADS.BULK_ACTIONS.REMOVE_USERS(squadUuid));
    }

    async reorderExternalSquads(params: Record<string, unknown>) {
        return this.post(REST_API.EXTERNAL_SQUADS.ACTIONS.REORDER, params);
    }

    // Settings

    async getSettings() {
        return this.get(REST_API.REMNAAWAVE_SETTINGS.GET);
    }

    async updateSettings(params: Record<string, unknown>) {
        return this.patch(REST_API.REMNAAWAVE_SETTINGS.UPDATE, params);
    }

    // Subscription Page Configs

    async getSubscriptionPageConfigs() {
        return this.get(REST_API.SUBSCRIPTION_PAGE_CONFIGS.GET_ALL);
    }

    async getSubscriptionPageConfig(uuid: string) {
        return this.get(REST_API.SUBSCRIPTION_PAGE_CONFIGS.GET(uuid));
    }

    async createSubscriptionPageConfig(params: Record<string, unknown>) {
        return this.post(REST_API.SUBSCRIPTION_PAGE_CONFIGS.CREATE, params);
    }

    async updateSubscriptionPageConfig(params: Record<string, unknown>) {
        return this.patch(REST_API.SUBSCRIPTION_PAGE_CONFIGS.UPDATE, params);
    }

    async deleteSubscriptionPageConfig(uuid: string) {
        return this.delete(REST_API.SUBSCRIPTION_PAGE_CONFIGS.DELETE(uuid));
    }

    async reorderSubscriptionPageConfigs(params: Record<string, unknown>) {
        return this.post(REST_API.SUBSCRIPTION_PAGE_CONFIGS.ACTIONS.REORDER, params);
    }

    async cloneSubscriptionPageConfig(params: Record<string, unknown>) {
        return this.post(REST_API.SUBSCRIPTION_PAGE_CONFIGS.ACTIONS.CLONE, params);
    }

    // Node Plugins

    async getNodePlugins() {
        return this.get(REST_API.NODE_PLUGINS.GET_ALL);
    }

    async getNodePlugin(uuid: string) {
        return this.get(REST_API.NODE_PLUGINS.GET(uuid));
    }

    async createNodePlugin(params: Record<string, unknown>) {
        return this.post(REST_API.NODE_PLUGINS.CREATE, params);
    }

    async updateNodePlugin(params: Record<string, unknown>) {
        return this.patch(REST_API.NODE_PLUGINS.UPDATE, params);
    }

    async deleteNodePlugin(uuid: string) {
        return this.delete(REST_API.NODE_PLUGINS.DELETE(uuid));
    }

    async reorderNodePlugins(params: Record<string, unknown>) {
        return this.post(REST_API.NODE_PLUGINS.ACTIONS.REORDER, params);
    }

    async cloneNodePlugin(params: Record<string, unknown>) {
        return this.post(REST_API.NODE_PLUGINS.ACTIONS.CLONE, params);
    }

    async executeNodePlugin(params: Record<string, unknown>) {
        return this.post(REST_API.NODE_PLUGINS.EXECUTOR, params);
    }

    async getTorrentBlockerReports() {
        return this.get(REST_API.NODE_PLUGINS.TORRENT_BLOCKER.GET_REPORTS);
    }

    async getTorrentBlockerStats() {
        return this.get(REST_API.NODE_PLUGINS.TORRENT_BLOCKER.GET_REPORTS_STATS);
    }

    async truncateTorrentBlockerReports() {
        return this.post(REST_API.NODE_PLUGINS.TORRENT_BLOCKER.TRUNCATE_REPORTS);
    }

    async syncNodePlugin(uuid: string) {
        return this.post(REST_API.NODE_PLUGINS.ACTIONS.SYNC, { uuid });
    }

    // Shared lists (split out of node plugins in panel 3.3.0). Addressed by name:
    // the contract's uuid-path variants 404 on the live panel.
    async getSharedLists() {
        return this.get(REST_API.NODE_PLUGINS.SHARED_LISTS.GET_ALL);
    }

    async getSharedListByName(name: string) {
        return this.get(
            `/api/node-plugins/shared-lists/by-name?name=${encodeURIComponent(name)}`,
        );
    }

    async createSharedList(params: Record<string, unknown>) {
        return this.post(REST_API.NODE_PLUGINS.SHARED_LISTS.CREATE, params);
    }

    async updateSharedList(params: Record<string, unknown>) {
        return this.patch(REST_API.NODE_PLUGINS.SHARED_LISTS.UPDATE, params);
    }

    async deleteSharedList(name: string) {
        return this.request('DELETE', '/api/node-plugins/shared-lists', { name });
    }

    async syncSharedList(name: string) {
        return this.post(REST_API.NODE_PLUGINS.SHARED_LISTS.ACTIONS.SYNC, { name });
    }

    // Node Integrations (panel 3.4.x)

    async getNodeIntegrations() {
        return this.get(REST_API.NODE_INTEGRATIONS.GET_ALL);
    }

    async getNodeIntegration(uuid: string) {
        return this.get(REST_API.NODE_INTEGRATIONS.GET(uuid));
    }

    async createNodeIntegration(params: Record<string, unknown>) {
        return this.post(REST_API.NODE_INTEGRATIONS.CREATE, params);
    }

    async updateNodeIntegration(params: Record<string, unknown>) {
        return this.patch(REST_API.NODE_INTEGRATIONS.UPDATE, params);
    }

    async deleteNodeIntegration(uuid: string) {
        return this.delete(REST_API.NODE_INTEGRATIONS.DELETE(uuid));
    }

    // Connections (API 3.x replacement for the ip-control module)

    async fetchConnectionsByUser(userId: number) {
        return this.post(REST_API.CONNECTIONS.CONNECTIONS_BY_USER(String(userId)));
    }

    async getConnectionsByUserResult(jobId: string) {
        return this.get(REST_API.CONNECTIONS.CONNECTIONS_BY_USER_RESULT(jobId));
    }

    async fetchConnectionsByNode(nodeUuid: string) {
        return this.post(REST_API.CONNECTIONS.CONNECTIONS_BY_NODE(nodeUuid));
    }

    async getConnectionsByNodeResult(jobId: string) {
        return this.get(REST_API.CONNECTIONS.CONNECTIONS_BY_NODE_RESULT(jobId));
    }

    async dropConnections(params: Record<string, unknown>) {
        return this.post(REST_API.CONNECTIONS.DROP_CONNECTIONS, params);
    }

    // Geocheck (panel 3.4.x; requires node 3.3.0+)
    async geocheckByNode(nodeUuid: string, params: Record<string, unknown>) {
        return this.post(REST_API.CONNECTIONS.GEOCHECK_BY_NODE(nodeUuid), params);
    }

    async getGeocheckResult(jobId: string) {
        return this.get(REST_API.CONNECTIONS.GEOCHECK_BY_NODE_RESULT(jobId));
    }

    // Metadata

    async getNodeMetadata(uuid: string) {
        return this.get(REST_API.METADATA.NODE.GET(uuid));
    }

    async upsertNodeMetadata(uuid: string, params: Record<string, unknown>) {
        return this.put(REST_API.METADATA.NODE.UPSERT(uuid), params);
    }

    async getUserMetadata(userId: number) {
        return this.get(REST_API.METADATA.USER.GET(String(userId)));
    }

    async upsertUserMetadata(userId: number, params: Record<string, unknown>) {
        return this.put(REST_API.METADATA.USER.UPSERT(String(userId)), params);
    }

    // Subscription Settings

    async getSubscriptionSettings() {
        return this.get(REST_API.SUBSCRIPTION_SETTINGS.GET);
    }

    async updateSubscriptionSettings(params: Record<string, unknown>) {
        return this.patch(REST_API.SUBSCRIPTION_SETTINGS.UPDATE, params);
    }

    // Subscription Templates

    async getSubscriptionTemplates() {
        return this.get(REST_API.SUBSCRIPTION_TEMPLATE.GET_ALL);
    }

    async getSubscriptionTemplateByUuid(uuid: string) {
        return this.get(REST_API.SUBSCRIPTION_TEMPLATE.GET(uuid));
    }

    async createSubscriptionTemplate(params: Record<string, unknown>) {
        return this.post(REST_API.SUBSCRIPTION_TEMPLATE.CREATE, params);
    }

    async updateSubscriptionTemplate(params: Record<string, unknown>) {
        return this.patch(REST_API.SUBSCRIPTION_TEMPLATE.UPDATE, params);
    }

    async deleteSubscriptionTemplate(uuid: string) {
        return this.delete(REST_API.SUBSCRIPTION_TEMPLATE.DELETE(uuid));
    }

    async reorderSubscriptionTemplates(params: Record<string, unknown>) {
        return this.post(REST_API.SUBSCRIPTION_TEMPLATE.ACTIONS.REORDER, params);
    }
}
