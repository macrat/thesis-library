import assert from 'power-assert';

import Searcher from '../../../client/searcher';
import Marker from '../../../client/marker';


export default function() {
	it('metadata', async function() {
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

	it('overview', async function() {
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

	it('text', async function() {
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

	it('text / overview', async function() {
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
}
