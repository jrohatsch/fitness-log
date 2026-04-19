<script lang="ts">
	import { sessions, exercises, type Session, type ExerciseDefinition } from '$lib/stores';
	import { onMount } from 'svelte';

	let sessionList = $state<Session[]>([]);
	let exerciseList = $state<ExerciseDefinition[]>([]);
	let expandedSessionId = $state<string | null>(null);
	let unsubscribeSessions: (() => void) | null = null;
	let unsubscribeExercises: (() => void) | null = null;

	onMount(() => {
		// Load from localStorage first
		sessions.loadFromLocalStorage();
		exercises.loadFromLocalStorage();

		// Subscribe to updates
		unsubscribeSessions = sessions.subscribe(s => {
			console.log('SessionList received updated sessions:', s);
			sessionList = s;
		});

		unsubscribeExercises = exercises.subscribe(e => {
			console.log('SessionList received updated exercises:', e);
			exerciseList = e;
		});

		return () => {
			unsubscribeSessions?.();
			unsubscribeExercises?.();
		};
	});

	function getExerciseName(exerciseId: string): string {
		return exerciseList.find(e => e.id === exerciseId)?.name || exerciseId;
	}

	function getExerciseUnit(exerciseId: string): string {
		return exerciseList.find(e => e.id === exerciseId)?.unit || '';
	}

	function toggleExpanded(sessionId: string) {
		expandedSessionId = expandedSessionId === sessionId ? null : sessionId;
	}

	function deleteSession(sessionId: string) {
		if (confirm('Delete this session?')) {
			sessions.deleteSession(sessionId);
		}
	}

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr + 'T00:00:00');
		return date.toLocaleDateString('de-DE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
	}
</script>

<div class="session-list">
	{#if sessionList.length === 0}
		<div class="empty-state">
			<p>Keine Trainingseinheiten noch. Starten Sie eine neue!</p>
		</div>
	{:else}
		{#each sessionList as session (session.id)}
			<div class="session-card">
				<button
					class="session-header"
					onclick={() => toggleExpanded(session.id)}
				>
					<div class="date-info">
						<div class="date">{formatDate(session.date)}</div>
						<div class="exercise-count">
							{Object.keys(session.exercises).filter(k => session.exercises[k].value !== 0 && session.exercises[k].value !== '').length} Übungen
						</div>
					</div>
					<div class="toggle-icon">
						{expandedSessionId === session.id ? '▼' : '▶'}
					</div>
				</button>

				{#if expandedSessionId === session.id}
					<div class="session-details">
						{#each Object.entries(session.exercises) as [exerciseId, exercise]}
							{#if exercise.value !== 0 && exercise.value !== ''}
								<div class="exercise-row">
									<div class="exercise-name">{getExerciseName(exerciseId)}</div>
									<div class="exercise-value">
										{exercise.value}
										<span class="unit">{exercise.unit || getExerciseUnit(exerciseId)}</span>
									</div>
									{#if exercise.notes}
										<div class="notes">{exercise.notes}</div>
									{/if}
								</div>
							{/if}
						{/each}

						<div class="session-actions">
							<button class="btn-delete" onclick={() => deleteSession(session.id)}>
								Löschen
							</button>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	{/if}
</div>

<style>
	.session-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
		background: white;
	}

	.empty-state {
		text-align: center;
		padding: 40px 20px;
		color: #9ca3af;
	}

	.session-card {
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		background: white;
		overflow: hidden;
	}

	.session-header {
		width: 100%;
		padding: 16px;
		border: none;
		background: white;
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 16px;
		font-weight: 500;
	}

	.session-header:active {
		background: #f9fafb;
	}

	.date-info {
		text-align: left;
	}

	.date {
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 4px;
	}

	.exercise-count {
		font-size: 13px;
		color: #9ca3af;
	}

	.toggle-icon {
		font-size: 12px;
		color: #9ca3af;
	}

	.session-details {
		padding: 0;
		border-top: 1px solid #e5e7eb;
	}

	.exercise-row {
		padding: 12px 16px;
		border-bottom: 1px solid #f3f4f6;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.exercise-row:last-child {
		border-bottom: none;
	}

	.exercise-name {
		font-size: 14px;
		font-weight: 500;
		color: #1f2937;
	}

	.exercise-value {
		font-size: 18px;
		font-weight: 600;
		color: #374151;
	}

	.unit {
		font-size: 14px;
		font-weight: 400;
		color: #9ca3af;
		margin-left: 4px;
	}

	.notes {
		font-size: 12px;
		color: #9ca3af;
		font-style: italic;
	}

	.session-actions {
		padding: 12px 16px;
		border-top: 1px solid #f3f4f6;
		display: flex;
		gap: 8px;
	}

	.btn-delete {
		flex: 1;
		padding: 10px;
		background: #ef4444;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
	}

	.btn-delete:active {
		background: #dc2626;
	}

	@media (min-width: 768px) {
		.session-list {
			max-width: 600px;
			margin: 0 auto;
		}
	}
</style>
