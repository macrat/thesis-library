import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App';


new Vue({
	el: '#app',
	render: h => h(App),
});


if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/api-worker.js', { scope: '/' });
}
