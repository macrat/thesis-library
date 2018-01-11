<template>
	<div>
		<h1>アップロードする</h1>
		<input type=file><br>
		<label>タイトル： <input></label><br>
		<label>氏名： <input></label><br>
		<label>卒業年度： <input>年度</label><br>
		<textarea placeholder="論文概要"></textarea><br>
		<label>連絡先： <input>（公開しても良い場合のみ）</label><br>
		<hr>
		<pdf-viewer
			src="/test.pdf" />
		<hr>
		<label>修正用のパスワード： <input type=password></label><br>
		<button @click="alert('みじっそう')">アップロードする</button>
	</div>
</template>

<script>
import PDFViewer from './PDFViewer';


export default {
	title: 'アップロードする',
	components: {
		'pdf-viewer': PDFViewer,
	},
}
</script>
