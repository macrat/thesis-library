<template>
	<div>
		<h1>Thesis Library</h1>
		<h2>これは何？</h2>
		<p>
			目黒研の過去の論文を検索するやつです。
			個人が運営しているもので、非公式です。
		</p>

		<h2>使い方は？</h2>
		<p>
			左の一覧か<a href="/search" @click.prevent="$router.push({ path: '/search' })">検索ページ</a>から論文を探して、読むことが出来ます。<br>
			論文はPDFでダウンロード出来るので、必要であればお手元でご覧ください。（たぶんそっちの方が読みやすいです）<br>
			自分の論文が出来たら、後輩のために<a href="/upload" @click.prevent="$router.push({ path: '/upload' })">アップロード</a>にご協力ください。
		</p>
		<p>
			<a href="/license" @click.prevent="$router.push({ path: '/license' })">利用規約</a>があるので、読んでおいてください。法と公序良俗を守れ、自己責任で使え、サイトが消えたらごめんね、という感じの内容です。
		</p>

		<h3>検索のヒント</h3>
		<p>
			検索キーワードはスペース区切りのAND検索です。
			小文字だけで検索した場合は大文字小文字を無視しますが、大文字小文字を混ぜて入力すると区別するようになります。
		</p>
		<p>
			検索キーワードの最初と最後を/にすると、スペース区切りではなく正規表現での検索が出来ます。<br>
			例 androidかiOSを含む論文を検索： /android|ios/
		</p>

		<h2>開発や運営を手伝いたい</h2>
		<p>
			ありがとう。<a href="https://github.com/macrat/thesis-library">GitHub</a>にどうぞ。<br>
			あとサーバー代を払ってくれるととてもうれしいです。
		</p>
		<p>
			バグや要望、アイデアは<a href="https://github.com/macrat/thesis-library/issues">Issueトラッカー</a>か、開発者の志太（slack ID: macrat）までお願いします。
		</p>
	</div>
</template>
