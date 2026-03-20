# Snowplow Signals Integration Plan

Reference implementation: `leos-credit-bureau-tanstack`

---

## Overview

The project already has `@snowplow/browser-tracker` installed with a basic tracker (`initSnowplow()` + `SnowplowProvider`). This plan upgrades it to the full Signals-capable setup from the reference project, adding:

- **Signals browser plugin** for real-time in-session interventions
- **Signals Node SDK** for server-side attribute lookups
- **Auto-tracking plugins** (button clicks, link clicks, performance, site tracking)
- **UTM parameter persistence** across navigations
- **`SnowplowSignalsContext`** to expose the Signals endpoint URL to client components
- **Server-side API route** (`/api/service-attributes`) for authenticated Signals calls
- **Snowtype** configuration for auto-generated, type-safe event schemas

---

## Steps

### 1 — Install new packages

```bash
pnpm add \
  @snowplow/browser-plugin-button-click-tracking@^4.6.8 \
  @snowplow/browser-plugin-link-click-tracking@^4.6.8 \
  @snowplow/browser-plugin-performance-navigation-timing@^4.6.8 \
  @snowplow/browser-plugin-site-tracking@^4.6.8 \
  @snowplow/signals-browser-plugin@^0.2.0 \
  @snowplow/signals-node@^0.2.0
```

Add Snowtype as a dev dependency and a generate script:

```bash
pnpm add -D @snowplow/snowtype
```

`package.json` scripts addition:
```json
"snowtype:generate": "snowtype generate"
```

---

### 2 — Update `src/lib/snowplow.ts`

Replace the function-based `initSnowplow()` approach with a **module-level initialization** that returns a `snowplowTracker` object (same pattern as the reference). This enables calling `snowplowTracker.getDomainUserId()` later from services.

Key changes:
- Call `newTracker(...)` at module import time (guarded by `typeof window !== 'undefined'`)
- Add plugins: `SignalsPlugin`, `ButtonClickTrackingPlugin`, `LinkClickTrackingPlugin`, `PerformanceNavigationTimingPlugin`, `SiteTrackingPlugin`
- Call `enableButtonClickTracking()` and `enableLinkClickTracking()` after tracker creation
- Export `snowplowTracker` (the return value of `newTracker`) alongside the existing re-exports
- Keep the `trackPageView` / `trackStructEvent` / `trackSelfDescribingEvent` re-exports so existing call sites don't change

---

### 3 — Update `src/components/SnowplowProvider.tsx`

The `initSnowplow()` call is no longer needed since initialization happens at module import. Simplify the component to:
- Import `snowplow.ts` (side-effect import triggers initialization)
- Keep the page-view tracking `useEffect` on `pathname`/`search` changes
- Remove the `initialized` flag guard (module-level init is inherently run-once)

---

### 4 — Create `src/lib/utm.ts`

Port the UTM utility from the reference project verbatim. It provides:

| Function | Purpose |
|---|---|
| `extractUTMFromURL(url?)` | Parse UTM params from a URL string |
| `storeUTMParams(params)` | Persist to `sessionStorage` under key `snowplow_utm_params` |
| `getStoredUTMParams()` | Read persisted params |
| `clearUTMParams()` | Remove persisted params |
| `applyUTMToURL(url, params)` | Append UTM params to any URL |
| `simulateUTMParams(params)` | Dev helper to inject UTM params |

---

### 5 — Create `src/contexts/SnowplowSignalsContext.tsx`

A lightweight React context that reads `VITE_SNOWPLOW_SIGNALS_ENDPOINT` (client-safe) and exposes `{ baseUrl: string | null }` to all child components. Exports:

- `SnowplowSignalsProvider` — wraps the app tree
- `useSnowplowSignals()` — throws if used outside provider
- `useSnowplowSignalsOptional()` — returns `null` safely

---

### 6 — Create `src/routes/api/service-attributes.ts`

Server-side TanStack Start API route at `GET /api/service-attributes`. Uses `@snowplow/signals-node` to fetch user attributes from the Signals API. Supports two init modes:

| Mode | Required env vars |
|---|---|
| Sandbox | `SNOWPLOW_SIGNALS_ENDPOINT` + `SNOWPLOW_SIGNALS_SANDBOX_TOKEN` |
| API Key | `SNOWPLOW_SIGNALS_ENDPOINT` + `SNOWPLOW_SIGNALS_API_KEY` + `SNOWPLOW_SIGNALS_API_KEY_ID` + `SNOWPLOW_SIGNALS_ORG_ID` |

Query params: `attribute_key`, `identifier`, `name`. Returns Signals attributes as JSON or a structured error.

---

### 7 — Update `src/routes/__root.tsx`

Two additions:

1. **Wrap children with `<SnowplowSignalsProvider>`** so any route can call `useSnowplowSignals()`
2. **Add UTM tracking `useEffect`**: on every `location.pathname`/`location.search` change, read stored UTM params and use `window.history.replaceState` to reapply them if they're missing from the current URL

---

### 8 — Create `snowtype.config.json`

```json
{
  "igluCentralSchemas": [],
  "dataStructures": [],
  "repositories": [],
  "eventSpecificationIds": [],
  "dataProductIds": [],
  "organizationId": "<YOUR_ORG_ID>",
  "tracker": "@snowplow/browser-tracker",
  "language": "typescript",
  "outpath": "./snowtype"
}
```

Once a Data Product is created in the Snowplow Console, add its ID to `dataProductIds` and run `pnpm snowtype:generate` to get a typed `snowtype/snowplow.ts` file with `trackXxxSpec(...)` functions.

---

### 9 — Update `.env.local`

Add the new variables:

```env
# Already present
VITE_SNOWPLOW_COLLECTOR_URL=https://collector-sales-aws.snowplow.io

# New — client-safe (Signals endpoint for browser plugin)
VITE_SNOWPLOW_SIGNALS_ENDPOINT=https://<your-signals-endpoint>.signals.snowplowanalytics.com

# New — server-only (never expose via VITE_ prefix unless absolutely needed)
SNOWPLOW_SIGNALS_API_KEY=<your-api-key>
SNOWPLOW_SIGNALS_API_KEY_ID=<your-api-key-id>
SNOWPLOW_SIGNALS_ORG_ID=<your-org-id>
# Optional sandbox mode instead of API key:
# SNOWPLOW_SIGNALS_SANDBOX_TOKEN=<your-sandbox-token>
```

---

### 10 — Add `.env.local` variables to `.gitignore` (verify)

Confirm `.gitignore` already ignores `.env.local` (it should for a Vite project). The server-side keys (`SNOWPLOW_SIGNALS_API_KEY`, etc.) must never be committed.

---

## File Changeset Summary

| Action | File |
|---|---|
| Modify | `package.json` |
| Modify | `src/lib/snowplow.ts` |
| Modify | `src/components/SnowplowProvider.tsx` |
| Create | `src/lib/utm.ts` |
| Create | `src/contexts/SnowplowSignalsContext.tsx` |
| Create | `src/routes/api/service-attributes.ts` |
| Modify | `src/routes/__root.tsx` |
| Create | `snowtype.config.json` |
| Modify | `.env.local` |

---

## Post-Implementation Checklist

- [ ] Run `pnpm install` after adding packages
- [ ] Set all new env vars in `.env.local` (and in Vercel/CI project settings for deployment)
- [ ] Verify tracker fires in browser DevTools → Network tab (look for requests to the collector URL)
- [ ] Verify `SignalsPlugin` initializes without errors in the console
- [ ] Test `/api/service-attributes?attribute_key=...&identifier=...&name=...` endpoint locally
- [ ] Once a Data Product exists, run `pnpm snowtype:generate` and commit `snowtype/snowplow.ts`
- [ ] Add `data-sp-button-label="..."` attributes to key interactive buttons (play, favorite, vote, share) for automatic button-click tracking
