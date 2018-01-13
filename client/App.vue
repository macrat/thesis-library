<style scoped>
.wrapper {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
}

header {
	border-bottom: 1px solid gray;
	padding: .5em .5em;
	margin: 0 .5em;
}
header a {
	color: black;
	text-decoration: none;
	margin-right: 1em;
}
header > a {
	font-weight: bold;
	color: #b3424a;
}
.menu a.router-link-exact-active {
	text-decoration: underline;
}

.wrapper > div {
	flex-grow: 1;
	display: flex;
}
.side-menu {
	border-right: 1px solid gray;
	box-sizing: border-box;
	margin: .5em 0;
	padding: 0 1em;
	width: 15em;
	min-width: 10em;
}

.content-area {
	flex: 1 1 0;
	display: flex;
	flex-direction: column;
}
.content-area > div {
	flex: 1 1 0;
	padding: 1em;
}
footer {
	text-align: right;
	border-top: 1px solid gray;
	margin: 0 .5em;
}
</style>

<template>
	<div class=wrapper>
		<header>
			<router-link to="/">Thesis Library</router-link>

			<span class=menu>
				<router-link to="/search">論文を探す</router-link>
				<router-link to="/upload">アップロードする</router-link>
			</span>
		</header>

		<div>
			<side-menu class=side-menu />

			<div class=content-area>
				<router-view />

				<footer><small>論文の著作権はそれぞれの著者に帰属します。 学術目的以外の無断転載を禁じます。</small></footer>
			</div>
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
import VueRouter from 'vue-router';

import APIClient from './APIClient';

import SideMenu from './SideMenu';


VueRouter.install(Vue);


Vue.mixin({
	mounted() {
		let { title } = this.$options;
		if (title) {
			if (typeof title === 'function') {
				title = title.call(this);
			}
			document.title = `${title} - Thesis Library`;
		} else {
			document.title = "Thesis Library";
		}
	},
});


Vue.prototype.$client = new APIClient();


export default {
	components: { SideMenu },
	router: new VueRouter({
		mode: 'history',
		scrollBehavior(to, from, savedPosition) {
			if (savedPosition) {
				return savedPosition;
			} else{
				return { x: 0, y: 0 };
			}
		},
		routes: [
			{
				path: '/',
				component: () => require.ensure([], require => require('./TopPage'), '/top'),
			},
			{
				path: '/search',
				component: () => require.ensure([], require => require('./SearchPage'), '/search'),
			},
			{
				path: '/upload',
				component: () => require.ensure([], require => require('./UploadPage'), '/upload'),
			},
			{
				path: '/:year/:author/:title*',
				component: () => require.ensure([], require => require('./DetailPage'), '/detail'),
			},
		],
	})
}
</script>
