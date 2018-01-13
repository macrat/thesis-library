<style scoped>
article {
	border-bottom: 1px solid gray;
	padding: 1em 0;
	margin-bottom: 1em;
}

.link-disabled {
	color: gray;
}
</style>

<template>
	<div>
		<h1>{{ thesis.title }}</h1>
		{{ thesis.year }}年度 {{ {bachelor: '学士', master: '修士', doctor: '博士' }[thesis.degree] }} {{ thesis.author }}著<br>
		<article>
			<h2>概要</h2>
			{{ thesis.overview }}
		</article>

		<a :href=thesis.pdf :class="{'link-disabled': !thesis.pdf}" @click="!thesis.pdf ? $event.prevent() : null" target=_blank>PDFを開く</a>
		<a href :class="{'link-disabled': !thesis.pdf}" @click="!thesis.pdf ? $event.prevent() : null">編集</a>

		<article v-if=thesis.memo>
			<h2>メモ</h2>
			{{ thesis.memo }}
		</article>
		<pdf-viewer :src=thesis.pdf :selectable=true />
	</div>
</template>

<script>
import PDFViewer from './PDFViewer';


export default {
	title() {
		return this.$route.params.title;
	},
	components: {
		'pdf-viewer': PDFViewer,
	},
	data() {
		return {
			thesis: {
				year: this.$route.params.year,
				degree: '',
				author: this.$route.params.author,
				title: this.$route.params.title,
				overview: '',
				memo: '',
				pdf: null,
			}
		};
	},
	created() {
		this.$client.getMetadata(this.thesis.year, this.thesis.author, this.thesis.title)
			.then(meta => this.thesis = meta)
			.catch(err => {
				alert('something wrong');
				console.error(err);
			})
	},
}
</script>
