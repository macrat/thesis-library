<style scoped>
.pdf-viewer {
	position: relative;
	border: 1px solid black;
	width: fit-content;
	height: fit-content;
}

.pdf-viewer--button {
	background-color: rgba(0, 0, 0, 0.3);
	opacity: 0.0;
	transition: opacity .5s ease;
	font-size: 3em;
	width:20%;
	top: 0;
	bottom: 0;
	position: absolute;
	user-select: none;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2;
}

.pdf-viewer--button:hover {
	opacity: 0.3;
}

.pdf-viewer--button:active {
	opacity: 0.6;
}

.pdf-viewer--prev {
	left: 0;
}

.pdf-viewer--next {
	right: 0;
}
</style>

<template>
	<div class=pdf-viewer :style="{ width: viewport.width + 'px', height: viewport.height + 'px' }">
		<div class="pdf-viewer--button pdf-viewer--prev" v-if=loaded @click="page--"><span>&lt;</span></div>
		<div class="pdf-viewer--button pdf-viewer--next" v-if=loaded @click="page++"><span>&gt;</span></div>

		<pdf-preview
			:src=src
			:page.sync=page
			:scale=scale
			@rendered="viewport = $event.viewport"
			@loaded="loaded = true"
			@update:content=updated />
	</div>
</template>

<script>
import Loading from './Loading';


export default {
	props: ['src', 'scale'],
	components: {
		'pdf-preview': () => ({
			component: require.ensure([], require => require('./Preview'), '/pdf-preview'),
			loading: Loading,
			delay: 100,
		}),
	},
	watch: {
		src() {
			this.loaded = false;
		},
	},
	data() {
		return {
			page: 1,
			loaded: false,
			viewport: {width: 595.28 * (this.scale || 1.0), height: 841.89 * (this.scale || 1.0)},
		};
	},
	methods: {
		updated(content) {
			this.$emit('update:content', content);
		},
	},
};
</script>
