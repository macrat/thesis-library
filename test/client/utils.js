import assert from 'power-assert';

import sanitize from '../../client/sanitize';


export default function() {
	it('sanitize', () => {
		assert.strictEqual(sanitize('hello&world<this>is\'test"'), 'hello&amp;world&lt;this&gt;is&#x27;test&quot;');

		assert.strictEqual(sanitize('&amp;'), '&amp;amp;');

		assert.strictEqual(sanitize(''), '');
	});
}
