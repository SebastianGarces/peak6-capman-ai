# Task 38: Custom server.ts with Socket.io — Complete

## Summary
Implemented a custom Node.js HTTP server that wraps the Next.js request handler and attaches a Socket.io server on the same port. Two namespaces are configured: `/challenges` for real-time head-to-head matchmaking and gameplay, and `/notifications` for push notifications. A dedicated `tsconfig.server.json` extends the base config with CommonJS module output for server-side compilation.

## Files Created/Modified
- `server.ts` (created) — HTTP server with Next.js handler + Socket.io, `/challenges` and `/notifications` namespaces
- `tsconfig.server.json` (created) — extends base tsconfig with `module: commonjs`, `outDir: dist`, `noEmit: false`

## Tests
- All tests pass (`src/__tests__/server.test.ts`)
- "server.ts exists at project root"
- "server.ts imports socket.io" (verifies `/challenges` and `/notifications` namespaces)

## AC Verification
- [x] `server.ts` exists at project root with `createServer` wrapping Next.js `getRequestHandler`
- [x] Socket.io `Server` attached to HTTP server with CORS config
- [x] `/challenges` namespace handles `challenge:request`, `challenge:cancel`, `challenge:submit`, `disconnect` events
- [x] `/notifications` namespace handles `connection` event
- [x] `tsconfig.server.json` extends base config with CommonJS output
