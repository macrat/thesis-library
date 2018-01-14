import assert from 'power-assert';

import { makeKey, makePassword } from '../../server/utils';


export default function() {
	it('makeKey', () => {
		assert.strictEqual(makeKey(2017, 'hoge', 'fuga'), '2017/hoge/fuga');
		assert.strictEqual(makeKey(2017, 'hoge fuga', 'foo bar'), '2017/hoge fuga/foo bar');
	});

	it('makePassword', () => {
		const results = [];
		for (let i=0; i<10; i++) {
			const p = makePassword();

			assert.strictEqual(p.length, 6);
			assert.strictEqual(typeof p, 'string');
			assert(/^[A-Z0-9]{6}$/.test(p));

			results.push(p);
		}

		assert.notStrictEqual(results.slice(1).filter(x => x !== results[0]).length, 0);
	});
}
