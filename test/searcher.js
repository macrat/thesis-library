import assert from 'power-assert';

import Searcher, { Marker, debug } from '../client/searcher';


describe('client', () => {
	describe('utils', () => {
		describe('searcher', () => {
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

			it('stringQuery', () => {
				const q = debug.stringQuery('hoge fugafuga');
				let r;

				r = q('elm', 'this is hoge and fugafuga and fugahoge');
				assert.deepStrictEqual(r, [
					[new Marker(8, 12, 'elm'), new Marker(34, 38, 'elm')],
					[new Marker(17, 25, 'elm')],
				]);

				r = q('test', 'a fugafuga!');
				assert.deepStrictEqual(r, [
					[],
					[new Marker(2, 10, 'test')],
				]);
			});

			it('stringQuery smart case', () => {
				const lowerOnly = debug.stringQuery('abc');
				assert.deepStrictEqual(lowerOnly('lower', 'abc aBc ABC'), [[
					new Marker(0, 3, 'lower'),
					new Marker(4, 7, 'lower'),
					new Marker(8, 11, 'lower'),
				]]);

				const upperOnly = debug.stringQuery('ABC');
				assert.deepStrictEqual(upperOnly('upper', 'abc aBc ABC'), [[
					new Marker(8, 11, 'upper'),
				]]);

				const both = debug.stringQuery('aBc');
				assert.deepStrictEqual(both('both', 'abc aBc ABC'), [[
					new Marker(4, 7, 'both'),
				]]);
			});

			it('regexpQuery', () => {
				const q = debug.regexpQuery('ab?c');
				let r;

				r = q('elm', 'abcdef aca');
				assert.deepStrictEqual(r, [
					[new Marker(0, 3, 'elm'), new Marker(7, 9, 'elm')],
				]);

				r = q('test', 'asdfghj');
				assert.deepStrictEqual(r, [
					[],
				]);
			});

			it('regexpQuery smart case', () => {
				const lowerOnly = debug.regexpQuery('ab?c');
				assert.deepStrictEqual(lowerOnly('lower', 'abc aBc ABC ac'), [[
					new Marker(0, 3, 'lower'),
					new Marker(4, 7, 'lower'),
					new Marker(8, 11, 'lower'),
					new Marker(12, 14, 'lower'),
				]]);

				const upperOnly = debug.regexpQuery('AB?C');
				assert.deepStrictEqual(upperOnly('upper', 'abc aBc ABC ac'), [[
					new Marker(8, 11, 'upper'),
				]]);

				const both = debug.regexpQuery('aB?c');
				assert.deepStrictEqual(both('both', 'abc aBc ABC ac'), [[
					new Marker(4, 7, 'both'),
					new Marker(12, 14, 'both'),
				]]);
			});

			it('queryFunc', () => {
				const re = debug.queryFunc('/a/');
				assert.deepStrictEqual(re('re', '_/a/b/c//'), [[new Marker(2, 3, 're')]]);

				const str = debug.queryFunc('_/a/');
				assert.deepStrictEqual(str('str', '_/a/b/c//'), [[new Marker(0, 4, 'str')]]);

				const empty = debug.queryFunc('  ');
				assert.deepStrictEqual(empty('empty', '_/a/b/c//'), [[new Marker(0, 0, 'empty')]]);

				const slash1 = debug.queryFunc('/');
				assert.deepStrictEqual(slash1('slash1', '_/a/b/c//'), [[
					new Marker(1, 2, 'slash1'),
					new Marker(3, 4, 'slash1'),
					new Marker(5, 6, 'slash1'),
					new Marker(7, 8, 'slash1'),
					new Marker(8, 9, 'slash1'),
				]]);

				const slash2 = debug.queryFunc('//');
				assert.deepStrictEqual(slash2('slash2', '_/a/b/c//'), [[
					new Marker(7, 9, 'slash2'),
				]]);
			});

			it('mergeFound', () => {
				assert.deepStrictEqual(debug.mergeFound([
					[[new Marker(0, 1, 'hoge')]],
					[[new Marker(1, 2, 'fuga')]],
				]), [[new Marker(0, 1, 'hoge'), new Marker(1, 2, 'fuga')]]);

				assert.deepStrictEqual(debug.mergeFound([
					[[new Marker(0, 1, 'hoge'), new Marker(2, 3, 'foo')], [], []],
					[[new Marker(1, 2, 'fuga')], [new Marker(3, 4, 'bar')], []],
				]), [
					[new Marker(0, 1, 'hoge'), new Marker(2, 3, 'foo'), new Marker(1, 2, 'fuga')],
					[new Marker(3, 4, 'bar')],
					[]
				]);
			});

			it('check', () => {
				assert.strictEqual(debug.check([[]]), false);
				assert.strictEqual(debug.check([[], [], []]), false);
				assert.strictEqual(debug.check([[], [new Marker(0, 2, 'hoge')], [new Marker(1, 3, 'hoge')]]), false);
				assert.strictEqual(debug.check([[new Marker(0, 2, 'hoge')], [new Marker(1, 3, 'hoge')]]), true);
			});

			it('resultIndexOf', () => {
				const xs = [
					{
						data: {
							year: 2017,
							author: 'hoge',
							title: 'hello world',
						},
						founds: [],
					},
					{
						data: {
							year: 2018,
							author: 'fuga',
							title: 'this is test',
						},
						founds: [],
					},
					{
						data: {
							year: 2019,
							author: 'foo',
							title: 'its test',
						},
						founds: [],
					},
					{
						data: {
							year: 2020,
							author: 'bar',
							title: 'abc def',
						},
						founds: [],
					},
				];

				assert.strictEqual(debug.resultIndexOf(xs, xs[0]), 0);
				assert.strictEqual(debug.resultIndexOf(xs, xs[2]), 2);
				assert.strictEqual(debug.resultIndexOf(xs, { data: { year: 0, author: 'none', title: 'not found' } }), -1);
			});

			it('mergeResults', () => {
				assert.deepStrictEqual(debug.mergeResults([
					{
						data: {
							year: 2010,
							author: 'hoge',
							title: 'foo',
							overview: 'test',
						},
						founds: [[new Marker(0, 0, 'test')]],
					},
					{
						data: {
							year: 2017,
							author: 'fuga',
							title: 'bar',
							overview: 'aaa',
						},
						founds: [[new Marker(0, 0, 'foo')]],
					},
				], [
					{
						data: {
							year: 2017,
							author: 'fuga',
							title: 'bar',
							text: 'bbb',
						},
						founds: [[new Marker(0, 0, 'bar')]],
					},
					{
						data: {
							year: 2010,
							author: 'hoge',
							title: 'foo',
							text: 'abc',
						},
						founds: [[new Marker(0, 0, 'hoge')]],
					},
					{
						data: {
							year: 2020,
							author: 'qwe',
							title: 'asd',
							text: 'only here',
						},
						founds: [[new Marker(0, 0, 'hoge')]],
					},
				]), [
					{
						data: {
							year: 2010,
							author: 'hoge',
							title: 'foo',
							overview: 'test',
							text: 'abc',
						},
						founds: [[new Marker(0, 0, 'test'), new Marker(0, 0, 'hoge')]],
					},
					{
						data: {
							year: 2017,
							author: 'fuga',
							title: 'bar',
							overview: 'aaa',
							text: 'bbb',
						},
						founds: [[new Marker(0, 0, 'foo'), new Marker(0, 0, 'bar')]],
					},
					{
						data: {
							year: 2020,
							author: 'qwe',
							title: 'asd',
							text: 'only here',
						},
						founds: [[new Marker(0, 0, 'hoge')]],
					},
				]);

				assert.deepStrictEqual(debug.mergeResults([
					{
						data: {
							year: 2010,
							author: 'hoge',
							title: 'foo',
							overview: 'test',
						},
						founds: [[new Marker(0, 0, 'test')]],
					},
					{
						data: {
							year: 2017,
							author: 'fuga',
							title: 'bar',
							overview: 'aaa',
						},
						founds: [[new Marker(0, 0, 'foo')]],
					},
					{
						data: {
							year: 2020,
							author: 'qwe',
							title: 'asd',
							text: 'only here',
						},
						founds: [[new Marker(0, 0, 'hoge')]],
					},
				], [
					{
						data: {
							year: 2017,
							author: 'fuga',
							title: 'bar',
							text: 'bbb',
						},
						founds: [[new Marker(0, 0, 'bar')]],
					},
					{
						data: {
							year: 2010,
							author: 'hoge',
							title: 'foo',
							text: 'abc',
						},
						founds: [[new Marker(0, 0, 'hoge')]],
					},
				]), [
					{
						data: {
							year: 2010,
							author: 'hoge',
							title: 'foo',
							overview: 'test',
							text: 'abc',
						},
						founds: [[new Marker(0, 0, 'test'), new Marker(0, 0, 'hoge')]],
					},
					{
						data: {
							year: 2017,
							author: 'fuga',
							title: 'bar',
							overview: 'aaa',
							text: 'bbb',
						},
						founds: [[new Marker(0, 0, 'foo'), new Marker(0, 0, 'bar')]],
					},
					{
						data: {
							year: 2020,
							author: 'qwe',
							title: 'asd',
							text: 'only here',
						},
						founds: [[new Marker(0, 0, 'hoge')]],
					},
				]);
			});

			describe('Marker', () => {
				beforeEach(function() {
					this.a = new Marker(0, 10, 'test');
					this.b = new Marker(5, 20, 'hoge');
					this.c = new Marker(15, 30, 'fuga');
				});
				it('props', function() {
					assert.strictEqual(this.a.from, 0);
					assert.strictEqual(this.a.to, 10);
					assert.strictEqual(this.a.elm, 'test');

					assert.strictEqual(this.b.from, 5);
					assert.strictEqual(this.b.to, 20);
					assert.strictEqual(this.b.elm, 'hoge');

					assert.strictEqual(this.c.from, 15);
					assert.strictEqual(this.c.to, 30);
					assert.strictEqual(this.c.elm, 'fuga');
				});
				it('overwrap', function() {
					assert.strictEqual(this.a.isOverwrapWith(this.b), true);
					assert.strictEqual(this.a.isOverwrapWith(this.c), false);
					assert.strictEqual(this.b.isOverwrapWith(this.c), true);
				});
				it('length', function() {
					assert.strictEqual(this.a.length, 10);
					assert.strictEqual(this.b.length, 15);
					assert.strictEqual(this.c.length, 15);
				});
				it('merge', function() {
					assert.strictEqual(this.a.merge(this.b).from, 0);
					assert.strictEqual(this.a.merge(this.b).to, 20);

					assert.strictEqual(this.b.merge(this.c).from, 5);
					assert.strictEqual(this.b.merge(this.c).to, 30);

					assert.throws(() => {
						this.a.merge(this.c);
					}, 'is not overwrapped');
				});
			});

			it('search metadata', async function() {
				assert.deepStrictEqual(await this.searcher.search('world', {
					title: true,
					author: false,
				}), [
					{
						data: {
							year: 2015,
							title: 'world',
							degree: 'bachelor',
							author: 'test',
							overview: 'defghi',
						},
						founds: [[new Marker(0, 5, 'title')]],
					},
				]);

				assert.deepStrictEqual(await this.searcher.search('world', {
					title: false,
					author: true,
				}), [
					{
						data: {
							year: 2017,
							title: 'hello',
							degree: 'master',
							author: 'world',
							overview: 'abcdef',
						},
						founds: [[new Marker(0, 5, 'author')]],
					},
				]);
			});

			it('search overview', async function() {
				assert.deepStrictEqual(await this.searcher.search('abc'), [
					{
						data: {
							year: 2017,
							title: 'hello',
							degree: 'master',
							author: 'world',
							overview: 'abcdef',
						},
						founds: [[new Marker(0, 3, 'overview')]],
					},
				]);

				assert.deepStrictEqual(await this.searcher.search('def'), [
					{
						data: {
							year: 2017,
							title: 'hello',
							degree: 'master',
							author: 'world',
							overview: 'abcdef',
						},
						founds: [[new Marker(3, 6, 'overview')]],
					},
					{
						data: {
							year: 2015,
							title: 'world',
							degree: 'bachelor',
							author: 'test',
							overview: 'defghi',
						},
						founds: [[new Marker(0, 3, 'overview')]],
					},
				]);
			});

			it('search text', async function() {
				assert.deepStrictEqual(await this.searcher.search('body', {overview: false, text: true}), [
					{
						data: {
							year: 2017,
							title: 'hello',
							degree: 'master',
							author: 'world',
							text: 'this is body',
							overview: 'abcdef',
						},
						founds: [[new Marker(8, 12, 'text')]],
					},
				]);

				assert.deepStrictEqual(await this.searcher.search('is', {overview: false, text: true}), [
					{
						data: {
							year: 2017,
							title: 'hello',
							degree: 'master',
							author: 'world',
							text: 'this is body',
							overview: 'abcdef',
						},
						founds: [[new Marker(2, 4, 'text'), new Marker(5, 7, 'text')]],
					},
					{
						data: {
							year: 2015,
							title: 'world',
							degree: 'bachelor',
							author: 'test',
							text: 'it is content',
							overview: 'defghi',
						},
						founds: [[new Marker(3, 5, 'text')]],
					},
				]);
			});

			it('search text / overview', async function() {
				assert.deepStrictEqual(await this.searcher.search('body abc', {overview: true, text: true}), [
					{
						data: {
							year: 2017,
							title: 'hello',
							degree: 'master',
							author: 'world',
							text: 'this is body',
							overview: 'abcdef',
						},
						founds: [[new Marker(8, 12, 'text')], [new Marker(0, 3, 'overview')]],
					},
				]);

				assert.deepStrictEqual(await this.searcher.search('is def', {overview: true, text: true}), [
					{
						data: {
							year: 2017,
							title: 'hello',
							degree: 'master',
							author: 'world',
							text: 'this is body',
							overview: 'abcdef',
						},
						founds: [[new Marker(2, 4, 'text'), new Marker(5, 7, 'text')], [new Marker(3, 6, 'overview')]],
					},
					{
						data: {
							year: 2015,
							title: 'world',
							degree: 'bachelor',
							author: 'test',
							text: 'it is content',
							overview: 'defghi',
						},
						founds: [[new Marker(3, 5, 'text')], [new Marker(0, 3, 'overview')]],
					},
				]);
			});

			it('sanitize', () => {
				assert.strictEqual(debug.sanitize('hello&world<this>is\'test"'), 'hello&amp;world&lt;this&gt;is&#x27;test&quot;');
			});

			it('joinMarks', () => {
				assert.deepStrictEqual(debug.joinMarks([
					new Marker(0, 10),
					new Marker(5, 12),
					new Marker(20, 25),
				]), [
					new Marker(0, 12),
					new Marker(20, 25),
				]);

				assert.deepStrictEqual(debug.joinMarks([
					new Marker(1, 10),
					new Marker(15, 25),
					new Marker(5, 20),
				]), [
					new Marker(1, 25),
				]);
			});

			it('markup', () => {
				assert.strictEqual(
					debug.markup('hello beautiful world', []),
					'hello beautiful world',
				);

				assert.strictEqual(
					debug.markup('hello beautiful world', [new Marker(6, 15)]),
					'hello <mark>beautiful</mark> world',
				);

				assert.strictEqual(
					debug.markup('hello beautiful world', [new Marker(0, 0, 'test'), new Marker(6, 15), new Marker(0, 0, 'test')]),
					'hello <mark>beautiful</mark> world',
				);

				assert.strictEqual(
					debug.markup('<u>hello</u> <b>beautiful</b> <i>world</i>', [new Marker(13, 29)]),
					'&lt;u&gt;hello&lt;/u&gt; <mark>&lt;b&gt;beautiful&lt;/b&gt;</mark> &lt;i&gt;world&lt;/i&gt;',
				);

				assert.strictEqual(
					debug.markup('hello beautiful world', [new Marker(6, 15), new Marker(0, 5), new Marker(16, 22)]),
					'<mark>hello</mark> <mark>beautiful</mark> <mark>world</mark>',
				);

				assert.strictEqual(
					debug.markup('a'.repeat(1000) + ' hello ' + 'b'.repeat(1000), [new Marker(1001, 1006)]),
					'a'.repeat(250 - 3) + ' <mark>hello</mark> ' + 'b'.repeat(250 - 3),
				);

				assert.strictEqual(
					debug.markup('<b>test</b>' + 'a'.repeat(1000), []),
					'&lt;b&gt;test&lt;/b&gt;' + 'a'.repeat(500 - 11),
				);
			});

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
		});
	});
});
