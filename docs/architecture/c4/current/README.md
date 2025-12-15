# Current System Architecture

This folder contains C4 diagrams representing the current architecture of the OpenRemote Alarm App.

## Diagrams
- **C1 System Context:** High-level view of the system and its interactions with the OpenRemote Manager.
- **C2 Container:** Shows the Single Page Application (SPA) and its connection to the OpenRemote Manager.
- **C3 Component:** Details the internal components of the SPA (Pages, Store, Services).
- **C4 Code:** Class diagram of key entities and services.

## Assumptions
- The application is a client-side SPA.
- It connects directly to the OpenRemote Manager via REST and WebSockets.
- Authentication is handled via Keycloak (part of OpenRemote).
