# Proposal C: Modular Monorepo + Shared SDK

## Purpose
To improve maintainability and enable parallel development by splitting the application into feature modules and a shared SDK.

## Key Features
- **Feature Modules:** Alarms and Assets are separate packages/modules.
- **Shared SDK:** A typed library for OpenRemote communication, used by all modules.
- **Monorepo:** All code lives in a single repository but is structured as packages.

## Tradeoffs
- **Pros:** Better code organization, reusability of the SDK, easier to test modules in isolation.
- **Cons:** Setup complexity (monorepo tooling), potential versioning overhead.
