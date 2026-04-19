<script lang="ts">
	import type { ExerciseDefinition } from '$lib/stores';

	interface Props {
		exercise: ExerciseDefinition;
		data: { value: string | number; unit: string; notes?: string };
		onChange?: (updates: Partial<Props['data']>) => void;
	}

	let { exercise, data, onChange }: Props = $props();

	function handleValueChange(newValue: string) {
		const updated = { ...data, value: newValue };
		onChange?.(updated);
	}

	function handleNotesChange(newNotes: string) {
		const updated = { ...data, notes: newNotes };
		onChange?.(updated);
	}
</script>

<div class="exercise-input">
	<div class="exercise-header">
		<label for={exercise.id}>{exercise.name}</label>
		<span class="unit-badge">{exercise.unit}</span>
	</div>

	<input
		id={exercise.id}
		type="number"
		placeholder="0"
		step="any"
		value={data.value}
		onchange={(e) => handleValueChange(e.currentTarget.value)}
		class="input-value"
	/>

	<input
		type="text"
		placeholder="Notizen (optional)"
		value={data.notes || ''}
		onchange={(e) => handleNotesChange(e.currentTarget.value)}
		class="input-notes"
	/>
</div>

<style>
	.exercise-input {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.exercise-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
	}

	label {
		font-size: 14px;
		font-weight: 500;
		color: #1f2937;
	}

	.unit-badge {
		font-size: 11px;
		background: #f3f4f6;
		color: #6b7280;
		padding: 3px 8px;
		border-radius: 4px;
		font-weight: 500;
		border: 1px solid #e5e7eb;
	}

	.input-value {
		padding: 10px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 16px;
		font-family: inherit;
		color: #1f2937;
	}

	.input-value:focus {
		outline: none;
		border-color: #1f2937;
		box-shadow: 0 0 0 3px rgba(31, 41, 55, 0.1);
	}

	.input-notes {
		padding: 8px;
		border: 1px solid #e5e7eb;
		border-radius: 4px;
		font-size: 12px;
		color: #6b7280;
		font-family: inherit;
	}

	.input-notes::placeholder {
		color: #d1d5db;
	}

	.input-notes:focus {
		outline: none;
		border-color: #1f2937;
		background: #f9fafb;
	}
</style>
