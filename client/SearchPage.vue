<style scoped>
input {
	width: 100%;
}
input:focus {
	outline: none;
}

.search-result {
	padding-bottom: 1.5em;
}
.search-result a > div {
	margin: .5em 1em;
	padding: .5em 1em;
}
h2 {
	margin-top: 0;
}
a {
	display: block;
	margin: .5em 0;
	border-bottom: 1px solid lightgray;
	color: black;
	text-decoration: none;
}
a:hover > div {
	background-color: #f0f0f0;
}
</style>

<style>
mark {
	background-color: transparent;
	color: #b3424a;
	font-weight: bold;
}
</style>

<template>
	<div>
		<h1>論文を探す</h1>
		<input type=search placeholder="検索" v-model=query>
		<div class=search-result>
			<a
				v-for="thesis in result"
				:href="'/' + thesis.year + '/' + encodeURIComponent(thesis.author) + '/' + encodeURIComponent(thesis.title)"
				@click.prevent="$router.push({ path: '/' + thesis.year + '/' + encodeURIComponent(thesis.author) + '/' + encodeURIComponent(thesis.title)})"
				><div>

				<h2 v-html=thesis.titleHTML></h2>
				<p>{{ thesis.year }}年度 {{ {bachelor: '学士', master: '修士', doctor: '博士' }[thesis.degree] }} <span v-html=thesis.authorHTML />著</p>
				<div v-html=thesis.html />
			</div></a>
		</div>
	</div>
</template>

<script>
import Searcher from './searcher';


export default {
	data() {
		return {
			pageTitle: '論文を探す',
			query: '',
			result: [],
		};
	},
	mounted() {
		this.reset();
	},
	computed: {
		searcher() {
			return new Searcher(this.$client);
		},
	},
	watch: {
		query() {
			if (!this.query) {
				this.pageTitle = '論文を探す';
			} else {
				this.pageTitle = this.query + ' - 論文を探す';
			}

			if (!this.query) {
				this.reset();
				return;
			}

			this.searcher.search(this.query).then(result => {
				this.result = result.map(x => this.searcher.makeHTML(x));
			}).catch(err => {
				console.error(err);
				this.reset();
			});
		},
	},
	methods: {
		reset() {
			this.$client.getOverviewIndex().then(xs => {
				this.result = xs.map(x => this.searcher.makeHTML({ data: x, founds: [] }));
			}).catch(console.error);
		},
	},
}
</script>
