<script lang="ts">
	import SessionForm from '$lib/components/SessionForm.svelte';
	import SessionList from '$lib/components/SessionList.svelte';
	import Stats from '$lib/components/Stats.svelte';
	import { sessions, exercises } from '$lib/stores';
	import { onMount } from 'svelte';

	let activeTab: 'stats' | 'form' | 'list' = $state('stats');

	onMount(() => {
		// Load data from localStorage on app startup
		sessions.loadFromLocalStorage();
		exercises.loadFromLocalStorage();
	});
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Fitness Log</title>
</svelte:head>

<div class="app">
	<header class="app-header">
		<h1>Fitness Log</h1>
	</header>

	<div class="tab-navigation">
		<button
			class="tab-button"
			class:active={activeTab === 'stats'}
			onclick={() => (activeTab = 'stats')}
		>
			Fortschritt
		</button>
		<button
			class="tab-button"
			class:active={activeTab === 'form'}
			onclick={() => (activeTab = 'form')}
		>
			Neu
		</button>
		<button
			class="tab-button"
			class:active={activeTab === 'list'}
			onclick={() => (activeTab = 'list')}
		>
			Verlauf
		</button>
	</div>

	<main class="app-content">
		{#if activeTab === 'stats'}
			<Stats />
		{:else if activeTab === 'form'}
			<SessionForm />
		{:else if activeTab === 'list'}
			<SessionList />
		{/if}
	</main>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		background: white;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
		color: #1f2937;
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: white;
	}

	.app-header {
		background: white;
		color: #1f2937;
		padding: 20px 16px;
		text-align: center;
		border-bottom: 1px solid #e5e7eb;
	}

	.app-header h1 {
		margin: 0;
		font-size: 24px;
		font-weight: 600;
		letter-spacing: -0.5px;
	}

	.tab-navigation {
		display: flex;
		gap: 0;
		background: white;
		border-bottom: 1px solid #e5e7eb;
		overflow-x: auto;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.tab-button {
		flex: 1;
		padding: 14px 12px;
		border: none;
		background: white;
		cursor: pointer;
		font-size: 13px;
		font-weight: 500;
		color: #9ca3af;
		border-bottom: 2px solid transparent;
		transition: all 0.2s;
		min-width: 80px;
		white-space: nowrap;
	}

	.tab-button:active {
		background: #f9fafb;
	}

	.tab-button.active {
		color: #1f2937;
		border-bottom-color: #1f2937;
	}

	.app-content {
		flex: 1;
		overflow-y: auto;
	}

	@media (min-width: 768px) {
		.app-header {
			padding: 24px 20px;
		}

		.tab-button {
			font-size: 14px;
			padding: 16px 24px;
		}
	}
</style>
