<style scoped>
article {
	border-bottom: 1px solid gray;
	padding: 1em 0;
	margin-bottom: 1em;
}

h2 {
	margin-left: .5em;
	font-size: 120%;
}

pre {
	font-family: unset;
}

.link-disabled {
	color: gray;
}
</style>

<template>
	<div v-if="error === null">
		<h1>{{ thesis.title }}</h1>
		{{ thesis.year }}年度 {{ {bachelor: '学士', master: '修士', doctor: '博士' }[thesis.degree] }} {{ thesis.author }}<br>
		<article>
			<h2>概要</h2>
			<pre>{{ thesis.overview }}</pre>
		</article>

		<article v-if=thesis.memo>
			<h2>メモ</h2>
			<pre>{{ thesis.memo }}</pre>
		</article>

		<a :href=thesis.pdf :class="{'link-disabled': !thesis.pdf}" @click="!thesis.pdf ? $event.prevent() : null" target=_blank>PDFを開く</a>
		<a href :class="{'link-disabled': !thesis.pdf}" @click="!thesis.pdf ? $event.prevent() : null">編集</a>
		<pdf-viewer :src=thesis.pdf :selectable=true />
	</div>
	<not-found v-else-if="error === 'notfound'" />
	<div v-else>
		<h1>読み込めませんでした</h1>
		何か問題が起きているようです。<br>
		しばらく待っても解決しないようなら、管理者にお問い合わせください。<br>
	</div>
</template>

<script>
import PDFViewer from './PDFViewer';

import NotFound from './NotFound';


export default {
	components: {
		'pdf-viewer': PDFViewer,
		'not-found': NotFound,
	},
	data() {
		return {
			pageTitle: this.$route.params.title,
			thesis: {
				year: this.$route.params.year,
				degree: '',
				author: this.$route.params.author,
				title: this.$route.params.title,
				overview: '',
				memo: '',
				pdf: null,
			},
			error: null,
		};
	},
	watch: {
		'$route': function() {
			this.pageTitle = this.$route.params.title;
			this.load();
		},
	},
	created() {
		this.load();
	},
	methods: {
		load() {
			this.error = null;

			this.$client.getQuickMetadata(Number(this.$route.params.year), this.$route.params.author, this.$route.params.title).then(quickData => {
				this.thesis.year = this.$route.params.year;
				this.thesis.degree = quickData.degree || '';
				this.thesis.title = this.$route.params.title;
				this.thesis.author = this.$route.params.author;
				this.thesis.overview = quickData.overview || '';
				this.thesis.memo = '';
				this.thesis.pdf = null;
			});

			this.$client.getMetadata(Number(this.$route.params.year), this.$route.params.author, this.$route.params.title)
				.then(meta => this.thesis = meta)
				.catch(err => {
					if (err.response.status === 404) {
						this.error = 'notfound';
					} else {
						this.error = 'unknown';
					}
				})
		},
	},
}
</script>
