import assert from 'power-assert';

import Searcher, { debug } from '../client/searcher';


describe('client', () => {
	describe('utils', () => {
		describe('searcher', () => {
			beforeEach(function(done) {
				this.client = {
					getOverviewIndex: function() {
						return Promise.resolve([
							{
								year: 2017,
								title: 'hello',
								author: 'world',
								content: 'abcdef',
							},
							{
								year: 2015,
								title: 'world',
								author: 'test',
								content: 'defghi',
							},
						]);
					},
					getTextIndex: function() {
						return Promise.resolve([
							{
								year: 2017,
								title: 'hello',
								author: 'world',
								content: 'this is body',
							},
							{
								year: 2015,
								title: 'world',
								author: 'test',
								content: 'it is content',
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
					[{elm: 'elm', from: 8, to: 12}, {elm: 'elm', from: 34, to: 38}],
					[{elm: 'elm', from: 17, to: 25}],
				]);

				r = q('test', 'a fugafuga!');
				assert.deepStrictEqual(r, [
					[],
					[{elm: 'test', from: 2, to: 10}],
				]);
			});

			it('regexpQuery', () => {
				const q = debug.regexpQuery('ab?c');
				let r;

				r = q('elm', 'abcdef aca');
				assert.deepStrictEqual(r, [
					[{elm: 'elm', from: 0, to: 3}, {elm: 'elm', from: 7, to: 9}],
				]);

				r = q('test', 'asdfghj');
				assert.deepStrictEqual(r, [
					[],
				]);
			});

			it('queryFunc', () => {
				const re = debug.queryFunc('/a/');
				assert.deepStrictEqual(re('re', '_/a/b/c/'), [[{elm: 're', from: 2, to: 3}]]);

				const str = debug.queryFunc('_/a/');
				assert.deepStrictEqual(str('str', '_/a/b/c/'), [[{elm: 'str', from: 0, to: 4}]]);

				const empty = debug.queryFunc('  ');
				assert.deepStrictEqual(empty('empty', '_/a/b/c/'), [[{elm: 'empty' }]]);
			});

			it('mergeFound', () => {
				assert.deepStrictEqual(debug.mergeFound([
					[[{elm: 'hoge', from: 0, to: 1}]],
					[[{elm: 'fuga', from: 1, to: 2}]],
				]), [[{elm: 'hoge', from: 0, to: 1}, {elm: 'fuga', from: 1, to: 2}]]);

				assert.deepStrictEqual(debug.mergeFound([
					[[{elm: 'hoge', from: 0, to: 1}, {elm: 'foo', from: 2, to: 3}], [], []],
					[[{elm: 'fuga', from: 1, to: 2}], [{elm: 'bar', from: 3, to: 4}], []],
				]), [
					[{elm: 'hoge', from: 0, to: 1}, {elm: 'foo', from: 2, to: 3}, {elm: 'fuga', from: 1, to: 2}],
					[{elm: 'bar', from: 3, to: 4}],
					[]
				]);
			});

			it('check', () => {
				assert.equal(debug.check([[]]), false);
				assert.equal(debug.check([[], [], []]), false);
				assert.equal(debug.check([[], [{elm: 'hoge', from: 0, to: 2}], [{elm: 'hoge', from: 1, to: 3}]]), false);
				assert.equal(debug.check([[{elm: 'hoge', from: 0, to: 2}], [{elm: 'hoge', from: 1, to: 3}]]), true);
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

				assert.equal(debug.resultIndexOf(xs, xs[0]), 0);
				assert.equal(debug.resultIndexOf(xs, xs[2]), 2);
				assert.equal(debug.resultIndexOf(xs, { data: { year: 0, author: 'none', title: 'not found' } }), -1);
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
						founds: [[{elm: 'test'}]],
					},
					{
						data: {
							year: 2017,
							author: 'fuga',
							title: 'bar',
							overview: 'aaa',
						},
						founds: [[{elm: 'foo'}]],
					},
				], [
					{
						data: {
							year: 2017,
							author: 'fuga',
							title: 'bar',
							text: 'bbb',
						},
						founds: [[{elm: 'bar'}]],
					},
					{
						data: {
							year: 2010,
							author: 'hoge',
							title: 'foo',
							text: 'abc',
						},
						founds: [[{elm: 'hoge'}]],
					},
					{
						data: {
							year: 2020,
							author: 'qwe',
							title: 'asd',
							text: 'only here',
						},
						founds: [[{elm: 'hoge'}]],
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
						founds: [[{elm: 'test'}, {elm: 'hoge'}]],
					},
					{
						data: {
							year: 2017,
							author: 'fuga',
							title: 'bar',
							overview: 'aaa',
							text: 'bbb',
						},
						founds: [[{elm: 'foo'}, {elm: 'bar'}]],
					},
					{
						data: {
							year: 2020,
							author: 'qwe',
							title: 'asd',
							text: 'only here',
						},
						founds: [[{elm: 'hoge'}]],
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
						founds: [[{elm: 'test'}]],
					},
					{
						data: {
							year: 2017,
							author: 'fuga',
							title: 'bar',
							overview: 'aaa',
						},
						founds: [[{elm: 'foo'}]],
					},
					{
						data: {
							year: 2020,
							author: 'qwe',
							title: 'asd',
							text: 'only here',
						},
						founds: [[{elm: 'hoge'}]],
					},
				], [
					{
						data: {
							year: 2017,
							author: 'fuga',
							title: 'bar',
							text: 'bbb',
						},
						founds: [[{elm: 'bar'}]],
					},
					{
						data: {
							year: 2010,
							author: 'hoge',
							title: 'foo',
							text: 'abc',
						},
						founds: [[{elm: 'hoge'}]],
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
						founds: [[{elm: 'test'}, {elm: 'hoge'}]],
					},
					{
						data: {
							year: 2017,
							author: 'fuga',
							title: 'bar',
							overview: 'aaa',
							text: 'bbb',
						},
						founds: [[{elm: 'foo'}, {elm: 'bar'}]],
					},
					{
						data: {
							year: 2020,
							author: 'qwe',
							title: 'asd',
							text: 'only here',
						},
						founds: [[{elm: 'hoge'}]],
					},
				]);
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
							author: 'test',
							overview: 'defghi',
						},
						founds: [[{elm: 'title', from: 0, to: 5}]],
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
							author: 'world',
							overview: 'abcdef',
						},
						founds: [[{elm: 'author', from: 0, to: 5}]],
					},
				]);
			});

			it('search overview', async function() {
				assert.deepStrictEqual(await this.searcher.search('abc'), [
					{
						data: {
							year: 2017,
							title: 'hello',
							author: 'world',
							overview: 'abcdef',
						},
						founds: [[{elm: 'overview', from: 0, to: 3}]],
					},
				]);

				assert.deepStrictEqual(await this.searcher.search('def'), [
					{
						data: {
							year: 2017,
							title: 'hello',
							author: 'world',
							overview: 'abcdef',
						},
						founds: [[{elm: 'overview', from: 3, to: 6}]],
					},
					{
						data: {
							year: 2015,
							title: 'world',
							author: 'test',
							overview: 'defghi',
						},
						founds: [[{elm: 'overview', from: 0, to: 3}]],
					},
				]);
			});

			it('search text', async function() {
				assert.deepStrictEqual(await this.searcher.search('body', {overview: false, text: true}), [
					{
						data: {
							year: 2017,
							title: 'hello',
							author: 'world',
							text: 'this is body',
							overview: 'abcdef',
						},
						founds: [[{elm: 'text', from: 8, to: 12}]],
					},
				]);

				assert.deepStrictEqual(await this.searcher.search('is', {overview: false, text: true}), [
					{
						data: {
							year: 2017,
							title: 'hello',
							author: 'world',
							text: 'this is body',
							overview: 'abcdef',
						},
						founds: [[{elm: 'text', from: 2, to: 4}, {elm: 'text', from: 5, to: 7}]],
					},
					{
						data: {
							year: 2015,
							title: 'world',
							author: 'test',
							text: 'it is content',
							overview: 'defghi',
						},
						founds: [[{elm: 'text', from: 3, to: 5}]],
					},
				]);
			});

			it('search text / overview', async function() {
				assert.deepStrictEqual(await this.searcher.search('body abc', {overview: true, text: true}), [
					{
						data: {
							year: 2017,
							title: 'hello',
							author: 'world',
							text: 'this is body',
							overview: 'abcdef',
						},
						founds: [[{elm: 'text', from: 8, to: 12}], [{elm: 'overview', from: 0, to: 3}]],
					},
				]);

				assert.deepStrictEqual(await this.searcher.search('is def', {overview: true, text: true}), [
					{
						data: {
							year: 2017,
							title: 'hello',
							author: 'world',
							text: 'this is body',
							overview: 'abcdef',
						},
						founds: [[{elm: 'text', from: 2, to: 4}, {elm: 'text', from: 5, to: 7}], [{elm: 'overview', from: 3, to: 6}]],
					},
					{
						data: {
							year: 2015,
							title: 'world',
							author: 'test',
							text: 'it is content',
							overview: 'defghi',
						},
						founds: [[{elm: 'text', from: 3, to: 5}], [{elm: 'overview', from: 0, to: 3}]],
					},
				]);
			});
		});
	});
});
