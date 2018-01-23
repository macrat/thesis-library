<style scoped src="./upload.css"></style>

<style scoped>
.uploaded-password {
	display: inline-block;
	background-color: #ffe0e0;
	padding: .2em;
	font-size: 120%;
}
</style>

<template>
	<div v-if="!uploadedPassword">
		<h1>アップロードする</h1>
		<form @submit.prevent=upload>
			<p>
				<label>氏名： <input v-model=author required></label>
				<select v-model=degree required>
					<option value=doctor>博士</option>
					<option value=master>修士</option>
					<option value=bachelor selected>学士</option>
				</select>
				<label><input type=number min=2000 :max="(new Date()).getFullYear()" v-model=year required>年度卒業</label>
			</p>

			<input v-model=title placeholder="タイトル" class=title required><br>
			<textarea v-model=overview placeholder="論文概要" class=overview required /><br>

			<hr>

			<label>メモ:<br>
			<textarea v-model=memo placeholder="後輩に伝えたい事があればどうぞ" class=memo /></label>

			<hr>

			<input @change=fileChange type=file accept=".pdf" required ref=fileinput><br>
			<pdf-viewer scale=0.3 :src=rawPDF />

			<hr>
			アップロードすることで<a href="/license" @click.prevent="$router.push({ path: '/license' })">利用規約</a>に同意したものみなします。<br>
			<input type=submit value="アップロード">
		</form>

		<transition name=indicator>
			<div class=uploading-indicator v-if=uploading><div>uploading...</div></div>
		</transition>
	</div>
	<div v-else>
		<h1>アップロードしました</h1>
		<p>お疲れ様でした。ご協力ありがとうございます。</p>
		<p>
			あなたのファイルのパスワードは<span class=uploaded-password>{{ uploadedPassword }}</span>です。<br>
			このパスワードを使うことで、再アップロードや編集、削除を行なうことが出来ます。
		</p>
		<p>
			<a
				:href="'/' + year + '/' + encodeURIComponent(author) + '/' + encodeURIComponent(title)"
				@click.prevent="$router.push({ name: 'detail', params: { year: year, author: author, title: title }})">アップロードした論文を見る</a>

			<a
				href="/search"
				@click.prevent="$router.push({ path: '/search' })">他の人の論文を見る</a>
		</p>
	</div>
</template>

<script>
import axios from 'axios';

import PDFViewer from './PDFViewer';


export default {
	components: {
		'pdf-viewer': PDFViewer,
	},
	data() {
		return {
			pageTitle: 'アップロードする',
			author: '',
			degree: 'bachelor',
			year: (new Date()).getFullYear() - 1,
			title: '',
			overview: '',
			memo: '',
			pdf: null,

			uploading: false,
			uploadedPassword: null,
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
			if (!file) {
				return;
			}

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
			if (this.uploading) {
				return;
			}
			this.uploading = true;

			const startTime = performance ? performance.now() : new Date();

			this.$client.post({
				author: this.author,
				degree: this.degree,
				year: Number(this.year),
				title: this.title,
				overview: this.overview,
				memo: this.memo,
				pdf: this.pdf,
			}).then(result => {
				this.uploading = false;
				this.uploadedPassword = result.password;

				this.$ga.event('upload', 'uploaded', `/${this.year}/${this.author}/${this.title}`);
				this.$ga.time('upload', `/${this.year}/${this.author}/${this.title}`, (performance ? performance.now() : new Date()) - startTime, 'upload');
			}).catch(err => {
				alert('アップロードに失敗しました。\nしばらく待ってからもう一度試してみてください。');
				this.uploading = false;
				console.error(err);

				if (err.response) {
					this.$ga.exception(err.response.data);
				} else {
					this.$ga.exception(err.message || err);
				}
			});
		},
	},
}
</script>
