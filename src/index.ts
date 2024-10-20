export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === '/api/v1/my-address') {
			const ip = request.headers.get('cf-connecting-ip');
			return new Response(`Hello from Cloudflare Worker! Your IP is ${ip}`, {
				headers: { 'content-type': 'text/plain' },
			});
		}
		return new Response('Not Found', { status: 404 });
	},
} satisfies ExportedHandler<Env>;
