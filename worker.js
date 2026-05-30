const GMX_ENDPOINT = 'https://gmx-solana-sqd.squids.live/gmx-solana-base:prod/api/graphql';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, Authorization',
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    // OAuth Discovery
    if (url.pathname === '/.well-known/oauth-authorization-server') {
      return Response.json({
        issuer: url.origin,
        authorization_endpoint: `${url.origin}/oauth/authorize`,
        token_endpoint: `${url.origin}/oauth/token`,
        registration_endpoint: `${url.origin}/oauth/register`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code'],
        code_challenge_methods_supported: ['S256'],
      }, { headers: CORS });
    }

    // Dynamic Client Registration (RFC 7591)
    if (url.pathname === '/oauth/register' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      return Response.json({
        client_id: 'claude-mcp-client',
        client_secret: 'not-a-secret',
        redirect_uris: body.redirect_uris || [],
        grant_types: ['authorization_code'],
        response_types: ['code'],
      }, { status: 201, headers: CORS });
    }

    // Authorization — auto-approve, redirect with code
    if (url.pathname === '/oauth/authorize') {
      const redirectUri = url.searchParams.get('redirect_uri');
      const state = url.searchParams.get('state');
      if (!redirectUri) {
        return new Response('missing redirect_uri', { status: 400 });
      }
      const redirect = new URL(redirectUri);
      redirect.searchParams.set('code', 'approved');
      if (state) redirect.searchParams.set('state', state);
      return Response.redirect(redirect.toString(), 302);
    }

    // Token exchange
    if (url.pathname === '/oauth/token' && request.method === 'POST') {
      return Response.json({
        access_token: 'gmx-relay-access-token',
        token_type: 'bearer',
        expires_in: 86400,
      }, { headers: CORS });
    }

    // MCP — POST
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

      const wantsSSE = (request.headers.get('Accept') || '').includes('text/event-stream');
      if (wantsSSE) {
        const enc = new TextEncoder();
        const stream = new ReadableStream({
          start(ctrl) {
            for (const r of responses) {
              ctrl.enqueue(enc.encode(`event: message\ndata: ${JSON.stringify(r)}\n\n`));
            }
            ctrl.close();
          },
        });
        return new Response(stream, {
          headers: { ...CORS, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
        });
      }

      const result = isBatch ? responses : (responses[0] ?? null);
      return Response.json(result, { headers: CORS });
    }

    // GET — server info
    if (request.method === 'GET') {
      return Response.json(
        { name: 'gmx-graphql-mcp', version: '1.0.0', transport: 'streamable-http' },
        { headers: CORS }
      );
    }

    return new Response('Method not allowed', { status: 405, headers: CORS });
  },
};

async function handle(msg) {
  const { id, method, params } = msg;
  if (!id) return null;

  switch (method) {
    case 'initialize':
      return {
        jsonrpc: '2.0', id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'gmx-graphql-mcp', version: '1.0.0' },
        },
      };

    case 'ping':
      return { jsonrpc: '2.0', id, result: {} };

    case 'tools/list':
      return {
        jsonrpc: '2.0', id,
        result: {
          tools: [{
            name: 'graphql_query',
            description: 'Execute a GraphQL query against the GMX Solana Base endpoint',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'GraphQL query string' },
                variables: { type: 'object', description: 'Variables (optional)' },
              },
              required: ['query'],
            },
          }],
        },
      };

    case 'tools/call': {
      const { name, arguments: args } = params ?? {};
      if (name !== 'graphql_query') {
        return { jsonrpc: '2.0', id, error: { code: -32602, message: `Unknown tool: ${name}` } };
      }
      try {
        const res = await fetch(GMX_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: args.query, variables: args.variables ?? {} }),
        });
        const text = await res.text();
        return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }] } };
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
