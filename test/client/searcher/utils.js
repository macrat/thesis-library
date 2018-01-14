import assert from 'power-assert';

import Searcher, { debug } from '../../../client/searcher';
import Marker from '../../../client/marker';


export default function() {
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
}
