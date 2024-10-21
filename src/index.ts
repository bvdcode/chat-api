// SQL history:
//
// CREATE TABLE user_key_values (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     key VARCHAR(255) NOT NULL,
//     value TEXT NOT NULL
// );

export interface Env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "DB" with the variable name you defined.
	DB: D1Database;
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);

		// set: /set/:key, value in body
		if (url.pathname.startsWith('/set/')) {
			const key = url.pathname.slice(5).trim();
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
			await env.DB.prepare('INSERT INTO user_key_values (key, value) VALUES (?, ?)').bind(key, value).run();
			return new Response('OK');
		}

		// get: /get/:key
		if (url.pathname.startsWith('/get/')) {
			const key = url.pathname.slice(5).trim();
			if (!key) {
				return new Response('No key provided', { status: 400 });
			}
			const row = await env.DB.prepare('SELECT value FROM user_key_values WHERE key = ?').bind(key).first();
			if (!row) {
				return new Response('Not Found', { status: 404 });
			}
			return new Response(String(row.value), { headers: { 'content-type': 'text/plain' } });
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
