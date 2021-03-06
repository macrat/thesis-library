<style scoped>
input[type=search] {
	width: 100%;
}

.search-result {
	padding-bottom: 1.5em;
}
.search-result a {
	display: block;
	margin: .5em 1em;
	padding: .5em 1em;
	color: black;
	text-decoration: none;
}
h2 {
	margin-top: 0;
}
.search-result > div {
	margin: .5em 0;
	border-bottom: 1px solid lightgray;
}
.search-result a:hover, .search-result a:focus {
	background-color: #f0f0f0;
	outline: none;
}

.search-result--hit-num {
	float: right;
	color: #666;
}

.search-options {
	display: flex;
	flex-wrap: wrap;
	margin: .5em -0.5em;
}
.search-options span {
	margin: .3em .5em;
}

.search-options--button input {
	position: absolute;
	visibility: hidden;
	width: 0;
	padding: 0;
	margin: 0;
}
.search-options--button, .search-options select {
	background-color: #eee;
	border: 1px solid darkgray;
	border-radius: 0;
	padding: .1em .3em;
	user-select: none;
}
.search-options--button.active {
	background-color: #888;
	color: white;
}
</style>

<style>
mark {
	background-color: #ecc;
	color: #b3424a;
	font-weight: bold;
}
</style>

<template>
	<div>
		<h1>論文を探す</h1>
		<div class=search-box>
			<input type=search placeholder="検索" v-model=options.query>
			<div class=search-options>
				<span>
					提出年:
					<label><select v-model=options.yearFrom>
						<option value=1>1年前</option>
						<option value=2>2年前</option>
						<option value=3>3年前</option>
						<option value=5>5年前</option>
						<option value=0>全て</option>
					</select></label>
					〜
					<label><select v-model=options.yearTo>
						<option value=1>1年前</option>
						<option value=2>2年前</option>
						<option value=3>3年前</option>
						<option value=5>5年前</option>
						<option value=0>全て</option>
					</select></label>
				</span>

				<span>
					学位:
					<label><select v-model=options.degree>
						<option value=doctor>博士</option>
						<option value=master>修士</option>
						<option value=bachelor>学士</option>
						<option value=all>全て</option>
					</select></label>
				</span>

				<span>
					検索対象:
					<label tabindex=0 class=search-options--button :class="{ active: options.titleEnabled }"><input type=checkbox v-model=options.titleEnabled>タイトル</label>
					<label tabindex=0 class=search-options--button :class="{ active: options.authorEnabled }"><input type=checkbox v-model=options.authorEnabled>著者名</label>
					<label tabindex=0 class=search-options--button :class="{ active: options.overviewEnabled }"><input type=checkbox v-model=options.overviewEnabled>概要</label>
					<label tabindex=0 class=search-options--button :class="{ active: options.textEnabled }"><input type=checkbox v-model=options.textEnabled>本文</label>
				</span>
			</div>
		</div>
		<div class=search-result>
			<span class=search-result--hit-num>{{ result.length }}件ヒット</span>
			<div v-for="thesis in result">
				<a
					:href="'/' + thesis.year + '/' + encodeURIComponent(thesis.author) + '/' + encodeURIComponent(thesis.title)"
					@click.prevent="$router.push({ name: 'detail', params: { year: thesis.year, author: thesis.author, title: thesis.title }})"
					><div>

					<h2 v-html=thesis.titleHTML></h2>
					<p>{{ thesis.year }}年度 <span v-html=thesis.authorHTML /> {{ {bachelor: '学士', master: '修士', doctor: '博士' }[thesis.degree] }}</p>
					<div v-html=thesis.html />
				</div></a>
			</div>
		</div>
	</div>
</template>

<script>
import debounce from 'lodash-es/debounce';

import Searcher from './searcher';


export default {
	data() {
		return {
			pageTitle: '論文を探す',
			result: [],
			options: {
				query: '',
				yearFrom: '0',
				yearTo: '0',
				degree: 'all',
				titleEnabled: true,
				authorEnabled: false,
				overviewEnabled: true,
				textEnabled: false,
			},
			searchCount: 0,
		};
	},
	mounted() {
		this.reset();
	},
	computed: {
		searcher() {
			return new Searcher(this.$client);
		},
		searchTrack() {
			return debounce(() => {
				this.searchCount++;
				this.$ga.event('search', 'query', this.options.query, this.searchCount);
				this.$ga.event('search', 'options', JSON.stringify({
					query: this.options.query,
					year: {
						from: this.options.yearFrom,
						to: this.options.yearTo,
					},
					degree: this.options.degree,
					searchBy: {
						title: this.options.titleEnabled,
						author: this.options.authorEnabled,
						overview: this.options.overviewEnabled,
						text: this.options.textEnabled,
					},
				}), this.searchCount);
			}, 500);
		},
	},
	watch: {
		options: {
			deep: true,
			handler() {
				this.searchTrack();

				if (!this.options.query) {
					this.pageTitle = '論文を探す';
				} else {
					this.pageTitle = this.options.query + ' - 論文を探す';
				}

				const now = new Date();
				const year = now.getFullYear() - ((now.getMonth() < 3) ? 1 : 0);

				const options = {
					yearFrom: this.options.yearFrom === '0' ? null : year - Number(this.options.yearFrom),
					yearTo: this.options.yearTo === '0' ? null : year - Number(this.options.yearTo),
					degree: this.options.degree === 'all' ? null : this.options.degree,
					title: this.options.titleEnabled,
					author: this.options.authorEnabled,
					overview: this.options.overviewEnabled,
					text: this.options.textEnabled,
				};

				const startTime = performance ? performance.now() : now;

				this.searcher.search(this.options.query, options).then(result => {
					this.result = result.map(x => this.searcher.makeHTML(x));
					this.$ga.time('search', this.options.query, (performance ? performance.now() : new Date()) - startTime, 'search speed');
				}).catch(err => {
					console.error(err);
					this.reset();

					if (err.response) {
						this.$ga.exception(err.response.data);
					} else {
						this.$ga.exception(err.message || err);
					}
				});
			},
		},
	},
	methods: {
		reset() {
			this.$client.getOverviewIndex().then(xs => {
				this.result = xs.map(x => this.searcher.makeHTML({ data: x, founds: [] }));
			}).catch(err => {
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
