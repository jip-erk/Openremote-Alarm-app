# OpenRemote Alarm Frontend

A Svelte-based frontend application for managing OpenRemote alarms with real-time updates.

## Prerequisites

- [Bun](https://bun.sh) - A fast all-in-one JavaScript runtime
- OpenRemote instance running on `https://localhost` with Keycloak authentication

## Installation

1. **Install Bun** (if not already installed):

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

   Or on Windows:

   ```bash
   powershell -c "irm bun.sh/install.ps1 | iex"
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

## Development

Start the development server:

```bash
bun run dev
```

The application will be available at `https://localhost:5173` (HTTPS is required for OpenRemote integration).

## Build

Build the application for production:

```bash
bun run build
```

## Preview

Preview the production build:

```bash
bun run preview
```

## Type Checking

Run TypeScript type checking:

```bash
bun run check
```

## Features

- **Real-time Alarm Management**: View and create alarms with live updates
- **OpenRemote Integration**: Full integration with OpenRemote's alarm system
- **Responsive Design**: Built with Tailwind CSS for mobile-first design
- **TypeScript Support**: Full type safety with Svelte 5

## Configuration

The application is configured to connect to:

- OpenRemote Manager: `https://localhost`
- Keycloak Auth: `https://localhost/auth`
- Realm: `master`
- Language: Dutch (`nl`)

To modify these settings, update the OpenRemote initialization in [src/App.svelte](src/App.svelte).

## Project Structure

```
src/
├── App.svelte          # Main application component
├── main.ts            # Application entry point
├── app.css            # Global styles with Tailwind
└── lib/
    ├── Header.svelte       # Header component
    ├── Alarm.svelte        # Alarm card component
    └── AddAlarmForm.svelte # Form for creating new alarms
```

## Technologies

- **[Svelte 5](https://svelte.dev)** - Frontend framework
- **[TypeScript](https://www.typescriptlang.org)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com)** - Styling
- **[OpenRemote](https://openremote.io)** - IoT platform integration
- **[Vite](https://vitejs.dev)** - Build tool
- **[Bun](https://bun.sh)** - JavaScript runtime and package manager
