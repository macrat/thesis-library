import assert from 'power-assert';

import queryFunc, { stringQuery, regexpQuery, emptyQuery } from '../../client/query';
import Marker from '../../client/marker';


export default function() {
	describe('stringQuery', () => {
		it('simple match', () => {
			const q = stringQuery('hoge fugafuga');
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

		it('smart case', () => {
			const lowerOnly = stringQuery('abc');
			assert.deepStrictEqual(lowerOnly('lower', 'abc aBc ABC'), [[
				new Marker(0, 3, 'lower'),
				new Marker(4, 7, 'lower'),
				new Marker(8, 11, 'lower'),
			]]);

			const upperOnly = stringQuery('ABC');
			assert.deepStrictEqual(upperOnly('upper', 'abc aBc ABC'), [[
				new Marker(8, 11, 'upper'),
			]]);

			const both = stringQuery('aBc');
			assert.deepStrictEqual(both('both', 'abc aBc ABC'), [[
				new Marker(4, 7, 'both'),
			]]);
		});
	});

	describe('regexpQuery', () => {
		it('simple match', () => {
			const q = regexpQuery('ab?c');
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

		it('smart case', () => {
			const lowerOnly = regexpQuery('ab?c');
			assert.deepStrictEqual(lowerOnly('lower', 'abc aBc ABC ac'), [[
				new Marker(0, 3, 'lower'),
				new Marker(4, 7, 'lower'),
				new Marker(8, 11, 'lower'),
				new Marker(12, 14, 'lower'),
			]]);

			const upperOnly = regexpQuery('AB?C');
			assert.deepStrictEqual(upperOnly('upper', 'abc aBc ABC ac'), [[
				new Marker(8, 11, 'upper'),
			]]);

			const both = regexpQuery('aB?c');
			assert.deepStrictEqual(both('both', 'abc aBc ABC ac'), [[
				new Marker(4, 7, 'both'),
				new Marker(12, 14, 'both'),
			]]);
		});
	});

	describe('emptyQuery', () => {
		it('simple match', () => {
			const q = emptyQuery;
			let r;

			r = q('elm', 'abcdef aca');
			assert.deepStrictEqual(r, [
				[new Marker(0, 0, 'elm')],
			]);

			r = q('test', 'asdfghj');
			assert.deepStrictEqual(r, [
				[new Marker(0, 0, 'test')],
			]);

			r = q('empty', '');
			assert.deepStrictEqual(r, [
				[new Marker(0, 0, 'empty')],
			]);
		});
	});

	describe('queryFunc', () => {
		it('regexp', () => {
			const re = queryFunc('/a/');
			assert.deepStrictEqual(re('re', '_/a/b/c//'), [[new Marker(2, 3, 're')]]);

			const empty = queryFunc('//');
			assert.deepStrictEqual(empty('empty', '_/a/b/c//'), [[
				new Marker(7, 9, 'empty'),
			]]);
		});

		it('string', () => {
			const str = queryFunc('_/a/');
			assert.deepStrictEqual(str('str', '_/a/b/c//'), [[new Marker(0, 4, 'str')]]);

			const slash = queryFunc('/');
			assert.deepStrictEqual(slash('slash', '_/a/b/c//'), [[
				new Marker(1, 2, 'slash'),
				new Marker(3, 4, 'slash'),
				new Marker(5, 6, 'slash'),
				new Marker(7, 8, 'slash'),
				new Marker(8, 9, 'slash'),
			]]);
		});

		it('empty', () => {
			const empty = queryFunc('');
			assert.deepStrictEqual(empty('empty', '_/a/b/c//'), [[new Marker(0, 0, 'empty')]]);
			const spaces = queryFunc('  \t');
			assert.deepStrictEqual(spaces('spaces', '_/a/b/c//'), [[new Marker(0, 0, 'spaces')]]);
		});
	});
}
