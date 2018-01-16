import zlibjs from 'zlibjs';


const gcsAddress = `https://storage.googleapis.com/${GCLOUD_BUCKET}`;

let overviewCache = null;
let textCache = null;

let overview = null;


function FetchOverview() {
	return fetch(new Request(gcsAddress + '/index/overview')).then(response => {
		overviewCache = response.clone();

		return response.clone().json().then(json => {
			overview = json;
			return response;
		});
	});
}


function YearList() {
	const years = overview.map(x => x.year).filter((x, i, xs) => xs.indexOf(x) === i);

	return new Response(JSON.stringify(years), {
		headers: { 'Content-Type': 'application/json' },
	});
}


function ThesisesOfYear(year) {
	const thesises = overview.filter(x => x.year === year).map(x => ({
		year: x.year,
		author: x.author,
		title: x.title,
	}));

	return new Response(JSON.stringify(thesises), {
		headers: { 'Content-Type': 'application/json' },
	});
}


self.addEventListener('install', ev => {
	self.skipWaiting();

	ev.waitUntil(FetchOverview());
});


self.addEventListener('activate', ev => {
	clients.claim();
});


self.addEventListener('fetch', ev => {
	const url = new URL(ev.request.url);

	if (url.origin === location.origin) {
		if (url.pathname === '/api-worker/clear-cache') {
			overviewCache = null;
			textCache = null;
			overview = null;

			ev.respondWith(new Response());

			FetchOverview().catch(console.error);

			return;
		}

		let m;
		if (m = /^\/api-worker\/quick-metadata\/(20[0-9][0-9])\/([^\/]+)\/(.+)$/.exec(url.pathname)) {
			const year = Number(m[1]);
			const author = decodeURIComponent(m[2]);
			const title = decodeURIComponent(m[3]);

			if (overview) {
				const found = overview.filter(x => x.year === year && x.author === author && x.title === title);
				if (found.length !== 1) {
					ev.respondWith(new Response('{}', {
						headers: { 'Content-Type': 'application/json' },
					}));
				} else {
					const data = {
						year: found[0].year,
						author: found[0].author,
						degree: found[0].degree,
						overview: found[0].content,
						downloadURL: gcsAddress + `${m[1]}/${m[2]}/${m[3]}`,
					};
					ev.respondWith(new Response(JSON.stringify(data), {
						headers: { 'Content-Type': 'application/json' },
					}));
				}
			} else {
				ev.respondWith(new Response('{}', {
					headers: { 'Content-Type': 'application/json' },
				}));
			}
			return;
		}

		if (url.pathname === '/api/index/overview') {
			if (overviewCache) {
				ev.respondWith(overviewCache.clone());
			} else {
				ev.respondWith(FetchOverview());
			}
			return;
		}

		if (url.pathname === '/api/index/text') {
			if (textCache) {
				ev.respondWith(textCache.clone());
			} else {
				ev.respondWith(fetch(gcsAddress + '/index/text').then(response => {
					textCache = response.clone();
					return response;
				}));
			}
			return;
		}

		if (url.pathname === '/api/thesis/') {
			if (overview) {
				ev.respondWith(YearList());
			} else {
				ev.respondWith(FetchOverview().then(YearList));
			}
			return;
		}

		if (/^\/api\/thesis\/20[0-9][0-9]\/$/.test(url.pathname)) {
			const year = Number(/^\/api\/thesis\/(20[0-9][0-9])\/$/.exec(url.pathname)[1]);

			if (overview) {
				ev.respondWith(ThesisesOfYear(year));
			} else {
				ev.respondWith(FetchOverview().then(() => ThesisesOfYear(year)));
			}
			return;
		}

		if (/^\/api\/thesis\/20[0-9][0-9]\/[^\/]+\/[^\/]+$/.test(url.pathname) && ev.request.method === 'GET') {
			const path = /^\/api\/thesis(\/20[0-9][0-9]\/[^\/]+\/[^\/]+)$/.exec(url.pathname)[1];

			ev.respondWith(fetch(new Request(gcsAddress + path, { mode: 'cors' })).then(data => {
				return new Promise((resolve, reject) => {
					zlibjs.gunzip(new Buffer(data.headers.get('x-goog-meta-metadata'), 'base64'), (err, buf) => {
						if (err) {
							reject(err);
						} else {
							resolve(new Buffer(buf).toString());
						}
					});
				}).then(metadata => {
					return data.blob().then(blob => new Response(blob, {
						ok: data.ok,
						status: data.status,
						url: url,
						headers: new Headers({
							'Content-Type': 'application/pdf',
							'Thesis-Library-metadata': new Buffer(metadata).toString('base64'),
						}),
					}));
				});
			}));
			return;
		}
	}

	ev.respondWith(fetch(ev.request));
});
