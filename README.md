# mcp-remnawave

MCP-сервер ([Model Context Protocol](https://modelcontextprotocol.io)) для управления VPN-панелью [Remnawave](https://github.com/remnawave/) из Claude Desktop, Cursor, Windsurf и любого MCP-клиента.

**v2.2.0** · Remnawave API **3.4.7** · **191 инструмент** (87 в readonly) · 3 ресурса · 5 промптов

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
| `REMNAWAVE_READONLY` | нет | `true` отключает все пишущие инструменты (191 → 87) |

За [Caddy с кастомным путём](https://docs.remnawave.com/docs/security/caddy-with-custom-path/) путь указывается прямо в base URL: `REMNAWAVE_BASE_URL=https://example.com/secret-path/api`.

Конфиг для Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json` на macOS). Cursor и Windsurf используют такой же JSON в `.cursor/mcp.json` / `.windsurf/mcp.json`:

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

Docker: `npm run build && docker compose up -d` (переменные через `.env` или `docker-compose.yml`).

## Инструменты

Пользователи адресуются **числовым `id`** (в API 3.x пользовательские UUID убраны). Полный список с описанием параметров отдаёт сам клиент — ниже только распределение по категориям.

| Категория | Кол-во | | Категория | Кол-во |
|---|---:|---|---|---:|
| Пользователи | 30 | | Страницы подписок | 7 |
| Плагины нод и shared lists | 18 | | HWID-устройства | 7 |
| Ноды | 15 | | Соединения | 7 |
| Система и статистика | 14 | | Шаблоны подписок | 6 |
| Биллинг инфраструктуры | 12 | | Сниппеты | 5 |
| Хосты | 12 | | Интеграции нод | 5 |
| Внутренние группы | 11 | | API-токены | 4 |
| Подписки | 10 | | Метаданные | 4 |
| Конфиг-профили и inbounds | 9 | | Настройки / Настройки подписок | 2 + 2 |
| Внешние группы | 8 | | Теги · Keygen | 2 · 1 |

**Ресурсы:** `remnawave://stats`, `remnawave://nodes`, `remnawave://health`, `remnawave://users/{userId}`
**Промпты:** `create_user_wizard`, `node_diagnostics`, `traffic_report`, `user_audit`, `bulk_user_cleanup`

Примеры запросов: *«покажи пользователей с истёкшей подпиской»*, *«создай пользователя vasya на 50 ГБ на месяц»*, *«перезапусти ноду amsterdam-01»*, *«какие ноды офлайн?»*

## Разработка

`src/client/index.ts` — HTTP-клиент (по методу на эндпоинт), `src/tools/*.ts` — регистрация инструментов, по файлу на домен. `@remnawave/backend-contract` держим запиненным ровно на версию панели.

## Лицензия

MIT. Проект вырос из [TrackLine/mcp-remnawave](https://github.com/TrackLine/mcp-remnawave).
