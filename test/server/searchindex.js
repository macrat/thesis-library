import assert from 'power-assert';

import Thesis from '../../server/thesis';
import { Index } from '../../server/database';


export default function() {
	beforeEach(function() {
		this.original = [
			{
				year: 2015,
				author: 'abc',
				title: 'hoge',
				degree: 'bachelor',
				content: 'test',
			},
			{
				year: 2017,
				author: 'def',
				title: 'fuga',
				degree: 'master',
				content: 'foobar',
			},
			{
				year: 2010,
				author: 'ghi',
				title: 'piyo',
				degree: 'doctor',
				content: 'exam',
			},
		];

		this.index = new Index(this.original);
	});

	it('convert to/from array', function() {
		assert.deepStrictEqual(this.index.asArray(), this.original);
	});

	it('convert to/from json', function() {
		const newIndex = new Index(JSON.parse(this.index.asJSON()));

		assert.deepStrictEqual(newIndex.asArray(), newIndex.asArray());
	});

	describe('append', function() {
		it('new thesis', function() {
			const newThesis = new Thesis({
				year: 2020,
				author: 'hello',
				title: 'world',
				degree: 'bachelor',
				overview: 'test',
				rawPassword: 'hogehoge',
			});
			this.index.append(newThesis, 'this is index content');

			const exceptArray = this.original.sort((x, y) => x.year - y.year);
			exceptArray.push({
				year: newThesis.year,
				author: newThesis.author,
				title: newThesis.title,
				degree: newThesis.degree,
				content: 'this is index content',
			});

			assert.deepStrictEqual(this.index.asArray().sort((x, y) => x.year - y.year), exceptArray);
		});

		it('exists thesis', function() {
			const newThesis = new Thesis({
				year: 2010,
				author: 'ghi',
				title: 'piyo',
				degree: 'doctor',
				overview: 'test',
				rawPassword: 'hogehoge',
			});
			this.index.append(newThesis, 'this is index content');

			const exceptArray = this.original.sort((x, y) => x.year - y.year);
			exceptArray[0].content = 'this is index content';

			assert.deepStrictEqual(this.index.asArray().sort((x, y) => x.year - y.year), exceptArray);
		});
	});

	describe('remove', function() {
		it('exists', function() {
			this.index.remove(this.original[0]);

			assert.deepStrictEqual(this.index.asArray(), this.original.slice(1));
		});

		it('not exists', function() {
			this.index.remove(new Thesis({
				year: 2020,
				author: 'hello',
				title: 'world',
				degree: 'bachelor',
				overview: 'test',
				rawPassword: 'hogehoge',
			}));

			assert.deepStrictEqual(this.index.asArray(), this.original);
		});
	});
}
