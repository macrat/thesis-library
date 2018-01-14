<style scoped>
.title {
	width: 100%;
}

.overview, .memo {
	resize: vertical;
	width: 100%;
}
.overview {
	height: 30em;
}
.memo {
	height: 5em;
}

.uploading-indicator {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.6);
	z-index: 100;
	display: flex;
	justify-content: center;
	align-items: center;
	color: white;
	font-size: 200%;
}
.uploading-indicator > div{
	animation: loading-animation 2s ease 0s infinite alternate;
}
@keyframes loading-animation {
	0% {
		opacity: .1;
	}
	80%, 100% {
		opacity: .9;
	}
}

.indicator-enter-active {
	transition: opacity 1s;
}
.indicator-leave-active {
	transition: opacity .5s;
}
.indicator-enter, .indicator-leave-to {
	opacity: 0;
}
</style>

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

			<label>修正用パスワード（省略可）： <input type=password v-model=password></label><br>
			<input type=submit value="アップロード">
		</form>

		<transition name=indicator>
			<div class=uploading-indicator v-if=uploading><div>uploading...</div></div>
		</transition>
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
			password: '',

			uploading: false,
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

			axios.post('/api/post', {
				author: this.author,
				degree: this.degree,
				year: Number(this.year),
				title: this.title,
				overview: this.overview,
				memo: this.memo,
				pdf: this.pdf,
				password: this.password || null,
			}).then(x => {
				this.uploading = false;
				this.$client.clearCache();
				this.$router.push({path: `/${this.year}/${this.author}/${this.title}`});
			}).catch(err => {
				console.error('failed to upload', err);
			});
		},
	},
}
</script>
