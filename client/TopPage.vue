<template>
	<div>
		<h1>Thesis Library</h1>
		<h2>これは何？</h2>
		目黒研の過去の論文を検索するやつです。

		<h2>誰がやってるの？</h2>
		2017年度卒業生の<a href="https://blanktar.jp">志太悠真</a>が勝手に運営しています。

		<h2>使い方は？</h2>
		左の一覧か<a href="/search" @click.prevent="$router.push({ path: '/search' })">検索ページ</a>から論文を探して、読むことが出来ます。<br>
		論文はPDFでダウンロード出来るので、必要であればお手元でご覧ください。（たぶんそっちの方が読みやすいです）<br>
		自分の論文が出来たら、後輩のために<a href="/upload" @click.prevent="$router.push({ path: '/upload' })">アップロード</a>にご協力ください。<br>
		<br>
		<a href="/license" @click.prevent="$router.push({ path: '/license' })">利用規約</a>があるので、読んでおいてください。法と公序良俗を守れ、自己責任で使え、サイトが消えたらごめんね、という感じの内容です。<br>

		<h2>開発や運営を手伝いたい</h2>
		<a href="https://github.com/macrat/thesis-library">GitHub</a>にどうぞ。<br>
		あとサーバー代を払ってくれる人が出てくるととてもうれしいです。<br>
	</div>
</template>
