<template>
	<div>
		<h1>見つかりませんでした</h1>
		お探しのページは見つかりませんでした。<br>
		<a href="/search" @click.prevent="$router.push({ path: '/search' })">検索</a>を試してみてください。<br>
	</div>
</template>
