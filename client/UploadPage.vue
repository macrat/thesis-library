<template>
	<div>
		<h1>アップロードする</h1>
		<form @submit.prevent=upload>
			<p>
				<label>氏名： <input v-model=author required></label>
				<select v-model=degree required>
					<option value=doctor>博士</option>
					<option value=master>修士</option>
					<option value=bachelor selected>学士</option>
				</select>
				<label><input type=number min=2000 max=2099 v-model=year required>年度卒業</label>
			</p>

			<input v-model=title placeholder="タイトル" style="width: 100%;" required><br>
			<textarea v-model=overview placeholder="論文概要" style="width: 100%; height: 30em;" required /><br>

			<hr>

			メモ:<br>
			<textarea v-model=memo placeholder="後輩に伝えたい事があればどうぞ" style="width: 100%; height: 5em;"/>

			<hr>

			<input @change=fileChange type=file required ref=fileinput><br>
			<pdf-viewer scale=0.3 :src=rawPDF />

			<hr>

			<label>修正用のパスワード： <input type=password></label><br>
			<input type=submit value="アップロード">
		</form>
	</div>
</template>

<script>
import axios from 'axios';

import PDFViewer from './PDFViewer';


export default {
	title: 'アップロードする',
	components: {
		'pdf-viewer': PDFViewer,
	},
	data() {
		return {
			author: '',
			degree: 'bachelor',
			year: (new Date()).getFullYear() - 1,
			title: '',
			overview: '',
			memo: '',
			pdf: null,
		};
	},
	computed: {
		rawPDF() {
			if (this.pdf === null) {
				return null;
			} else {
				return new Buffer(this.pdf, 'base64');
			}
		},
	},
	methods: {
		fileChange(ev) {
			const file = ev.target.files[0];

			if (file.type !== 'application/pdf') {
				alert('PDF以外をアップロードすることは出来ません。');
				this.pdf = null;
				this.$refs.fileinput.value = '';
				return;
			}

			const reader = new FileReader();

			reader.onload = () => {
				this.pdf = reader.result.substr(reader.result.indexOf(',') + 1);
			};
			reader.onerror = () => {
				this.pdf = 'error';
				this.$refs.fileinput.value = '';
			};
			reader.readAsDataURL(file);
		},
		upload() {
			axios.post('/api/post', {
				author: this.author,
				degree: this.degree,
				year: Number(this.year),
				title: this.title,
				overview: this.overview,
				memo: this.memo,
				pdf: this.pdf,
			}).then(x => {
				console.log('uploaded:', x);
				alert('uploaded');
			}).catch(err => {
				console.error('failed to upload', err);
			});
		},
	},
}
</script>
