<style scoped>
.pdf-viewer {
	position: relative;
	border: 1px solid black;
	width: fit-content;
	height: fit-content;
}

.pdf-viewer--button {
	background-color: rgba(0, 0, 0, 0.6);
	opacity: 0.2;
	transition: opacity .5s ease;
	padding: .7em .3em;
	font-size: 3em;
	position: absolute;
	top: 50%;
	z-index: 2;
	user-select: none;
	cursor: pointer;
}

.pdf-viewer--button:hover {
	opacity: 0.7;
}

.pdf-viewer--button:active {
	opacity: 1.0;
}

.pdf-viewer--prev {
	left: 0;
	border-radius: 0 100em 100em 0;
	border-right: 1px solid black;
}

.pdf-viewer--next {
	right: 0;
	border-radius: 100em 0 0 100em;
	border-left: 1px solid black;
}
</style>

<template>
	<div class=pdf-viewer>
		<div class="pdf-viewer--button pdf-viewer--prev" @click="page--">&lt;</div>
		<div class="pdf-viewer--button pdf-viewer--next" @click="page++">&gt;</div>

		<pdf-preview :src=src :page.sync=page @update:content=updated />
	</div>
</template>

<script>
import Preview from './Preview';


export default {
	props: ['src'],
	components: {
		'pdf-preview': Preview,
	},
	data() {
		return {
			page: 1,
		};
	},
	methods: {
		updated(content) {
			this.$emit('update:content', content);
		},
	},
};
</script>
