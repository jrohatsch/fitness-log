<script lang="ts">
	import { sessions, exercises, type Session } from '$lib/stores';
	import ExerciseInput from './ExerciseInput.svelte';
	import { onMount } from 'svelte';

	let date = $state(new Date().toISOString().split('T')[0]);
	let exerciseList: any[] = $state([]);
	let exerciseValues: Record<string, any> = $state({});
	let isSubmitting = $state(false);

	onMount(() => {
		exercises.subscribe(e => {
			exerciseList = e;
			// Initialize exercise values with proper reactivity
			const newValues = { ...exerciseValues };
			exerciseList.forEach(ex => {
				if (!newValues[ex.id]) {
					newValues[ex.id] = { value: '', unit: ex.unit, notes: '' };
				}
			});
			exerciseValues = newValues;
		});
	});

	function handleExerciseChange(exerciseId: string, updates: any) {
		exerciseValues[exerciseId] = { ...exerciseValues[exerciseId], ...updates };
		console.log(`Exercise ${exerciseId} updated:`, exerciseValues[exerciseId]);
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		isSubmitting = true;
		console.log('Form submitted. exerciseValues:', exerciseValues);

		const sessionExercises: Record<string, any> = {};
		let hasData = false;

		Object.entries(exerciseValues).forEach(([id, data]) => {
			const value = data.value?.toString().trim() || '';
			if (value && value !== '0') {
				sessionExercises[id] = {
					value: isNaN(parseFloat(value)) ? value : parseFloat(value),
					unit: data.unit,
					notes: data.notes?.trim() || undefined
				};
				hasData = true;
			}
		});

		console.log('Session exercises to save:', sessionExercises);

		if (!hasData) {
			alert('Bitte geben Sie mindestens eine Übung ein');
			isSubmitting = false;
			return;
		}

		const newSession: Session = {
			id: `session_${Date.now()}`,
			date,
			exercises: sessionExercises
		};

		console.log('Adding session:', newSession);
		sessions.addSession(newSession);

		// Reset form with proper reactivity
		date = new Date().toISOString().split('T')[0];
		const resetValues = Object.fromEntries(
			exerciseList.map(ex => [
				ex.id,
				{ value: '', unit: ex.unit, notes: '' }
			])
		);
		exerciseValues = resetValues;

		isSubmitting = false;
	}
</script>

<div class="form-container">
	<form onsubmit={handleSubmit}>
		<div class="form-section">
			<label for="date">Datum</label>
			<input
				id="date"
				type="date"
				bind:value={date}
				required
			/>
		</div>

		<div class="exercises-section">
			<h3>Übungen</h3>
			<div class="exercises-grid">
				{#each exerciseList as exercise (exercise.id)}
					<ExerciseInput
						exercise={exercise}
						data={exerciseValues[exercise.id]}
						onChange={(updates) => handleExerciseChange(exercise.id, updates)}
					/>
				{/each}
			</div>
		</div>

		<button type="submit" class="btn-submit" disabled={isSubmitting}>
			{isSubmitting ? 'Wird gespeichert...' : 'Trainingseinheit speichern'}
		</button>
	</form>
</div>

<style>
	.form-container {
		background: white;
		border-radius: 6px;
		padding: 20px;
		margin: 16px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	label {
		font-weight: 600;
		font-size: 14px;
		color: #1f2937;
	}

	input[type='date'] {
		padding: 12px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 16px;
		font-family: inherit;
		color: #1f2937;
	}

	.exercises-section h3 {
		margin: 0 0 12px 0;
		font-size: 16px;
		color: #1f2937;
		font-weight: 600;
	}

	.exercises-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}

	.btn-submit {
		padding: 14px 20px;
		background: #1f2937;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 16px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-submit:active {
		background: #111827;
	}

	.btn-submit:disabled {
		background: #d1d5db;
		cursor: not-allowed;
	}

	@media (min-width: 768px) {
		.form-container {
			max-width: 600px;
			margin: 20px auto;
		}

		.exercises-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
