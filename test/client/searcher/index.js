import Searcher from '../../../client/searcher';

import search from './search';
import makeHTML from './makehtml';
import utils from './utils';


export default function() {
	beforeEach(function(done) {
		this.client = {
			getOverviewIndex: function() {
				return Promise.resolve([
					{
						year: 2017,
						degree: 'master',
						title: 'hello',
						author: 'world',
						overview: 'abcdef',
					},
					{
						year: 2015,
						degree: 'bachelor',
						title: 'world',
						author: 'test',
						overview: 'defghi',
					},
				]);
			},
			getTextIndex: function() {
				return Promise.resolve([
					{
						year: 2017,
						degree: 'master',
						title: 'hello',
						author: 'world',
						text: 'this is body',
					},
					{
						year: 2015,
						degree: 'bachelor',
						title: 'world',
						author: 'test',
						text: 'it is content',
					},
				]);
			},
		};
		this.searcher = new Searcher(this.client);
		done();
	});

	describe('search', search);
	describe('makeHTML', makeHTML);
	describe('private utils', utils);
}
