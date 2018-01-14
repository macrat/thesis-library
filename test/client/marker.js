import assert from 'power-assert';

import Marker, { joinMarks } from '../../client/marker';


export default function() {
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

	it('joinMarks', () => {
		assert.deepStrictEqual(joinMarks([
			new Marker(0, 10),
			new Marker(5, 12),
			new Marker(20, 25),
		]), [
			new Marker(0, 12),
			new Marker(20, 25),
		]);

		assert.deepStrictEqual(joinMarks([
			new Marker(1, 10),
			new Marker(15, 25),
			new Marker(5, 20),
		]), [
			new Marker(1, 25),
		]);
	});
}
