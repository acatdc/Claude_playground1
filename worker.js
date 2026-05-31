const BASE_URL = 'https://sexyproxy.acat-4a9.workers.dev';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, Authorization',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS' || request.method === 'HEAD') {
      return new Response(null, { headers: CORS });
    }

    // RFC 9728 — Protected Resource Metadata
    if (url.pathname === '/.well-known/oauth-protected-resource') {
      return Response.json({
        resource: `${BASE_URL}/`,
        authorization_servers: [BASE_URL],
        scopes_supported: ['mcp'],
        bearer_methods_supported: ['header'],
      }, { headers: CORS });
    }

    // RFC 8414 — Authorization Server Metadata
    if (url.pathname === '/.well-known/oauth-authorization-server') {
      return Response.json({
        issuer: BASE_URL,
        authorization_endpoint: `${BASE_URL}/oauth/authorize`,
        token_endpoint: `${BASE_URL}/oauth/token`,
        registration_endpoint: `${BASE_URL}/oauth/register`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code'],
        code_challenge_methods_supported: ['S256'],
        scopes_supported: ['mcp'],
      }, { headers: CORS });
    }

    // RFC 7591 — Dynamic Client Registration
    if (url.pathname === '/oauth/register' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      return Response.json({
        client_id: 'claude-mcp-client',
        client_secret: 'not-a-secret',
        redirect_uris: body.redirect_uris || [],
        grant_types: ['authorization_code'],
        response_types: ['code'],
        scope: 'mcp',
      }, { status: 201, headers: CORS });
    }

    // Authorization — auto-approve
    if (url.pathname === '/oauth/authorize') {
      const redirectUri = url.searchParams.get('redirect_uri');
      const state = url.searchParams.get('state');
      if (!redirectUri) return new Response('missing redirect_uri', { status: 400 });
      const redirect = new URL(redirectUri);
      redirect.searchParams.set('code', 'auto-approved');
      if (state) redirect.searchParams.set('state', state);
      return Response.redirect(redirect.toString(), 302);
    }

    // Token endpoint
    if (url.pathname === '/oauth/token' && request.method === 'POST') {
      await request.text().catch(() => {});
      return Response.json({
        access_token: 'sexyproxy-token',
        token_type: 'Bearer',
        expires_in: 86400,
        scope: 'mcp',
      }, { headers: CORS });
    }

    // GET / — server info
    if (request.method === 'GET') {
      return Response.json({ name: 'sexyproxy', version: '1.0.0' }, { headers: CORS });
    }

    // POST / — MCP endpoint
    if (request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return Response.json(
          { jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } },
          { status: 400, headers: CORS }
        );
      }

      const isBatch = Array.isArray(body);
      const messages = isBatch ? body : [body];
      const responses = (await Promise.all(messages.map(handle))).filter(r => r !== null);
      const result = isBatch ? responses : (responses[0] ?? null);
      return Response.json(result, { headers: CORS });
    }

    return new Response('Method not allowed', { status: 405, headers: CORS });
  },
};

async function handle(msg) {
  const { id, method, params } = msg;
  if (id === null || id === undefined) return null;

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0', id,
        result: {
          protocolVersion: '2025-11-25',
          capabilities: { tools: {} },
          serverInfo: { name: 'sexyproxy', version: '1.0.0' },
        },
      };

    case 'ping':
      return { jsonrpc: '2.0', id, result: {} };

    case 'tools/list':
      return {
        jsonrpc: '2.0', id,
        result: {
          tools: [{
            name: 'fetch',
            description: 'Make an HTTP request to any external API (REST, GraphQL, etc.)',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'Target URL',
                },
                method: {
                  type: 'string',
                  description: 'HTTP method (default: POST)',
                  enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                },
                headers: {
                  type: 'object',
                  description: 'Additional request headers (optional)',
                },
                body: {
                  description: 'Request body — object or string (optional)',
                },
              },
              required: ['url'],
            },
          }],
        },
      };

    case 'tools/call': {
      const { name, arguments: args } = params ?? {};
      if (name !== 'fetch') {
        return { jsonrpc: '2.0', id, error: { code: -32602, message: `Unknown tool: ${name}` } };
      }
      try {
        const method = args.method || 'POST';
        const headers = { 'Content-Type': 'application/json', ...(args.headers || {}) };
        const init = { method, headers };
        if (args.body !== undefined) {
          init.body = typeof args.body === 'string' ? args.body : JSON.stringify(args.body);
        }
        const res = await fetch(args.url, init);
        const text = await res.text();
        return {
          jsonrpc: '2.0', id,
          result: {
            content: [{
              type: 'text',
              text: `Status: ${res.status}\n\n${text}`,
            }],
          },
        };
      } catch (e) {
        return {
          jsonrpc: '2.0', id,
          result: { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true },
        };
      }
    }

    default:
      return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } };
  }
}
