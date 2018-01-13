<style scoped>
ul {
	padding-left: 1em;
}

.side-menu--button {
	cursor: pointer;
	color: black;
	text-decoration: none;
}

.side-menu--button--active {
	color: #b3424a;
}
</style>

<template>
	<nav>
		<ul>
			<li v-for="year in years">
				<span class=side-menu--button @click="openClose(year.num)">{{ year.num }}年度</span>
				<ul v-if="year.num === current">
					<li v-for="thesis in year.thesises">
						<a
							class=side-menu--button
							:class="{ 'side-menu--button--active': thesis.year === detailShown.year && thesis.author === detailShown.author && thesis.title === detailShown.title }"
							:href="'/' + year.num + '/' + encodeURIComponent(thesis.author) + '/' + encodeURIComponent(thesis.title)"
							@click.prevent="$router.push({ path: '/' + year.num + '/' + encodeURIComponent(thesis.author) + '/' + encodeURIComponent(thesis.title) })">{{ thesis.title }}</a>
					</li>
				</ul>
			</li>
		</ul>
	</nav>
</template>

<script>
export default {
	data() {
		return {
			current: null,
			years: [],
			detailShown: {
				year: Number(this.$route.params.year),
				author: this.$route.params.author,
				title: this.$route.params.title,
			},
		};
	},
	watch: {
		'$route': function() {
			this.detailShown.year = Number(this.$route.params.year);
			this.detailShown.author = this.$route.params.author;
			this.detailShown.title = this.$route.params.title;
		}
	},
	created() {
		this.$client.getYearList().then(years => {
			this.years = years.map(y => ({ num: y, thesises: null }));
			if (this.years.length > 0) {
				this.open(this.years[0].num);
			}
		});
	},
	mounted() {
		this.$client.on('clear-cache', this.clearCache);
	},
	destroy() {
		this.$client.off('clear-cache', this.clearCache);
	},
	methods: {
		open(yearNum) {
			const year = this.years.filter(x => x.num === yearNum)[0];
			if (!year) {
				return;
			}
			this.current = yearNum;

			if (year.thesises === null) {
				this.$client.getThesisesOfYear(yearNum).then(xs => year.thesises = xs);
			}
		},
		openClose(yearNum) {
			if (this.current === yearNum) {
				this.current = null;
			} else {
				this.open(yearNum);
			}
		},
		clearCache() {
			this.$client.getYearList().then(years => {
				this.years = years.map(y => ({ num: y, thesises: null }));
				this.open(this.current);
			});
		},
	},
}
</script>
