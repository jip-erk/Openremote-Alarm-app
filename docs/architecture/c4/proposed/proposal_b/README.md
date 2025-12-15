# Proposal B: Event-Driven + Streaming Updates

## Purpose
To provide a real-time UI with scalable alarm/asset updates using a dedicated event gateway.

## Key Features
- **Event Gateway:** A dedicated service (WebSocket/SSE) for pushing updates to clients.
- **Stream Processor:** Processes and dedupes events before sending them to the gateway.
- **Subscriptions:** Clients subscribe to specific asset/alarm groups.

## Tradeoffs
- **Pros:** Highly scalable real-time updates, reduced load on the main API for polling.
- **Cons:** High complexity in implementing and maintaining the event pipeline.
