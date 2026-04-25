import type { Session, ExerciseDefinition } from './stores';

export function exportToTSV(sessions: Session[], exercises: ExerciseDefinition[]): string {
	if (sessions.length === 0) {
		return '';
	}

	// Sort sessions by date (oldest first)
	// Dates are stored in DD.MM.YYYY format, so we need to convert for sorting
	const sortedSessions = [...sessions].sort((a, b) => {
		const parseDate = (dateStr: string) => {
			// Handle both DD.MM.YYYY and YYYY-MM-DD formats
			if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) {
				const [day, month, year] = dateStr.split('.');
				return new Date(`${year}-${month}-${day}`).getTime();
			}
			return new Date(dateStr).getTime();
		};
		return parseDate(a.date) - parseDate(b.date);
	});

	// Create header row
	const headers = ['Datum', ...exercises.map(e => e.name + " (" + e.unit + ")")];
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
