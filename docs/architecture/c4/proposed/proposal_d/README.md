# Proposal D: Multi-Tenant / Multi-Instance OpenRemote Manager

## Purpose
To support connecting to multiple OpenRemote instances from a single application interface.

## Key Features
- **Instance Registry:** A service to manage configuration for multiple OpenRemote instances.
- **Tenant Switching:** UI allows users to switch between different OpenRemote environments.
- **Auth Broker:** Handles authentication for multiple realms/instances.

## Tradeoffs
- **Pros:** Supports complex deployments with multiple sites/managers.
- **Cons:** Significant complexity in state management and authentication handling.
