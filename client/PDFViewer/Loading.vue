<style scoped>
div {
	display: flex;
	width: 100%;
	height: 100%;
	align-items: center;
	justify-content: center;
}
span {
	font-size: 200%;
	animation: loading-animation 2s ease 0s infinite alternate;
}
@keyframes loading-animation {
	0% {
		opacity: 0;
	}
	100% {
		opacity: .6;
	}
}
</style>

<template>
	<div><span>Loading...</span></div>
</template>
