export default {
  async fetch(request) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    // MCP Streamable HTTP transport — POST only
    if (request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(
          JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }),
          { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
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
          headers: { ...cors, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
        });
      }

      const result = isBatch ? responses : (responses[0] ?? null);
      return new Response(JSON.stringify(result), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'GET') {
      return new Response(
        JSON.stringify({ name: 'gmx-graphql-mcp', version: '1.0.0', transport: 'streamable-http' }),
        { headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }

    return new Response('Method not allowed', { status: 405, headers: cors });
  },
};

async function handle(msg) {
  const { id, method, params } = msg;

  // Notifications — no response needed
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
          tools: [
            {
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
            },
          ],
        },
      };

    case 'tools/call': {
      const { name, arguments: args } = params ?? {};
      if (name !== 'graphql_query') {
        return { jsonrpc: '2.0', id, error: { code: -32602, message: `Unknown tool: ${name}` } };
      }
      try {
        const res = await fetch(
          'https://gmx-solana-sqd.squids.live/gmx-solana-base:prod/api/graphql',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: args.query, variables: args.variables ?? {} }),
          }
        );
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
