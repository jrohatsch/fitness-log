# 💪 Fitness Log App

A mobile-first fitness tracking app built with SvelteKit. Track your workouts, monitor progress, and achieve your fitness goals.

## Features

- 📱 **Mobile-First Design** - Optimized for phone use
- 📊 **Progress Tracking** - View statistics and trends for each exercise
- 📋 **Workout History** - Browse all your past sessions
- ➕ **Easy Logging** - Quick form to log new workouts
- 💾 **Local Storage** - All data stored locally in your browser (no server needed)
- 🔄 **Flexible Exercises** - Add notes and skip exercises as needed

## Setup & Installation

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Run Development Server

```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── routes/
│   └── +page.svelte          # Main app page with tab navigation
├── lib/
│   ├── stores.ts             # Svelte stores for sessions and exercises
│   └── components/
│       ├── SessionList.svelte   # Shows all past workouts
│       ├── SessionForm.svelte   # Form to log new workouts
│       ├── ExerciseInput.svelte # Individual exercise input
│       └── Stats.svelte         # Progress statistics dashboard
```

## Components

### `+page.svelte`
Main app layout with tab navigation. Provides:
- 📊 Stats Tab - View progress for all exercises
- ➕ New Tab - Log a new workout
- 📋 History Tab - Browse past sessions

### `SessionForm.svelte`
Form component for logging workouts:
- Date picker (defaults to today)
- All exercises with value and notes inputs
- Validates that at least one exercise is logged
- Saves to local storage automatically

### `SessionList.svelte`
Expandable list of all workout sessions:
- Shows date and exercise count
- Click to expand and see details
- Display values with units
- Shows any notes added
- Delete individual sessions

### `Stats.svelte`
Dashboard showing progress:
- Current value for each exercise
- Personal records (max)
- Average values
- Trend compared to first session
- Total number of sessions

### `ExerciseInput.svelte`
Reusable component for a single exercise:
- Numeric input with unit display
- Optional notes field
- Mobile-optimized layout

## Store Schema

### Sessions
```typescript
{
  id: string;              // Unique ID
  date: string;            // YYYY-MM-DD format
  exercises: {
    [exerciseId]: {
      value: number | string;
      unit: string;
      notes?: string;
    }
  }
}
```

### Exercises
```typescript
{
  id: string;              // exercise_name format
  name: string;            // Display name
  unit: string;            // kg, reps, km/h, etc.
  category: string;        // cardio, upper_body, lower_body
}
```

## Default Exercises

The app comes with 8 exercises pre-configured:
- Joggen 5 min (km/h)
- Liegestütze (reps)
- Kniebeugen (kg)
- Bankdrücken (kg)
- Rudern vorgebeugt (kg)
- Wadenheben (kg)
- Kreuzheben (kg)
- Latziehen (kg)

You can customize these in [src/lib/stores.ts](src/lib/stores.ts).

## Data Storage

All data is stored in your browser's local storage:
- `fitnessSessions` - All workout sessions
- `fitnessExercises` - Exercise definitions

Data persists across sessions and browser restarts. No account or server required!

## Customization

### Add New Exercises

Edit the `defaultExercises` array in [src/lib/stores.ts](src/lib/stores.ts):

```typescript
{
  id: 'my_exercise',
  name: 'My Exercise',
  unit: 'kg',
  category: 'upper_body'
}
```

### Change Colors & Styling

Modify the CSS in component files. The app uses:
- Primary color: `#2563eb` (blue)
- Accent gradient: Purple to indigo
- Mobile-first responsive design

## Browser Support

Works on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- No data is sent to any server - everything stays on your device
- Clear your browser cache/storage to reset the app
- Export your data by copying the localStorage values
- Works offline once loaded

## License

MIT
