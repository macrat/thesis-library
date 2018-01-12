<template>
	<div>
		<h1>{{ $route.params.title }}</h1>
		{{ $route.params.year }}年度卒業 {{ $route.params.author }}著<br>
		<p>がいようがいようがいようがいよう</p>
		<a href>ダウンロード</a>
		<hr>
		<pdf-viewer
			src="/test.pdf"
			:selectable=true
			@update:content="updated" />
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
			text: '',
		};
	},
	methods: {
		updated(content) {
			this.text = content.text;
		},
	},
}
</script>
