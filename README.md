# OpenRemote Alarm Frontend

A Svelte-based frontend application for managing OpenRemote alarms with real-time updates.

## Prerequisites

- [Bun](https://bun.sh) - A fast all-in-one JavaScript runtime
- OpenRemote instance running on `https://localhost` with Keycloak authentication
- ESLint + Prettier externsions for code formatting and linting

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

🚨 **Use Bun only - don't use npm**

Start the development server:

```bash
bun run dev
```

The application will be available at `https://localhost:5173` (HTTPS is required for OpenRemote integration).

## Build & Testing

Build the application for production:

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

Run TypeScript type checking:

```bash
bun run check
```

## 🚨 **Contributing Guidelines**

Please follow these guidelines to maintain code quality and consistency:

### 🎨 **Styling & Components**

- **UI Components**: Use components from [shadcn-svelte](https://shadcn-svelte.com/)
- **Custom Styling**: Modify components in [`src/lib/components/ui/`](src/lib/components/ui/) for custom styling
- **CSS Framework**: Use **ONLY** Tailwind CSS - no custom CSS or other frameworks
- **Colors**: Use global CSS variables defined in [`src/app.css`](src/app.css) instead of hardcoded colors

### 🔀 **Git Workflow**

- **Branch Naming**: Since this will be integrated into the main codebase, make it clear in branch names that it's from the POC:
- **Never commit directly to POC**: Even though POC uses master as main branch, always branch off of POC and **create pull requests**

### 🔌 **OpenRemote API**

- **Store Pattern**: All OpenRemote logic must be inside the store (`src/lib/store.svelte`)
- **No Direct API Calls**: Don't make OpenRemote API calls directly in components
- **Type Safety**: Use proper types from `@openremote/model`

### 🏗️ **Code Standards**

- **DRY Principle**: Create reusable components if you have the same code in 2+ places
- **TypeScript**: All new files must be TypeScript (`.ts`, `.svelte` with `<script lang="ts">`)
- **Type Safety**: Use proper types from `@openremote/model` where applicable
- **Svelte 5**: Use the new runes syntax (`$state`, `$derived`, `$props`, etc.)
- **Imports**: Use the `$lib` alias for internal imports

### 📁 **File Organization**

- **Components**: Place in [`src/lib/components/`](src/lib/components/)
- **Pages**: Place in [`src/lib/pages/`](src/lib/pages/)
- **Utilities**: Place in [`src/lib/utils.ts`](src/lib/utils.ts)
- **UI Components**: Place in [`src/lib/components/ui/`](src/lib/components/ui/)
- **Store**: All state management in [`src/lib/store.svelte`](src/lib/store.svelte)

### 🚫 **What NOT to do**

- ❌ Don't add custom CSS files or `<style>` blocks
- ❌ Don't use inline styles (`style="..."`)
- ❌ Don't hardcode colors (use CSS variables)
- ❌ Don't bypass TypeScript with `any` types
- ❌ Don't add new dependencies without discussion
- ❌ Don't modify the OpenRemote connection settings without approval
- ❌ Don't use npm (use Bun instead)
- ❌ Don't make direct OpenRemote API calls in components

### ✅ **Before Submitting**

1. Run type checking: `bun run check`
2. Test the application: `bun run dev`
3. Ensure all colors use CSS variables
4. Verify all OpenRemote logic is in the store
5. Check for duplicate code that should be componentized

## Features

- **Real-time Alarm Management**: View and create alarms with live updates
- **OpenRemote Integration**: Full integration with OpenRemote's alarm system
- **Responsive Design**: Built with Tailwind CSS and shadcn-svelte components
- **TypeScript Support**: Full type safety with Svelte 5 runes
- **Component Library**: Based on shadcn-svelte for consistent UI

## Configuration

The application is configured to connect to:

- OpenRemote Manager: `https://localhost`
- Keycloak Auth: `https://localhost/auth`
- Realm: `master`
- Language: Dutch (`nl`)

To modify these settings, update the OpenRemote initialization in [`src/lib/store.svelte`](src/lib/store.svelte).

## Project Structure

```
src/
├── App.svelte                    # Main application component
├── main.ts                      # Application entry point
├── app.css                      # Global styles with CSS variables
└── lib/
    ├── store.svelte             # Central state management & OpenRemote logic
    ├── utils.ts                 # Utility functions
    ├── components/              # Reusable components
    │   ├── ui/                  # shadcn-svelte UI components
    │   ├── Header.svelte
    │   ├── AlarmCard.svelte
    │   └── AddAlarmForm.svelte
    └── pages/                   # Page components
        ├── AlarmList.svelte
        └── Dashboard.svelte
```

## Technologies

- **[Svelte 5](https://svelte.dev)** - Frontend framework with new runes syntax
- **[TypeScript](https://www.typescriptlang.org)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[shadcn-svelte](https://shadcn-svelte.com)** - Component library
- **[OpenRemote](https://openremote.io)** - IoT platform integration
- **[Vite](https://vitejs.dev)** - Build tool
- **[Bun](https://bun.sh)** - JavaScript runtime and package manager

## Resources

- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [shadcn-svelte Components](https://shadcn-svelte.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [OpenRemote Documentation](https://docs.openremote.io/)
