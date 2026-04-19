import type { Session, ExerciseDefinition } from './stores';

export function exportToTSV(sessions: Session[], exercises: ExerciseDefinition[]): string {
	if (sessions.length === 0) {
		return '';
	}

	// Sort sessions by date (oldest first)
	const sortedSessions = [...sessions].sort((a, b) =>
		new Date(a.date).getTime() - new Date(b.date).getTime()
	);

	// Create header row
	const headers = ['Datum', ...exercises.map(e => e.name)];
	const lines: string[] = [headers.join('\t')];

	// Create data rows
	sortedSessions.forEach(session => {
		const row: string[] = [session.date];

		exercises.forEach(exercise => {
			const exerciseData = session.exercises[exercise.id];
			if (exerciseData?.value) {
				row.push(String(exerciseData.value));
			} else {
				row.push('');
			}
		});

		lines.push(row.join('\t'));
	});

	return lines.join('\n');
}

export function downloadTSV(content: string, filename: string = 'fitness-log.tsv'): void {
	const blob = new Blob([content], { type: 'text/tab-separated-values;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', filename);
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

export function downloadJSON(data: { sessions: Session[]; exercises: ExerciseDefinition[] }, filename: string = 'fitness-log.json'): void {
	const json = JSON.stringify(data, null, 2);
	const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', filename);
	link.style.visibility = 'hidden';

	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
