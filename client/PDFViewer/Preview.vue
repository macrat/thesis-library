<style scoped>
.pdf-viewer--preview {
	position: relative;
	width: fit-content;
	height: fit-content;
}

.image-layer {
	z-index: 0;
}

.text-layer {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
}
</style>

<style>
.pdf-viewer--preview .text-layer > div {
	position: absolute;
	color: transparent;
	white-space: pre;
	cursor: text;
	z-index: 5;
}

.pdf-viewer--preview .text-layer > div::selection {
	background: rgba(0, 128, 255, 0.3);
}
</style>

<template>
	<div class=pdf-viewer--preview>
		<canvas :width=viewport.width :height=viewport.height class=image-layer />
		<div class=text-layer v-if=selectable />
	</div>
</template>

<script>
import Vue from 'vue';

import 'pdfjs-dist/build/pdf.js';
import { TextLayerBuilder } from 'pdfjs-dist/lib/web/text_layer_builder.js';

PDFJS.cMapUrl = "/cmaps/";
PDFJS.cMapPacked = true;
PDFJS.workerSrc = "/pdf-worker.js"


export default {
	props: ['page', 'src', 'scale', 'selectable'],
	data() {
		return {
			pagesNum: 0,
			pdfData: null,
			pageData: null,
			viewport: {width: 595.28 * (this.scale || 1.0), height: 841.89 * (this.scale || 1.0)},
		};
	},
	watch: {
		src() {
			this.load();
		},
		page(val) {
			if (this.pageNum < 1) {
				return;
			}
			if (val < 1) {
				this.$emit('update:page', 1);
			} else if (val > this.pagesNum) {
				this.$emit('update:page', this.pagesNum);
			} else {
				this.rendering();
			}
		},
	},
	mounted() {
		this.load();
	},
	computed: {
		imageLayer() {
			return this.$el.querySelector('.image-layer')
		},
		textLayer() {
			return this.$el.querySelector('.text-layer');
		},
	},
	methods: {
		load() {
			if (this.src === null) {
				this.clearCanvas();
				return;
			}

			const startTime = new Date();

			PDFJS.getDocument(this.src)
				.then(pdf => {
					this.pdfData = pdf;
					if (this.page !== 1) {
						this.$emit('update:page', 1);
					}
					this.pagesNum = pdf.pdfInfo.numPages;
					this.pageData = null;

					this.$emit('loaded', {
						url: this.src,
						pagesNum: this.pagesNum,
					});

					this.$ga.time('PDFViewer', 'load', new Date() - startTime, 'PDF load');

					this.rendering();
				})
				.catch(err => {
					this.pagesNum = 0;
					this.pdfData = this.pageData = null;
					this.$emit('failed-to-load', {
						url: this.src,
						error: err,
					});
					console.error(err);
					this.showError();

					this.$ga.exception(err.message || err);
				})
		},
		rendering() {
			if (this.pdfData === null) {
				this.load();
			} else {
				const startTime = new Date();

				this.pdfData.getPage(this.page)
					.then(page => {
						this.pageData = page;

						const canvas = this.imageLayer;
						const context = canvas.getContext('2d');

						this.viewport = page.getViewport(this.scale || 1.0);

						page.render({
							canvasContext: context,
							viewport: this.viewport,
						});

						this.$emit('rendered', {
							url: this.src,
							page: this.page,
							pagesNum: this.pagesNum,
							viewport: this.viewport,
						});

						this.$ga.time('PDFViewer', 'render', new Date() - startTime, 'PDF render');

						if (this.selectable) {
							return page.getTextContent()
						} else {
							return null;
						}
					})
					.then(content => {
						this.textLayer.innerHTML = '';

						const textLayer = new TextLayerBuilder({
							textLayerDiv: this.textLayer,
							viewport: this.viewport,
						});
						textLayer.setTextContent(content);
						textLayer.render();

						this.$ga.time('PDFViewer', 'render with text layer', new Date() - startTime, 'PDF render with text layer');
					})
					.catch(err => {
						this.$emit('failed-to-rendering', {
							url: this.src,
							page: this.page,
							pagesNum: this.pagesNum,
							pdf: this.pdfData,
							error: err,
						});

						this.$ga.exception(err.message || err);
					})
			}
		},
		showError() {
			const ctx = this.imageLayer.getContext('2d');

			const width = this.imageLayer.width;
			const height = this.imageLayer.height;

			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, width, height);

			ctx.strokeStyle = '#b3424a';
			ctx.moveTo(0, 0);
			ctx.lineTo(width, height);
			ctx.moveTo(width, 0);
			ctx.lineTo(0, height);
			ctx.stroke();

			ctx.fillStyle = 'black';
			ctx.textBaseline = 'middle';
			ctx.textAlign = 'center';
			ctx.fillText('読み込めませんでした', width/2, height/3, width);
		},
		clearCanvas() {
			const ctx = this.imageLayer.getContext('2d');

			ctx.fillStyle = 'white';
			ctx.fillRect(0, 0, this.imageLayer.width, this.imageLayer.height);
		},
	},
}
</script>
