<template>
	<div>
		<h1>アップロードする</h1>
		<form @submit.prevent="alert('みじっそう')">
			<p>
				<label>氏名： <input v-model=input.author required></label>
				<select v-model=input.degree required>
					<option value=doctor>博士</option>
					<option value=master>修士</option>
					<option value=bachelor selected>学士</option>
				</select>
				<label><input type=number min=2000 max=2099 v-model=input.year required>年度卒業</label>
			</p>

			<input placeholder="タイトル" style="width: 100%;" required><br>
			<textarea placeholder="論文概要" style="width: 100%; height: 30em;" required /><br>

			<hr>

			メモ:<br>
			<textarea placeholder="後輩に伝えたい事があればどうぞ" style="width: 100%; height: 5em;"/>

			<hr>

			<input type=file required><br>
			<pdf-viewer scale=0.3 src="/test.pdf" />

			<hr>

			<label>修正用のパスワード： <input type=password></label><br>
			<input type=submit value="アップロード">
		</form>
	</div>
</template>

<script>
import PDFViewer from './PDFViewer';


export default {
	title: 'アップロードする',
	components: {
		'pdf-viewer': PDFViewer,
	},
	data() {
		return {
			input: {
				author: '',
				degree: 'bachelor',
				year: (new Date()).getFullYear() - 1,
			},
		};
	},
}
</script>
