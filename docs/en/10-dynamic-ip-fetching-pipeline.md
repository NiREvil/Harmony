---
layout: doc
outline: deep
title: "Dynamic IP Fetching Pipeline"
description: "The Dynamic IP Fetching Pipeline is Harmony's runtime mechanism for acquiring fresh Cloudflare clean IP addresses from external sources on every subscription request."
date: 2026-08-11
editLink: true
head:
  - - meta
    - name: description
      content: "Harmony - Single-file Cloudflare Worker for generating VLESS proxy subscriptions with fresh clean IPs. Zero dependencies, edge-deployed, 30+ configurations per update."
  - - meta
    - name: keywords
      content: "harmony, vless, subscription, cloudflare worker, proxy, clean ip, v2ray, xray, sing-box, clash meta, nekobox, v2rayn, vpn, bypass, censorship resistance, websocket, tls, github, open source"
  - - meta
    - name: author
      content: "NiREvil"
  - - meta
    - name: robots
      content: "index, follow"
  - - meta
    - property: og:title
      content: "Harmony - VLESS Subscription Generator"
  - - meta
    - property: og:description
      content: "Generate VLESS proxy subscriptions with automatically injected clean Cloudflare IPs. Zero infrastructure, 3-second timeout, 30+ configs per update."
---

# Dynamic IP Fetching Pipeline

> ⏱️ 7 min · 🔴 Level: Advanced

The Dynamic IP Fetching Pipeline is Harmony's runtime mechanism for acquiring fresh Cloudflare clean IP addresses from external sources on every subscription request. Rather than relying solely on a baked-in static IP list, the pipeline executes parallel HTTP fetches against two independent IP providers, normalizes and deduplicates the results, then feeds them into the VLESS configuration generator — ensuring that each client "Update" action injects a newly shuffled set of clean IPs into the subscription output.

## 🏗️ Pipeline Architecture

The pipeline operates as a three-stage process within the `handleRequest` function: **fetch → extract → prepare**. Both dynamic sources are queried concurrently via `Promise.all`, each guarded by a 3-second timeout and a `.catch()` fallback that yields an empty array — guaranteeing that a single source failure never blocks the entire subscription response.

```mermaid
flowchart LR
    subgraph "Stage 1: Fetch"
        A[handleRequest] --> B[Promise.all]
        B --> C[fetchWithTimeout dynamic1<br/>3s timeout]
        B --> D[fetchWithTimeout dynamic2<br/>3s timeout]
        C --> E{Success?}
        D --> F{Success?}
        E -->|No| G[{ ipv4: [] }]
        E -->|Yes| H[JSON Response]
        F -->|No| I[{ data: [] }]
        F -->|Yes| J[JSON Response]
    end
    
    subgraph "Stage 2: Extract"
        H --> K[map ipv4.ip]
        J --> L[map data.ipv4]
        G --> M[empty array]
        I --> M
    end
    
    subgraph "Stage 3: Prepare"
        K --> N[new Set dedupe]
        L --> N
        M --> N
        N --> O[Fisher-Yates Shuffle]
    end
    
    O --> P[ipDataSources Map]
```

## 🔌 Source Endpoints and Response Schemas

The two dynamic endpoints are defined in the `ipSourceURLs` constant. They return **structurally different JSON payloads**, which the pipeline handles with distinct extraction lambdas.

| Property | `dynamic1` | `dynamic2` |
| --- | --- | --- |
| **URL** | `raw.githubusercontent.com/NiREvil/vless/…/Cloudflare-IPs.json` | `strawberry.victoriacross.ir` |
| **Update cadence** | Every 6 hours (GitHub Actions) | Real-time API |
| **Response root** | `ipv4` array | `data` array |
| **IP field** | `.ip` (per object) | `.ipv4` (per object) |
| **Additional fields** | `domain`, `ipv6`, `short_ipv6`, `is_ir`, `protocol_version` | Varies by API |
| **Extraction lambda** | `ipData.ip` | `item.ipv4` |
| **Catch fallback** | `{ ipv4: [] }` | `{ data: [] }` |

::: info `SCHEMA DIVERGENCE`
The `dynamic1` source pulls from the same schema as the local `cf-clean.json` Reference file — each object contains a `domain`, `ip` (IPv4), `ipv6`, `short_ipv6`, an `is_ir` regional flag, and `protocol_version`. The `dynamic2` endpoint (Strawberry API) uses a flatter structure where each object exposes an `ipv4` field directly within a `data` array.
:::

## ⏱️ The `fetchWithTimeout` Guard

Every outbound HTTP request in the pipeline passes through the `fetchWithTimeout` wrapper, which couples the standard `fetch` API with an `AbortController` signal:

```javascript
async function fetchWithTimeout(url, ms = 3000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
```

::: warning ⚠️ `CRITICAL TIMEOUT`
The default timeout of **3000 ms** ensures the worker never stalls on an unresponsive IP source. Because Cloudflare Workers have a subrequest limit and CPU time constraints, this aggressive timeout is critical — if either source is slow or down, the pipeline gracefully degrades rather than failing outright. The `finally` block guarantees the timeout timer is always cleared, preventing memory leaks in the worker runtime.
:::

## 🔄 Extraction, Deduplication, and Shuffle

Once both `Promise.all` branches resolve (or fall back to empty), the pipeline performs source-specific extraction:

- **dynamic1**: `(ipv4listRE1.ipv4 || []).map(ipData => ipData.ip).filter(ip => ip)` — navigates the `ipv4` array, plucks the `.ip` field, and filters out any falsy values.
- **dynamic2**: `(ipv4listRE2.data || []).map(item => item.ipv4).filter(ip => ip)` — navigates the `data` array, plucks the `.ipv4` field, and applies the same falsy guard.

Both lists then pass through a **two-step normalization**: `shuffleArray([...new Set(list)])`. The `new Set()` constructor eliminates duplicates, the spread operator converts back to an array, and `shuffleArray` applies a **Fisher-Yates** shuffle for randomization. This combined operation produces a unique, uniformly random ordering — meaning every subscription refresh yields a different IP sequence even if the source data hasn't changed.

## 🔗 Group-to-Source Binding and IP Selection

After normalization, the three source lists are stored in the `ipDataSources` map keyed by `"static"`, `"dynamic1"`, and `"dynamic2"`. The pipeline then iterates over `USER_SETTINGS.groups`, and each group's `dataSource` field acts as a lookup key into this map:

| Group | `dataSource` | Resolved List | Effect |
| --- | --- | --- | --- |
| Harmonyᵀᴸˢ | `"dynamic1"` | NiREvil GitHub IPs | Fresh IPs every 6-hour cycle |
| Harmonyᵀᶜᴾ | `"dynamic2"` | Strawberry API IPs | Real-time clean IPs |
| Harmonyᴱᴹˢ | `"static"` | Hardcoded `staticIPs` array | Stable, never-changing fallback |

::: info INFO: PER-GROUP IP SELECTION
For each group, the inner loop walks the resolved IP list, collecting up to `USER_SETTINGS.ipCount` (default: 10) unique IPs. Each unique IP triggers a call to `createVlessLink(ip, group, settings)`, which produces one complete VLESS URI string. The `Set` guard within the loop prevents duplicate IPs within a single group even if the source list contains repeats that survived the earlier dedup (a safety net for edge cases).
:::

## 🛡️ Failure Modes and Graceful Degradation

The pipeline is designed with **defensive redundancy** at every level:

1.  **Network timeout**: `fetchWithTimeout` aborts after 3 seconds — no hanging subrequests.
2.  **Parse failure**: Each `.then(res => res.json())` is paired with `.catch(() => ({ ipv4: [] }))` or `.catch(() => ({ data: [] }))` — a malformed or non-JSON response yields an empty but well-shaped object, so downstream extraction produces an empty array rather than throwing.
3.  **Extraction null-safety**: `(response.field || [])` guards against missing fields, and `.filter(ip => ip)` removes null/undefined/empty-string IPs.
4.  **Group-level empty list**: If a source completely fails, `ipDataSources[group.dataSource]` resolves to an empty shuffled array, the inner loop simply produces zero configs for that group, and the subscription response still returns configs from other groups.

::: tip TIP: `PROMISE.ALL PATTERN`
The `Promise.all` pattern means both dynamic fetches run in parallel, but a single rejection would reject the entire `Promise.all`. This is why each individual fetch chain includes its own `.catch()` — to convert failures into successful empty-resolved promises before they reach `Promise.all`.
:::

## ⚙️ Configuring the Pipeline

To modify the dynamic pipeline behavior, adjust these specific locations in `worker.js`:

| What to change | Location | Example |
| --- | --- | --- |
| Add a new dynamic source | Add key to `ipSourceURLs` (L974) | `dynamic3: "https://example.com/ips"` |
| Change timeout duration | `fetchWithTimeout(url, ms)` (L1013) | `fetchWithTimeout(url, 5000)` |
| Assign a group to a source | `dataSource` in group object (L63/L77/L91) | `dataSource: "dynamic2"` |
| Adjust configs per group | `ipCount` in `USER_SETTINGS` (L35) | `ipCount: 15` |
| Add extraction for new source | `ipDataSources` + extraction logic (L1042-L1050) | New `.map()` chain for new schema |

::: warning ⚠️ ADDING NEW SOURCES
When adding a third dynamic source, you must also: (1) add the URL to `ipSourceURLs`, (2) add a corresponding `fetchWithTimeout` call inside the `Promise.all` array, (3) add an extraction line that maps the response to a flat IP array, and (4) add the deduplicated/shuffled result to the `ipDataSources` map.
:::

::: info `UPDATE INTERVAL`
The `Profile-Update-Interval: 6` header (L1072) tells clients to re-fetch the subscription every 6 hours. This aligns with the `dynamic1` GitHub source's update cadence — clients naturally receive fresh IPs at the same rate the source refreshes them.
:::

## 💠 Next Steps

Understand how the extracted IPs become VLESS URIs in **[VLESS Link Builder](./11-vless-link-builder.md)**, or see how the static counterpart works in **[Static IP Fallback Strategy](./9-static-ip-fallback-strategy.md)**. For the raw JSON schema that `dynamic1` returns, consult **[cf-clean.json Reference](./cf-clean-json-reference.md)**.  
