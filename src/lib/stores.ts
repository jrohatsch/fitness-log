import { writable } from 'svelte/store';

export interface Exercise {
	value: number | string;
	unit: string;
	notes?: string;
}

export interface Session {
	id: string;
	date: string;
	exercises: Record<string, Exercise>;
}

export interface ExerciseDefinition {
	id: string;
	name: string;
	unit: string;
	category: string;
}

// Default exercise definitions
const defaultExercises: ExerciseDefinition[] = [
	{ id: 'joggen_5min', name: 'Joggen 5 min', unit: 'km/h', category: 'cardio' },
	{ id: 'liegestuetze', name: 'Liegestütze', unit: 'Wdh', category: 'upper_body' },
	{ id: 'kniebeugen', name: 'Kniebeugen', unit: 'kg', category: 'lower_body' },
	{ id: 'bankdruecken', name: 'Bankdrücken', unit: 'kg', category: 'upper_body' },
	{ id: 'rudern', name: 'Rudern vorgebeugt', unit: 'kg', category: 'upper_body' },
	{ id: 'wadenheben', name: 'Wadenheben', unit: 'kg', category: 'lower_body' },
	{ id: 'kreuzheben', name: 'Kreuzheben', unit: 'kg', category: 'lower_body' },
	{ id: 'bulgarian', name: 'Bulgarian Split Squat', unit: 'kg', category: 'lower_body' }
];

function createSessionStore() {
	// Initialize with data from localStorage if available
	let initialData: Session[] = [];
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem('fitnessSessions');
		if (stored) {
			try {
				initialData = JSON.parse(stored);
				console.log('Store initialized with saved sessions:', initialData);
			} catch (e) {
				console.error('Failed to parse stored sessions:', e);
			}
		}
	}

	const { subscribe, set, update } = writable<Session[]>(initialData);

	// Auto-persist whenever store changes
	subscribe(sessions => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('fitnessSessions', JSON.stringify(sessions));
			console.log('Sessions saved to localStorage:', sessions);
		}
	});

	return {
		subscribe,
		
		addSession: (session: Session) => {
            console.log('Adding session:', session);
			update(sessions => [session, ...sessions].sort((a, b) => 
				new Date(b.date).getTime() - new Date(a.date).getTime()
			));
		},

		updateSession: (id: string, updates: Partial<Session>) => {
			update(sessions =>
				sessions.map(s => s.id === id ? { ...s, ...updates } : s)
			);
		},

		deleteSession: (id: string) => {
			update(sessions => sessions.filter(s => s.id !== id));
		},

		loadFromLocalStorage: () => {
			if (typeof window !== 'undefined') {
				const stored = localStorage.getItem('fitnessSessions');
				if (stored) {
					try {
						set(JSON.parse(stored));
						console.log('Sessions loaded from localStorage');
					} catch (e) {
						console.error('Failed to load sessions:', e);
					}
				}
			}
		}
	};
}

export const sessions = createSessionStore();

function createExerciseStore() {
	// Initialize with data from localStorage if available, otherwise use defaults
	let initialData: ExerciseDefinition[] = defaultExercises;
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem('fitnessExercises');
		if (stored) {
			try {
				initialData = JSON.parse(stored);
				console.log('Exercise store initialized with saved exercises:', initialData);
			} catch (e) {
				console.error('Failed to parse stored exercises:', e);
			}
		}
	}

	const { subscribe, set } = writable<ExerciseDefinition[]>(initialData);

	// Auto-persist whenever store changes
	subscribe(exercises => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('fitnessExercises', JSON.stringify(exercises));
		}
	});

	return {
		subscribe,

		addExercise: (exercise: ExerciseDefinition) => {
			// Not implemented yet, but structure is ready
		},

		removeExercise: (id: string) => {
			// Not implemented yet, but structure is ready
		},

		loadFromLocalStorage: () => {
			if (typeof window !== 'undefined') {
				const stored = localStorage.getItem('fitnessExercises');
				if (stored) {
					try {
						set(JSON.parse(stored));
						console.log('Exercises loaded from localStorage');
					} catch (e) {
						console.error('Failed to load exercises:', e);
					}
				}
			}
		}
	};
}

export const exercises = createExerciseStore();
