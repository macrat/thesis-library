import assert from 'power-assert';

import Marker from '../../../client/marker';


export default function() {
	it('makeHTML',  async function() {
		assert.deepStrictEqual(this.searcher.makeHTML({
			data: (await this.client.getOverviewIndex())[0],
			founds: [[new Marker(0, 2, 'title'), new Marker(3, 5, 'author'), new Marker(2, 4, 'overview')]],
		}), {
			year: 2017,
			degree: 'master',
			author: 'world',
			title: 'hello',
			authorHTML: 'wor<mark>ld</mark>',
			titleHTML: '<mark>he</mark>llo',
			html: 'ab<mark>cd</mark>ef',
		});
	});
}
