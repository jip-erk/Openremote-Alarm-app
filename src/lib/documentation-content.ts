export interface DocSection {
  id: string;
  title: string;
  content: string;
}

export const documentationSections: DocSection[] = [
  {
    id: "overview",
    title: "Overview",
    content: `
      <h2 class="text-2xl font-bold mb-4">Project Overview</h2>
      <p class="mb-4">
        The OpenRemote Alarm App is a specialized frontend interface designed for monitoring, acknowledging, and resolving alarms from an OpenRemote master instance. It provides a streamlined "Control Center" experience optimized for operators.
      </p>
      <h3 class="text-xl font-semibold mb-2">Core Features</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li><strong>Alarm Monitoring:</strong> Real-time view of active alarms, filtered by status and assignee.</li>
        <li><strong>Asset Management:</strong> View connected assets and their health/alarm status.</li>
        <li><strong>Alarm Resolution:</strong> Detailed alarm view with action history and resolution workflow.</li>
        <li><strong>Theming:</strong> Customizable appearance (colors, logos) persisted per user.</li>
      </ul>
    `,
  },
  {
    id: "setup",
    title: "Setup & Run",
    content: `
      <h2 class="text-2xl font-bold mb-4">Setup & Run</h2>
      
      <h3 class="text-xl font-semibold mb-2">Prerequisites</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li>Node.js (v18+)</li>
        <li>Bun (Runtime & Package Manager)</li>
        <li>Docker (for running OpenRemote master)</li>
      </ul>

      <h3 class="text-xl font-semibold mb-2">Local Development</h3>
      <ol class="list-decimal pl-5 mb-4 space-y-2">
        <li>
          <strong>Start OpenRemote:</strong>
          <p class="text-sm text-muted-foreground mt-1 mb-2">Ensure you have the OpenRemote stack definition (e.g. docker-compose.yml).</p>
          <pre class="bg-muted p-2 rounded mt-1">docker compose pull
docker compose -p openremote up</pre>
        </li>
        <li>
          <strong>Install Dependencies:</strong>
          <p class="text-sm text-muted-foreground mt-1 mb-2">Navigate to the project directory.</p>
          <pre class="bg-muted p-2 rounded mt-1">bun install</pre>
        </li>
        <li>
          <strong>Run App:</strong>
          <pre class="bg-muted p-2 rounded mt-1">bun run dev</pre>
        </li>
      </ol>

      <h3 class="text-xl font-semibold mb-2">Environment Variables</h3>
      <p class="mb-4">
        Create a <code>.env</code> file if you need to override defaults:
      </p>
      <pre class="bg-muted p-2 rounded mb-4">VITE_OR_MANAGER_URL=https://localhost</pre>
    `,
  },
  {
    id: "architecture",
    title: "Architecture",
    content: `
      <h2 class="text-2xl font-bold mb-4">Architecture & Skeleton</h2>
      <p class="mb-4">
        The application is built with <strong>Svelte 5</strong> and <strong>Vite</strong>, using a single-page application (SPA) architecture. It communicates directly with the OpenRemote Manager API.
      </p>
      
      <h3 class="text-xl font-semibold mb-2">Key Layers</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li><strong>UI Layer:</strong> Svelte components in <code>src/lib/components</code> and pages in <code>src/lib/pages</code>.</li>
        <li><strong>State Management:</strong> A centralized reactive store in <code>src/lib/store.svelte.ts</code> using Svelte 5's <code>$state</code> and <code>$derived</code> runes.</li>
        <li><strong>Service Layer:</strong> <code>OpenRemoteService</code> class in <code>store.svelte.ts</code> handles API calls, authentication, and WebSocket subscriptions.</li>
        <li><strong>Data Model:</strong> Shared types from <code>@openremote/model</code> and local extensions in <code>src/lib/asset-types.ts</code>.</li>
      </ul>

      <h3 class="text-xl font-semibold mb-2">Folder Structure</h3>
      <pre class="bg-muted p-4 rounded-lg overflow-x-auto text-sm mb-4">
src/
├── App.svelte          # Root component, handles layout & routing
├── main.ts             # Entry point
├── lib/
│   ├── alarm-grouping.ts # Logic for grouping duplicate alarms
│   ├── asset-types.ts    # Asset type definitions & icon mappings
│   ├── store.svelte.ts   # Global state & API service
│   ├── utils.ts          # Helper functions
│   ├── components/       # Reusable UI components (Header, Cards, etc.)
│   │   └── ui/           # Shadcn-svelte primitive components
│   └── pages/            # Page views (AlarmList, AssetList, etc.)
      </pre>

      <h3 class="text-xl font-semibold mb-2">Key Dependencies</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li><strong>@openremote/core, model, rest:</strong> Official OpenRemote SDKs for API interaction.</li>
        <li><strong>tailwindcss:</strong> Utility-first CSS framework for styling.</li>
        <li><strong>bits-ui / shadcn-svelte:</strong> Headless UI primitives and accessible components.</li>
        <li><strong>dayjs:</strong> Date and time manipulation.</li>
        <li><strong>lodash:</strong> Utility library for data manipulation.</li>
        <li><strong>lucide-svelte:</strong> Icon library.</li>
      </ul>
    `,
  },
  {
    id: "domain-model",
    title: "Domain Model",
    content: `
      <h2 class="text-2xl font-bold mb-4">Key Concepts & Domain Model</h2>
      
      <h3 class="text-xl font-semibold mb-2">Alarms (SentAlarm)</h3>
      <p class="mb-4">
        The core entity. Alarms have a <code>status</code> (OPEN, IN_PROGRESS, RESOLVED), <code>severity</code>, and are linked to an <code>assignee</code> (User) and <code>assets</code>.
      </p>

      <h3 class="text-xl font-semibold mb-2">Assets (UserAssetLink)</h3>
      <p class="mb-4">
        Represents physical or logical devices. The app uses <code>UserAssetLink</code> to display assets the user has access to. We infer "Asset Types" (e.g., Building, Room, Device) using <code>asset-types.ts</code> to provide relevant icons and colors.
      </p>

      <h3 class="text-xl font-semibold mb-2">Users & Roles</h3>
      <p class="mb-4">
        Users are fetched from Keycloak/OpenRemote. The app checks for roles (e.g., <code>read:alarms</code>, <code>write:alarms</code>) to gate access to certain pages.
      </p>
    `,
  },
  {
    id: "code-tour",
    title: "Code Tour",
    content: `
      <h2 class="text-2xl font-bold mb-4">Code Tour (Engineer Handoff)</h2>
      
      <h3 class="text-xl font-semibold mb-2">State Store (store.svelte.ts)</h3>
      <p class="mb-4">
        This is the brain of the app. It initializes the OpenRemote connection, fetches initial data (alarms, assets, users), and handles real-time updates via event subscriptions.
      </p>

      <h3 class="text-xl font-semibold mb-2">Pages</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li><strong>AlarmList:</strong> The main dashboard. Displays grouped alarms. Uses <code>alarm-grouping.ts</code> to cluster duplicates.</li>
        <li><strong>AssetList:</strong> Grid view of assets with search and filtering.</li>
        <li><strong>AssetForm:</strong> Detail view of a single asset, showing its specific alarms and attributes.</li>
        <li><strong>AlarmForm (Report):</strong> Detail view of an alarm, allowing status changes and assignment.</li>
      </ul>

      <h3 class="text-xl font-semibold mb-2">Key Components</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li><strong>Header:</strong> Top navigation bar with user profile, theme toggle, and high-level stats (StatTile).</li>
        <li><strong>PageNav:</strong> Bottom navigation bar for mobile/tablet views.</li>
        <li><strong>AlarmCard / AlarmGroup:</strong> The primary display units for alarms. AlarmGroup clusters duplicates.</li>
        <li><strong>AssetCard:</strong> Display unit for assets, color-coded by type.</li>
        <li><strong>AddAlarmForm / AddAssetForm:</strong> Forms for creating new entities.</li>
        <li><strong>ThemeToggle:</strong> Handles light/dark mode switching.</li>
      </ul>

      <h3 class="text-xl font-semibold mb-2">Utilities & Libraries</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li><strong>alarm-grouping.ts:</strong> Logic to group similar alarms (same type/asset) to reduce noise.</li>
        <li><strong>asset-types.ts:</strong> Definitions for asset types, including icons and color mappings.</li>
        <li><strong>utils.ts:</strong> General helper functions (formatting, etc.).</li>
      </ul>
    `,
  },
  {
    id: "operational-notes",
    title: "Operational Notes",
    content: `
      <h2 class="text-2xl font-bold mb-4">Operational Notes</h2>
      
      <h3 class="text-xl font-semibold mb-2">Common Pitfalls</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li><strong>WebSocket Disconnection:</strong> If the app loses connection to the OpenRemote master, it will attempt to reconnect. Ensure the network allows WebSocket traffic (wss://).</li>
        <li><strong>Missing Assets:</strong> If assets don't appear, check if the user has the correct roles and if the assets are correctly linked in OpenRemote.</li>
      </ul>

      <h3 class="text-xl font-semibold mb-2">Configuration</h3>
      <p class="mb-4">
        The app is configured primarily via environment variables at build time.
      </p>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li><code>VITE_OR_MANAGER_URL</code>: The URL of the OpenRemote Manager instance.</li>
      </ul>

      <h3 class="text-xl font-semibold mb-2">Logging</h3>
      <p class="mb-4">
        Client-side errors are logged to the browser console. Network errors (API failures) are also logged to the console and may trigger UI notifications (to be implemented).
      </p>
    `,
  },
  {
    id: "testing",
    title: "Testing",
    content: `
      <h2 class="text-2xl font-bold mb-4">Testing</h2>
      <p class="mb-4">
        The project uses <strong>Vitest</strong> for unit and component testing.
      </p>

      <h3 class="text-xl font-semibold mb-2">Running Tests</h3>
      <p class="mb-2">To run the test suite once:</p>
      <pre class="bg-muted p-2 rounded mt-1 mb-4">bun run test</pre>

      <p class="mb-2">To run tests in watch mode (re-runs on file changes):</p>
      <pre class="bg-muted p-2 rounded mt-1 mb-4">bun run test:watch</pre>

      <h3 class="text-xl font-semibold mb-2">Test Coverage</h3>
      <p class="mb-2">To generate a test coverage report:</p>
      <pre class="bg-muted p-2 rounded mt-1 mb-4">bun run test:coverage</pre>
      <p class="mb-4">
        This will generate a coverage report in the <code>coverage/</code> directory and display a summary in the terminal.
      </p>
    `,
  },
  {
    id: "contribution",
    title: "Contribution",
    content: `
      <h2 class="text-2xl font-bold mb-4">Contribution Guidelines</h2>
      
      <h3 class="text-xl font-semibold mb-2">Conventions</h3>
      <ul class="list-disc pl-5 mb-4 space-y-1">
        <li><strong>Styling:</strong> Use Tailwind CSS utility classes. Avoid custom CSS files where possible.</li>
        <li><strong>Components:</strong> Prefer small, single-responsibility components. Use Shadcn-svelte primitives for UI elements.</li>
        <li><strong>State:</strong> Use the global <code>appState</code> for shared data. Use local <code>$state</code> for component-specific UI state.</li>
      </ul>

      <h3 class="text-xl font-semibold mb-2">Adding New Features</h3>
      <p class="mb-4">
        1. Define new routes in <code>src/lib/pages/index.ts</code>.<br>
        2. Create the page component in <code>src/lib/pages/</code>.<br>
        3. Add necessary data fetching methods to <code>OpenRemoteService</code> in <code>store.svelte.ts</code>.
      </p>
    `,
  },
];
