<script lang="ts">
	import { sessions, exercises, type Session, type ExerciseDefinition } from '$lib/stores';
	import ExerciseInput from './ExerciseInput.svelte';
	import { onMount } from 'svelte';

	let date = $state(new Date().toISOString().split('T')[0]);
	let exerciseList: any[] = $state([]);
	let exerciseValues: Record<string, any> = $state({});
	let isSubmitting = $state(false);
	let sessionId = $state<string | null>(null);
	let autoSaveTimeout: NodeJS.Timeout | null = null;
	let allSessions: Session[] = [];
	
	// New exercise form state
	let showAddExercise = $state(false);
	let newExerciseName = $state('');
	let newExerciseUnit = $state('');
	let addingExercise = $state(false);

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

	function handleAddExercise() {
		if (!newExerciseName.trim()) {
			alert('Bitte geben Sie einen Übungsnamen ein');
			return;
		}
		if (!newExerciseUnit.trim()) {
			alert('Bitte geben Sie eine Einheit ein');
			return;
		}

		addingExercise = true;

		const exerciseId = `custom_${Date.now()}`;
		const newExercise: ExerciseDefinition = {
			id: exerciseId,
			name: newExerciseName.trim(),
			unit: newExerciseUnit.trim(),
			category: 'custom'
		};

		exercises.addExercise(newExercise);
		console.log('New exercise added:', newExercise);

		// Reset form
		newExerciseName = '';
		newExerciseUnit = '';
		showAddExercise = false;
		addingExercise = false;
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

			<button 
				type="button"
				class="btn-add-exercise"
				onclick={() => showAddExercise = !showAddExercise}
			>
				+ Neue Übung hinzufügen
			</button>

			{#if showAddExercise}
				<div class="add-exercise-form">
					<div class="form-group">
						<label for="exercise-name">Übungsname</label>
						<input
							id="exercise-name"
							type="text"
							bind:value={newExerciseName}
							placeholder="z.B. Planks"
							required
						/>
					</div>

					<div class="form-group">
						<label for="exercise-unit">Einheit</label>
						<input
							id="exercise-unit"
							type="text"
							bind:value={newExerciseUnit}
							placeholder="z.B. Sekunden, kg, Wdh"
							required
						/>
					</div>

					<div class="form-actions">
						<button 
							type="button"
							class="btn-confirm"
							onclick={handleAddExercise}
							disabled={addingExercise}
						>
							{addingExercise ? 'Wird hinzugefügt...' : 'Hinzufügen'}
						</button>
						<button 
							type="button"
							class="btn-cancel"
							onclick={() => showAddExercise = false}
							disabled={addingExercise}
						>
							Abbrechen
						</button>
					</div>
				</div>
			{/if}
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

	.btn-add-exercise {
		margin-top: 12px;
		padding: 10px 16px;
		background: #e5e7eb;
		color: #1f2937;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-add-exercise:hover {
		background: #d1d5db;
	}

	.add-exercise-form {
		margin-top: 16px;
		padding: 16px;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.form-group label {
		font-weight: 600;
		font-size: 13px;
		color: #374151;
	}

	.form-group input {
		padding: 10px;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 14px;
		font-family: inherit;
		color: #1f2937;
	}

	.form-group input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
	}

	.form-actions {
		display: flex;
		gap: 8px;
		margin-top: 4px;
	}

	.btn-confirm {
		flex: 1;
		padding: 10px;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-confirm:hover:not(:disabled) {
		background: #2563eb;
	}

	.btn-confirm:disabled {
		background: #93c5fd;
		cursor: not-allowed;
	}

	.btn-cancel {
		flex: 1;
		padding: 10px;
		background: #f3f4f6;
		color: #1f2937;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-cancel:hover:not(:disabled) {
		background: #e5e7eb;
	}

	.btn-cancel:disabled {
		background: #f9fafb;
		cursor: not-allowed;
		color: #9ca3af;
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
