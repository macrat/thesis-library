<style scoped>
ul {
	padding-left: 1em;
}

.side-menu--button {
	cursor: pointer;
	color: black;
	text-decoration: none;
}
</style>

<template>
	<nav>
		<ul>
			<li v-for="year in years">
				<span class=side-menu--button @click="open(year.num)">{{ year.num }}年度</span>
				<ul v-if="year.num === current">
					<li v-for="thesis in year.thesises">
						<a
							class=side-menu--button
							:href="'/' + year.num + '/' + encodeURIComponent(thesis.author) + '/' + encodeURIComponent(thesis.title)"
							@click.prevent="$router.push({ path: '/' + year.num + '/' + encodeURIComponent(thesis.author) + '/' + encodeURIComponent(thesis.title) })">{{ thesis.title }}</a>
					</li>
				</ul>
			</li>
		</ul>
	</nav>
</template>

<script>
import APIClient from './APIClient';


const client = new APIClient();


export default {
	data() {
		return {
			current: null,
			years: [],
		};
	},
	created() {
		client.getYearList().then(years => {
			this.years = years.map(y => ({ num: y, thesises: null }));
		});
	},
	methods: {
		open(yearNum) {
			const year = this.years.filter(x => x.num === yearNum)[0];
			if (!year) {
				return;
			}
			this.current = yearNum;

			if (year.thesises === null) {
				client.getThesisesOfYear(yearNum).then(xs => year.thesises = xs);
			}
		},
	},
}
</script>
