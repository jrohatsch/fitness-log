<script lang="ts">
	import { sessions, exercises, type Session } from '$lib/stores';
	import ExerciseInput from './ExerciseInput.svelte';
	import { onMount } from 'svelte';

	let date = $state(new Date().toISOString().split('T')[0]);
	let exerciseList: any[] = $state([]);
	let exerciseValues: Record<string, any> = $state({});
	let isSubmitting = $state(false);
	let sessionId = $state<string | null>(null);
	let autoSaveTimeout: NodeJS.Timeout | null = null;
	let allSessions: Session[] = [];

	onMount(() => {
		// Subscribe to all sessions
		const unsubscribe = sessions.subscribe(s => {
			allSessions = s;
		});

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

		// Load existing session for today or create a new one
		loadOrCreateSession();

		return () => unsubscribe();
	});

	function loadOrCreateSession() {
		// Check if a session for today already exists
		const existingSession = allSessions.find(s => s.date === date && !s.id.startsWith('draft_') && Object.keys(s.exercises).length > 0);
		
		if (existingSession) {
			// Load existing session
			sessionId = existingSession.id;
			
			// Restore exercise values
			Object.entries(existingSession.exercises).forEach(([id, exercise]) => {
				if (exerciseValues[id]) {
					exerciseValues[id] = {
						value: exercise.value,
						unit: exercise.unit,
						notes: exercise.notes || ''
					};
				}
			});
			
			console.log('Loaded existing session for date:', date, 'sessionId:', sessionId);
		}
	}

	function createSession() {
		sessionId = `session_${Date.now()}`;
		const newSession: Session = {
			id: sessionId,
			date,
			exercises: {}
		};
		sessions.addSession(newSession);
		console.log('Session created:', sessionId);
	}

	function handleDateChange() {
		// Only process date change if we have a session in progress
		if (!sessionId) {
			// Try to load existing session for new date
			loadOrCreateSession();
			return;
		}

		// Check if session for new date exists
		const existingSession = allSessions.find(s => s.date === date && !s.id.startsWith('draft_'));
		
		if (existingSession && existingSession.id !== sessionId) {
			// Merge current session with existing session for this date
			console.log('Merging sessions for date:', date);
			
			const sessionExercises: Record<string, any> = {};

			// Start with exercises from existing session
			Object.entries(existingSession.exercises).forEach(([id, exercise]) => {
				sessionExercises[id] = exercise;
			});

			// Merge in current exercises (current takes precedence)
			Object.entries(exerciseValues).forEach(([id, data]) => {
				const value = data.value?.toString().trim() || '';
				if (value && value !== '0') {
					sessionExercises[id] = {
						value: isNaN(parseFloat(value)) ? value : parseFloat(value),
						unit: data.unit,
						notes: data.notes?.trim() || undefined
					};
				}
			});

			// Delete old session
			if (sessionId) {
				sessions.deleteSession(sessionId);
			}

			// Update existing session with merged data
			sessions.updateSession(existingSession.id, {
				id: existingSession.id,
				date,
				exercises: sessionExercises
			});

			sessionId = existingSession.id;
		} else if (!existingSession && sessionId) {
			// Session date changed to a date with no session, just update current session
			const sessionExercises: Record<string, any> = {};

			Object.entries(exerciseValues).forEach(([id, data]) => {
				const value = data.value?.toString().trim() || '';
				if (value && value !== '0') {
					sessionExercises[id] = {
						value: isNaN(parseFloat(value)) ? value : parseFloat(value),
						unit: data.unit,
						notes: data.notes?.trim() || undefined
					};
				}
			});

			sessions.updateSession(sessionId, {
				id: sessionId,
				date,
				exercises: sessionExercises
			});
		}

		autoSaveSession();
	}

	function handleExerciseChange(exerciseId: string, updates: any) {
		// Create session on first input if it doesn't exist
		if (!sessionId) {
			createSession();
		}

		exerciseValues[exerciseId] = { ...exerciseValues[exerciseId], ...updates };
		console.log(`Exercise ${exerciseId} updated:`, exerciseValues[exerciseId]);
		autoSaveSession();
	}

	function autoSaveSession() {
		// Clear previous timeout
		if (autoSaveTimeout) {
			clearTimeout(autoSaveTimeout);
		}

		// Debounce auto-save by 1 second
		autoSaveTimeout = setTimeout(() => {
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

			if (sessionId) {
				const updatedSession: Session = {
					id: sessionId,
					date,
					exercises: sessionExercises
				};

				console.log('Auto-saving session:', updatedSession);
				sessions.updateSession(sessionId, updatedSession);
			}
		}, 1000);
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

		// Update session with final data
		if (sessionId) {
			const finalSession: Session = {
				id: sessionId,
				date,
				exercises: sessionExercises
			};

			console.log('Finalizing session:', finalSession);
			sessions.updateSession(sessionId, finalSession);
		}

		// Reset form with proper reactivity
		date = new Date().toISOString().split('T')[0];
		const resetValues = Object.fromEntries(
			exerciseList.map(ex => [
				ex.id,
				{ value: '', unit: ex.unit, notes: '' }
			])
		);
		exerciseValues = resetValues;

		// Reset session ID - next input will create a new session
		sessionId = null;

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
				onchange={handleDateChange}
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
			{isSubmitting ? 'Wird beendet...' : 'Trainingseinheit beenden'}
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
