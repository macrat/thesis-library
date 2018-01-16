import assert from 'power-assert';
import md5 from 'md5';
import { URL } from 'url';

import Thesis from '../../server/thesis';


export default function() {
	describe('constructor', () => {
		it('satify arguments', () => {
			assert.doesNotThrow(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			}));
		});

		it('year check', () => {
			assert.throws(() => new Thesis({
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			}), err => {
				assert.equal(err, 'missing year');
				return true;
			});

			assert.throws(() => new Thesis({
				year: 'this year',
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			}), err => {
				assert.equal(err, 'invalid year');
				return true;
			});
		});

		it('degree check', () => {
			assert.throws(() => new Thesis({
				year: 2017,
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			}), err => {
				assert.equal(err, 'missing degree');
				return true;
			});

			assert.doesNotThrow(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			}));

			assert.doesNotThrow(() => new Thesis({
				year: 2017,
				degree: 'master',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			}));

			assert.doesNotThrow(() => new Thesis({
				year: 2017,
				degree: 'doctor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			}));

			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'hoge',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			}), err => {
				assert.equal(err, 'invalid degree');
				return true;
			});
		});

		it('author check', () => {
			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			}), err => {
				assert.equal(err, 'missing author');
				return true;
			});

			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: '',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			}), err => {
				assert.equal(err, 'invalid author');
				return true;
			});

			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: false,
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			}), err => {
				assert.equal(err, 'invalid author');
				return true;
			});
		});

		it('title check', () => {
			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			}), err => {
				assert.equal(err, 'missing title');
				return true;
			});

			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: '',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			}), err => {
				assert.equal(err, 'invalid title');
				return true;
			});

			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 42,
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			}), err => {
				assert.equal(err, 'invalid title');
				return true;
			});
		});

		it('overview check', () => {
			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				memo: 'this is memo',
				rawPassword: 'abc',
			}), err => {
				assert.equal(err, 'missing overview');
				return true;
			});

			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: '',
				memo: 'this is memo',
				rawPassword: 'abc',
			}), err => {
				assert.equal(err, 'invalid overview');
				return true;
			});

			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: null,
				memo: 'this is memo',
				rawPassword: 'abc',
			}), err => {
				assert.equal(err, 'invalid overview');
				return true;
			});
		});

		it('memo check', () => {
			assert.doesNotThrow(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				rawPassword: 'abc',
			}));

			assert.doesNotThrow(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: '',
				rawPassword: 'abc',
			}));

			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: false,
				rawPassword: 'abc',
			}), err => {
				assert.equal(err, 'invalid memo');
				return true;
			});

			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 128,
				rawPassword: 'abc',
			}), err => {
				assert.equal(err, 'invalid memo');
				return true;
			});
		});

		it('password check', () => {
			assert.doesNotThrow(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			}));

			assert.doesNotThrow(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				password: md5('abc'),
			}));

			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
			}), err => {
				assert.equal(err, 'missing password');
				return true;
			});

			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: null,
			}), err => {
				assert.equal(err, 'invalid password');
				return true;
			});

			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				password: '',
			}), err => {
				assert.equal(err, 'invalid password');
				return true;
			});

			assert.throws(() => new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				password: false,
			}), err => {
				assert.equal(err, 'invalid password');
				return true;
			});
		});

		it('props', () => {
			const withMemo = new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				memo: 'this is memo',
				rawPassword: 'abc',
			});

			assert.strictEqual(withMemo.year, 2017);
			assert.strictEqual(withMemo.degree, 'bachelor');
			assert.strictEqual(withMemo.author, 'author');
			assert.strictEqual(withMemo.overview, 'this is overview');
			assert.strictEqual(withMemo.memo, 'this is memo');
			assert.strictEqual(withMemo.password, md5('abc'));

			const withoutMemo = new Thesis({
				year: 2017,
				degree: 'bachelor',
				author: 'author',
				title: 'title test',
				overview: 'this is overview',
				rawPassword: 'abc',
			});

			assert.strictEqual(withoutMemo.year, 2017);
			assert.strictEqual(withoutMemo.degree, 'bachelor');
			assert.strictEqual(withoutMemo.author, 'author');
			assert.strictEqual(withoutMemo.overview, 'this is overview');
			assert.strictEqual(withoutMemo.memo, '');
			assert.strictEqual(withoutMemo.password, md5('abc'));
		});
	});

	it('checkPassword', () => {
		const raw = new Thesis({
			year: 2017,
			degree: 'bachelor',
			author: 'author',
			title: 'title test',
			overview: 'this is overview',
			rawPassword: 'abc',
		});

		assert.strictEqual(raw.checkPassword('abc'), true);
		assert.strictEqual(raw.checkPassword('abcd'), false);
		assert.strictEqual(raw.checkPassword(md5('abc')), false);

		const encoded = new Thesis({
			year: 2017,
			degree: 'bachelor',
			author: 'author',
			title: 'title test',
			overview: 'this is overview',
			password: md5('abc'),
		});

		assert.strictEqual(encoded.checkPassword('abc'), true);
		assert.strictEqual(encoded.checkPassword('abcd'), false);
		assert.strictEqual(encoded.checkPassword(md5('abc')), false);
	});

	it('asSendableJSON', () => {
		const thesis = new Thesis({
			year: 2017,
			degree: 'bachelor',
			author: 'author',
			title: 'title test',
			overview: 'this is overview',
			memo: 'this is memo',
			rawPassword: 'abc',
		});
		const json = thesis.asSendableJSON();

		assert.strictEqual(json.year, thesis.year);
		assert.strictEqual(json.degree, thesis.degree);
		assert.strictEqual(json.author, thesis.author);
		assert.strictEqual(json.title, thesis.title);
		assert.strictEqual(json.overview, thesis.overview);
		assert.strictEqual(json.memo, thesis.memo);
		assert.strictEqual(json.password, undefined);

		assert.strictEqual(typeof json.downloadURL, 'string');
		assert.notStrictEqual(json.downloadURL.length, 0);
		assert.doesNotThrow(() => new URL(json.downloadURL, 'http://test'));
	});

	it('key', () => {
		assert.strictEqual(new Thesis({
			year: 2017,
			degree: 'bachelor',
			author: 'author',
			title: 'title test',
			overview: 'this is overview',
			rawPassword: 'abc',
		}).key, '2017/author/title test');

		assert.strictEqual(new Thesis({
			year: 2015,
			degree: 'bachelor',
			author: 'user',
			title: 'foobar',
			overview: 'this is overview',
			rawPassword: 'abc',
		}).key, '2015/user/foobar');
	});
}
