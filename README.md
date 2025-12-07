<img width="2318" height="3247" alt="image" src="https://github.com/user-attachments/assets/32eb6601-1618-4d39-b6f5-ff00b5037e57" />

## Directory Structure

We're going with a minimal, layer with intent file structure; to keep the application thin, whilst still meaningful & descriptive:

```
frontend/src/
├─ app/           # App Router: routes, layouts, metadata (thin)
├─ features/      # Domain bundles (auth, requests, approvals, settings)
├─ shared/        # Cross-cutting UI, layout chrome, providers, lib
└─ external/      # Server adapters (dto, handler, service, repository, client)
```

### features/ own orchestration

```
features/requests/
├─ components/
│  ├─ server/    # Server Components (page templates)
│  └─ client/    # Container / Presenter / Hook slices
├─ hooks/        # TanStack Query + client logic
├─ queries/      # Query keys + DTO helpers
├─ actions/      # Server Actions (thin wrappers)
└─ types/        # Shared types, enums
```

### Client slices are deliberately small:

```
components/client/RequestList/
├─ RequestListContainer.tsx   # uses hook, passes props down
├─ RequestListPresenter.tsx   # pure JSX
├─ useRequestList.ts          # orchestrates Query + derived state
├─ RequestList.test.tsx       # co-located tests
└─ index.ts                   # barrel export
```

### external/ is your escape hatch

```
external/
├─ dto/           # Zod schemas + TS types
├─ handler/       # Server entry points (command.server.ts / query.server.ts / *.action.ts)
├─ service/       # Domain services (business logic)
├─ repository/    # DB access (Drizzle or swap later)
└─ client/        # Outbound API clients
```

Following Playbook:
https://dev.to/yukionishi1129/building-a-production-ready-nextjs-app-router-architecture-a-complete-playbook-3f3h
