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
		<a
			:href="`/${thesis.year}/${encodeURIComponent(thesis.author)}/${encodeURIComponent(thesis.title)}/edit`"
			:class="{'link-disabled': !thesis.pdf}"
			@click.prevent="edit">編集</a>
		<pdf-viewer :src=thesis.pdf :selectable=true />
	</div>
	<not-found v-else-if="error === 'notfound'" />
	<failed-to-load v-else />
</template>

<script>
import PDFViewer from './PDFViewer';

import NotFound from './NotFound';
import FailedToLoad from './FailedToLoad';


export default {
	components: {
		'pdf-viewer': PDFViewer,
		'not-found': NotFound,
		'failed-to-load': FailedToLoad,
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
						console.error(err);
						this.error = 'unknown';
					}
				})
		},
		edit() {
			const password = window.prompt('編集用のパスワード');
			if (password) {
				this.$client.checkPassword(this.thesis.year, this.thesis.author, this.thesis.title, password)
					.then(ok => {
						if (ok) {
							this.$router.push({ name: 'edit', params: {
								year: this.thesis.year,
								author: this.thesis.author,
								title: this.thesis.title,
								password: password,
							}});
						} else {
							alert('パスワードが違います。');
						}
					})
					.catch(err => {
						this.error = 'unknown';
					})
			}
		},
	},
}
</script>
