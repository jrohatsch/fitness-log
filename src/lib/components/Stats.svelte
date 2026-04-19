<script lang="ts">
	import { sessions, exercises, type Session, type ExerciseDefinition } from '$lib/stores';
	import { onMount } from 'svelte';

	let sessionList = $state<Session[]>([]);
	let exerciseList = $state<ExerciseDefinition[]>([]);
	let stats = $state<Record<string, any>>({});
	let unsubscribeSessions: (() => void) | null = null;
	let unsubscribeExercises: (() => void) | null = null;

	onMount(() => {
		unsubscribeSessions = sessions.subscribe(s => {
			console.log('Stats received updated sessions:', s);
			sessionList = s;
			calculateStats();
		});

		unsubscribeExercises = exercises.subscribe(e => {
			console.log('Stats received updated exercises:', e);
			exerciseList = e;
			calculateStats();
		});

		return () => {
			unsubscribeSessions?.();
			unsubscribeExercises?.();
		};
	});

	function calculateStats() {
		stats = {};

		exerciseList.forEach(exercise => {
			const exerciseSessions = sessionList.filter(s => s.exercises[exercise.id]?.value);
			if (exerciseSessions.length === 0) return;

			const values = exerciseSessions.map(s => {
				const val = s.exercises[exercise.id].value;
				return typeof val === 'number' ? val : parseFloat(val as string);
			}).filter(v => !isNaN(v));

			if (values.length > 0) {
				stats[exercise.id] = {
					name: exercise.name,
					current: values[0],
					max: Math.max(...values),
					min: Math.min(...values),
					avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
					unit: exercise.unit,
					sessions: exerciseSessions.length
				};
			}
		});
	}

	function getProgressTrend(exerciseId: string): string {
		const stat = stats[exerciseId];
		if (!stat || stat.sessions < 2) return '—';

		const first = sessionList.filter(s => s.exercises[exerciseId]?.value).pop()?.exercises[exerciseId].value || 0;
		const current = stat.current;
		const diff = current - first;

		if (diff > 0) return `+${diff.toFixed(1)}`;
		if (diff < 0) return `${diff.toFixed(1)}`;
		return '→';
	}

	function getProgressColor(exerciseId: string): string {
		const trend = getProgressTrend(exerciseId);
		if (trend.startsWith('+')) return '#22c55e';
		if (trend.startsWith('-') && trend !== '—') return '#ef4444';
		return '#6b7280';
	}
</script>

<div class="stats-container">
	<div class="stats-header">
		<h2>Fortschritt</h2>
		{#if sessionList.length > 0}
			<div class="stats-info">
				{sessionList.length} Trainingseinheiten
			</div>
		{/if}
	</div>

	{#if Object.keys(stats).length === 0}
		<div class="empty-stats">
			<p>Keine Statistiken verfügbar. Starten Sie mit dem Tracking!</p>
		</div>
	{:else}
		<div class="stats-grid">
			{#each Object.entries(stats) as [exerciseId, stat] (exerciseId)}
				<div class="stat-card">
					<div class="stat-name">{stat.name}</div>
					<div class="stat-current">
						{stat.current}
						<span class="stat-unit">{stat.unit}</span>
					</div>
					<div class="stat-secondary">
						<div class="stat-row">
							<span class="label">Trend:</span>
							<span class="value" style="color: {getProgressColor(exerciseId)}">
								{getProgressTrend(exerciseId)}
							</span>
						</div>
						<div class="stat-row">
							<span class="label">Max:</span>
							<span class="value">{stat.max} {stat.unit}</span>
						</div>
						<div class="stat-row">
							<span class="label">Ø:</span>
							<span class="value">{stat.avg} {stat.unit}</span>
						</div>
						<div class="stat-row">
							<span class="label">Einheiten:</span>
							<span class="value">{stat.sessions}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.stats-container {
		padding: 16px;
		background: white;
		color: #1f2937;
	}

	.stats-header {
		margin-bottom: 20px;
		border-bottom: 1px solid #e5e7eb;
		padding-bottom: 12px;
	}

	.stats-header h2 {
		margin: 0;
		font-size: 20px;
		font-weight: 600;
		color: #1f2937;
	}

	.stats-info {
		font-size: 12px;
		color: #9ca3af;
		margin-top: 6px;
	}

	.empty-stats {
		text-align: center;
		padding: 30px 20px;
		color: #9ca3af;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
	}

	.stat-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		padding: 16px;
		color: #1f2937;
	}

	.stat-name {
		font-size: 11px;
		font-weight: 600;
		color: #9ca3af;
		margin-bottom: 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.stat-current {
		font-size: 28px;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 12px;
	}

	.stat-unit {
		font-size: 14px;
		font-weight: 400;
		color: #9ca3af;
		margin-left: 4px;
	}

	.stat-secondary {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 12px;
		border-top: 1px solid #f3f4f6;
		padding-top: 12px;
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
	}

	.label {
		color: #9ca3af;
		font-weight: 500;
	}

	.value {
		font-weight: 600;
		color: #374151;
	}

	@media (min-width: 768px) {
		.stats-container {
			max-width: 100%;
			padding: 24px;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.stats-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
