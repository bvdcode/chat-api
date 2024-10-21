export interface Env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "DB" with the variable name you defined.
	DB: D1Database;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const keyValuePath = '/key-value/';

		if (url.pathname.startsWith(keyValuePath) && request.method === 'POST') {
			const key = url.pathname.slice(keyValuePath.length).trim();
			const value = await request.text();
			if (!value) {
				return new Response('No value provided', { status: 400 });
			}
			if (key.length > 255) {
				return new Response('Key too long', { status: 400 });
			}
			if (value.length > 65535) {
				return new Response('Value too long', { status: 400 });
			}
			if (!key) {
				return new Response('No key provided', { status: 400 });
			}
			const userAgent = request.headers.get('user-agent');
			if (!userAgent) {
				return new Response('No user-agent header', { status: 400 });
			}
			const ipAddr = request.headers.get('cf-connecting-ip');
			if (!ipAddr) {
				return new Response('No IP address header', { status: 400 });
			}

			// 'INSERT INTO user_key_values (key, value, user_agent, ip_address) VALUES (?, ?, ?, ?)'
			// вставить значения если их нет, иначе обновить
			const query = 'INSERT OR REPLACE INTO user_key_values (key, value, user_agent, ip_address) VALUES (?, ?, ?, ?)';

			await env.DB.prepare(query).bind(key, value, userAgent, ipAddr).run();
			return new Response('OK');
		}

		if (url.pathname.startsWith(keyValuePath) && request.method === 'GET') {
			const key = url.pathname.slice(keyValuePath.length).trim();
			if (!key) {
				return new Response('No key provided', { status: 400 });
			}
			const row = await env.DB.prepare('SELECT value, created_at FROM user_key_values WHERE key = ?').bind(key).first();
			if (!row) {
				return new Response('Not Found', { status: 404 });
			}

			// got value and created_at, return value and add created_at to response headers
			return new Response(String(row.value), {
				headers: {
					'Content-Type': 'text/plain; charset=utf-8',
					'Last-Modified': new Date(row.created_at as string).toISOString(),
				},
			});
		}

		if (url.pathname === '/my-address') {
			const ip = request.headers.get('cf-connecting-ip');
			return new Response(`Hello from Cloudflare Worker! Your IP is ${ip}`, {
				headers: { 'content-type': 'text/plain' },
			});
		}
		return new Response('Not Found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;
