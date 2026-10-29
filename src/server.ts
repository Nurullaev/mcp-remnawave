import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { RemnawaveClient } from './client/index.js';
import { Config } from './config.js';
import { registerAllTools } from './tools/index.js';
import { registerAllResources } from './resources/index.js';
import { registerAllPrompts } from './prompts/index.js';
import packageInfo from '../package.json';

export function createServer(config: Config): McpServer {
    const server = new McpServer({
        name: 'remnawave-mcp',
        version: packageInfo.version,
    });

    const client = new RemnawaveClient(config);

    registerAllTools(server, client, config.readonly);
    registerAllResources(server, client);
    registerAllPrompts(server);

    return server;
}
