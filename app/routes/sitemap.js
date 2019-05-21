const router = require('express').Router();
const rp = require('request-promise');
const covert = require('../../covert.js');

router.get('/', async (req, res) => {
	const domain = covert.app_url;
	
	const popular_packs = await rp({uri: `${domain}/api/sticker-packs?sort=popular`, json: true});
	const static_routes = [
		'/sticker-packs',
		'/docs',
		'/terms.html'
	];

	const pack_xml = popular_packs.packs.map(pack => `<url><loc>${domain}/pack/${pack.key}</loc></url>`).join('');
	const route_xml = static_routes.map(route => `<url><loc>${domain}${route}</loc></url>`).join('');

	const xml = `
		<?xml version="1.0" encoding="UTF-8"?>
		<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
		${route_xml + pack_xml}
		</urlset>
	`.replace(/(\t|\n)+/g, '');

	res.set('Content-Type', 'text/xml');
	res.send(xml);
});

module.exports = router; 
