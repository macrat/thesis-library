<style scoped>
input {
	width: 100%;
}
input:focus {
	outline: none;
}

.search-result {
	padding-bottom: 1.5em;
}
.search-result div {
	margin: .5em 1em;
	padding: .5em 1em;
}
h2 {
	margin-top: 0;
}
a {
	display: block;
	margin: .5em 0;
	border-bottom: 1px solid lightgray;
	color: black;
	text-decoration: none;
}
a:hover div {
	background-color: #f9f9f9;
}
mark {
	background-color: transparent;
	color: #b3424a;
	font-weight: bold;
}
</style>

<template>
	<div>
		<h1>論文を探す</h1>
		<input type=search placeholder="検索">
		<div class=search-result>
			<a href><div>
				<h2>論文の名前</h2>
				<p>2017年度 学士 ほげほげ著</p>
				<p>
					せつめいせつめい<mark>せつめい</mark>せつめいせつめい
					せつめいせつめい<mark>せつめい</mark>せつめいせつめい
					せつめいせつめい<mark>せつめい</mark>せつめいせつめい
				</p>
			</div></a>

			<a href><div>
				<h2>ろんぶんのなまえ</h2>
				<p>2018年度 修士 ふがふが著</p>
				<p>
					せつめいぶんせつめいぶん<mark>せつめい</mark>ぶんせつめいぶんせつめいぶん
					せつめいぶんせつめいぶん<mark>せつめい</mark>ぶんせつめいぶんせつめいぶん
					せつめいぶんせつめいぶん<mark>せつめい</mark>ぶんせつめいぶんせつめいぶん
				</p>
			</div></a>

			<a href><div>
				<h2>論文の名前</h2>
				<p>2017年度 学士 ほげほげ著</p>
				<p>
					せつめいせつめい<mark>せつめい</mark>せつめいせつめい
					せつめいせつめい<mark>せつめい</mark>せつめいせつめい
					せつめいせつめい<mark>せつめい</mark>せつめいせつめい
				</p>
			</div></a>

			<a href><div>
				<h2>ろんぶんのなまえ</h2>
				<p>2018年度 修士 ふがふが著</p>
				<p>
					せつめいぶんせつめいぶん<mark>せつめい</mark>ぶんせつめいぶんせつめいぶん
					せつめいぶんせつめいぶん<mark>せつめい</mark>ぶんせつめいぶんせつめいぶん
					せつめいぶんせつめいぶん<mark>せつめい</mark>ぶんせつめいぶんせつめいぶん
				</p>
			</div></a>

			<a href><div>
				<h2>論文の名前</h2>
				<p>2017年度 学士 ほげほげ著</p>
				<p>
					せつめいせつめい<mark>せつめい</mark>せつめいせつめい
					せつめいせつめい<mark>せつめい</mark>せつめいせつめい
					せつめいせつめい<mark>せつめい</mark>せつめいせつめい
				</p>
			</div></a>

			<a href><div>
				<h2>ろんぶんのなまえ</h2>
				<p>2018年度 修士 ふがふが著</p>
				<p>
					せつめいぶんせつめいぶん<mark>せつめい</mark>ぶんせつめいぶんせつめいぶん
					せつめいぶんせつめいぶん<mark>せつめい</mark>ぶんせつめいぶんせつめいぶん
					せつめいぶんせつめいぶん<mark>せつめい</mark>ぶんせつめいぶんせつめいぶん
				</p>
			</div></a>
		</div>
	</div>
</template>

<script>
export default {
	title: '論文を探す',
}
</script>
