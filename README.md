# mcp-remnawave

MCP server ([Model Context Protocol](https://modelcontextprotocol.io)) for managing a [Remnawave](https://github.com/remnawave/) VPN panel from Claude Desktop, Cursor, Windsurf or any MCP client.

**v2.1.0** · Remnawave API **3.4.3** · **190 tools** (87 in readonly) · 3 resources · 5 prompts

> Targets panel **3.4.x**. For panel 3.0–3.2 use v2.0.0, for 2.8.0 use v1.4.0.
> Panel 3.3.0+ requires nodes 3.3.0+ — upgrade nodes alongside the panel.

[Русский](#русский)

## Install

```bash
git clone https://github.com/Nurullaev/mcp-remnawave.git
cd mcp-remnawave && npm install && npm run build
```

Requires Node.js >= 22 and an API token from the panel (Settings → API Tokens).

## Configure

| Variable | Required | Description |
|----------|----------|-------------|
| `REMNAWAVE_BASE_URL` | yes | Panel URL, e.g. `https://vpn.example.com` |
| `REMNAWAVE_API_TOKEN` | yes | API token from panel settings |
| `REMNAWAVE_API_KEY` | no | Extra key for panels behind Caddy with a custom path — sent as `X-Api-Key` |
| `REMNAWAVE_READONLY` | no | `true` disables every write tool (190 → 87) |

Behind [Caddy with a custom path](https://docs.remnawave.com/docs/security/caddy-with-custom-path/), put the path in the base URL: `REMNAWAVE_BASE_URL=https://example.com/secret-path/api`.

Add to `claude_desktop_config.json` (macOS: `~/Library/Application Support/Claude/`). Cursor and Windsurf use the same shape in `.cursor/mcp.json` / `.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "remnawave": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-remnawave/dist/index.js"],
      "env": {
        "REMNAWAVE_BASE_URL": "https://vpn.example.com",
        "REMNAWAVE_API_TOKEN": "your-api-token-here"
      }
    }
  }
}
```

Docker: `npm run build && docker compose up -d` (env via `.env` or `docker-compose.yml`).

## Tools

Users are addressed by their **numeric `id`** (API 3.x removed user UUIDs). Ask the client for the full list — every tool carries its own parameter docs.

| Category | Tools | | Category | Tools |
|---|---:|---|---|---:|
| Users | 30 | | Subscription page configs | 7 |
| Node plugins & shared lists | 18 | | HWID devices | 7 |
| Nodes | 15 | | Connections | 7 |
| System & stats | 14 | | Subscription templates | 6 |
| Infra billing | 12 | | Snippets | 5 |
| Hosts | 11 | | Node integrations | 5 |
| Internal squads | 11 | | API tokens | 4 |
| Subscriptions | 10 | | Metadata | 4 |
| Config profiles & inbounds | 9 | | Settings / Subscription settings | 2 + 2 |
| External squads | 8 | | Tags · Keygen | 2 · 1 |

**Resources:** `remnawave://stats`, `remnawave://nodes`, `remnawave://health`, `remnawave://users/{userId}`
**Prompts:** `create_user_wizard`, `node_diagnostics`, `traffic_report`, `user_audit`, `bulk_user_cleanup`

Example asks: *"show users with expired subscriptions"*, *"create user vasya, 50 GB for a month"*, *"restart node amsterdam-01"*, *"which nodes are offline?"*

## Development

`src/client/index.ts` is the HTTP client (one method per endpoint); `src/tools/*.ts` register tools, one file per domain. Keep `@remnawave/backend-contract` pinned to the panel's exact version.

MIT

---

<a id="русский"></a>

# mcp-remnawave (RU)

MCP-сервер для управления VPN-панелью [Remnawave](https://github.com/remnawave/) из Claude Desktop, Cursor, Windsurf и любого MCP-клиента.

**v2.1.0** · Remnawave API **3.4.3** · **190 инструментов** (87 в readonly) · 3 ресурса · 5 промптов

> Рассчитан на панель **3.4.x**. Для панели 3.0–3.2 — v2.0.0, для 2.8.0 — v1.4.0.
> Панель 3.3.0+ требует ноды 3.3.0+ — обновляйте ноды вместе с панелью.

## Установка

```bash
git clone https://github.com/Nurullaev/mcp-remnawave.git
cd mcp-remnawave && npm install && npm run build
```

Нужен Node.js >= 22 и API-токен из панели (Настройки → API Tokens).

## Настройка

| Переменная | Обязательна | Описание |
|------------|-------------|----------|
| `REMNAWAVE_BASE_URL` | да | URL панели, например `https://vpn.example.com` |
| `REMNAWAVE_API_TOKEN` | да | API-токен из настроек панели |
| `REMNAWAVE_API_KEY` | нет | Доп. ключ для панели за Caddy с кастомным путём — уходит в `X-Api-Key` |
| `REMNAWAVE_READONLY` | нет | `true` отключает все пишущие инструменты (190 → 87) |

За [Caddy с кастомным путём](https://docs.remnawave.com/docs/security/caddy-with-custom-path/) путь указывается прямо в base URL: `REMNAWAVE_BASE_URL=https://example.com/secret-path/api`.

Конфиг для Claude Desktop — тот же JSON, что в английской секции выше (для Cursor/Windsurf он идентичен, кладётся в `.cursor/mcp.json` / `.windsurf/mcp.json`).

Docker: `npm run build && docker compose up -d`.

## Инструменты

Пользователи адресуются **числовым `id`** (в API 3.x пользовательские UUID убраны). Полный список инструментов с описанием параметров отдаёт сам клиент — таблица выше в английской секции показывает распределение по категориям.

**Ресурсы:** `remnawave://stats`, `remnawave://nodes`, `remnawave://health`, `remnawave://users/{userId}`
**Промпты:** `create_user_wizard`, `node_diagnostics`, `traffic_report`, `user_audit`, `bulk_user_cleanup`

Примеры запросов: *«покажи пользователей с истёкшей подпиской»*, *«создай пользователя vasya на 50 ГБ на месяц»*, *«перезапусти ноду amsterdam-01»*, *«какие ноды офлайн?»*

## Разработка

`src/client/index.ts` — HTTP-клиент (по методу на эндпоинт), `src/tools/*.ts` — регистрация инструментов, по файлу на домен. `@remnawave/backend-contract` держим запиненным ровно на версию панели.

MIT
