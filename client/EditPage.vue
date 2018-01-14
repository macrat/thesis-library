<style scoped src="./upload.css"></style>

<template>
	<div v-if="error === null">
		<h1>編集する</h1>
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

			<input @change=fileChange type=file accept=".pdf" ref=fileinput><button @click.prevent="pdf = null; $refs.fileinput.value = null">変更しない</button><br>
			<pdf-viewer scale=0.3 :src=rawPDF />

			<hr>

			<input type=submit value="保存">
		</form>

		<transition name=indicator>
			<div class=uploading-indicator v-if=uploading><div>saving...</div></div>
		</transition>
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
			pageTitle: '編集する',
			author: this.$route.params.author,
			degree: 'bachelor',
			year: Number(this.$route.params.year),
			title: this.$route.params.title,
			overview: '',
			memo: '',
			pdf: null,
			pdfURL: null,
			password: null,

			uploading: false,
			error: null,
		};
	},
	created() {
		this.$client.getQuickMetadata(Number(this.$route.params.year), this.$route.params.author, this.$route.params.title).then(quickData => {
			this.degree = quickData.degree || '';
			this.overview = quickData.overview || '';
		});

		this.$client.getMetadata(Number(this.$route.params.year), this.$route.params.author, this.$route.params.title)
			.then(meta => {
				this.overview = meta.overview;
				this.degree = meta.degree;
				this.memo = meta.memo;
				this.pdfURL = meta.pdf;
			})
			.catch(err => {
				if (err.response.status === 404) {
					this.error = 'notfound';
				} else {
					console.error(err);
					this.error = 'unknown';
				}
			})
	},
	mounted() {
		this.password = this.$route.params.password;

		if (!this.password) {
			this.password = window.prompt('編集用のパスワード');
			if (!this.password) {
				this.$router.push({ name: 'detail', params: this.$route.params });
			}

			this.$client.checkPassword(this.year, this.author, this.title, this.password)
				.then(ok => {
					if (!ok) {
						this.$router.push({ name: 'detail', params: this.$route.params });
					}
				})
				.catch(err => {
					console.error(err);
					this.$router.push({ name: 'detail', params: this.$route.params });
				})
		}
	},
	computed: {
		rawPDF() {
			if (this.pdf === null) {
				return this.pdfURL;
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

			this.$client.update(this.$route.params.year, this.$route.params.author, this.$route.params.title, {
				author: this.author,
				degree: this.degree,
				year: Number(this.year),
				title: this.title,
				overview: this.overview,
				memo: this.memo,
				pdf: this.pdf || null,
			}, this.password).then(x => {
				this.uploading = false;
				this.$router.push({ name: 'detail', params: { year: this.year, author: this.author, title: this.title }});
			}).catch(err => {
				console.error('failed to upload', err);
			});
		},
	},
}
</script>
