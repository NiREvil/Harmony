---
layout: doc
outline: deep
title: "VLESS Configuration Groups"
description: "Configuration groups are the central architectural pattern in Harmony."
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

# VLESS Configuration Groups

> ⏱️ 12 min · 🟡 Level: Intermediate

Configuration groups are the **central architectural pattern** in Harmony — they define how VLESS proxy configurations are generated, grouped, and differentiated. Each group acts as an independent blueprint that controls its own hostname, TLS mode, ports, IP source, and anti-detection behavior. When the worker receives a subscription request, it iterates over every group, fetches clean IPs from that group's designated source, and emits `ipCount` VLESS links per group — yielding 30 total configurations by default (3 groups × 10 IPs).

## 🎛️ The USER_SETTINGS Object

All user-configurable state lives inside the `USER_SETTINGS` constant at the top of `worker.js`. It contains three categories of settings: **global identity** (UUID), **global output controls** (`ipCount`, Early Data), and the **groups array** itself.

| Property | Line | Type | Default | Purpose |
| --- | --- | --- | --- | --- |
| `uuid` | 32 | `string` | `"a22bff60-..."` | VLESS authentication UUID shared across all groups |
| `ipCount` | 35 | `number` | `10` | Number of VLESS configs generated **per group** |
| `ed` | 38 | `string` | `"2560"` | Early Data max value (performance tuning) |
| `eh` | 39 | `string` | `"Sec-WebSocket-Protocol"` | Early Data header name |
| `groups` | 51 | `array` | 3 groups | Array of group definition objects |

::: tip TIP
Changing `ipCount` from 10 to 20 would produce 60 total configs (3 groups × 20). The total output scales linearly with both `ipCount` and the number of groups in the array.
:::

## 📋 Group Object Schema

Each element in the `groups` array is an object with a fixed set of properties. Understanding this schema is essential before customizing or extending groups.

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | `string` | ✅ | Display name used as the VLESS link fragment (`#name`). Appears as the config remark in clients. |
| `host` | `string` | ✅ | Worker hostname — the `Host` header value sent in the WebSocket handshake. |
| `sni` | `string` | ✅ | Server Name Indication for TLS. **Must be empty string** for non-TLS groups. |
| `path` | `string` | ✅ | WebSocket path. Supports the `random:N` macro (e.g., `/random:18` generates 18 random alphanumeric chars). |
| `tls` | `boolean` | ✅ | Enables TLS security and adds `security=tls` + `sni` to the VLESS URL. |
| `allowInsecure` | `boolean` | ✅ | When `true`, appends `allowInsecure=1` to the VLESS URL. Typically `false` for production. |
| `ports` | `string[]` | ✅ | Array of Cloudflare-allowed ports. One is randomly selected per generated config. |
| `alpn` | `string` | ✅ | Application-Layer Protocol Negotiation value. `"http/1.1"` for WebSocket over TLS; `""` for non-TLS. |
| `fp` | `string[]` | ✅ | Client fingerprint pool. One is randomly selected per generated config. Currently only `"chrome"` works reliably. |
| `dataSource` | `string` | ✅ | IP data source key: `"static"`, `"dynamic1"`, or `"dynamic2"`. |
| `randomizeSni` | `boolean` | ✅ | When `true`, each config's SNI gets random uppercase/lowercase casing for anti-detection. |

## 📦 Default Groups Breakdown

Harmony ships with three preconfigured groups, each serving a distinct network topology. The following diagram illustrates how they relate to IP sources and the final subscription output:

### Group 1 — Harmonyᵀᴸˢ (Primary TLS)

This is the **primary TLS-encrypted group** intended for standard WebSocket-over-TLS connections. It uses `dynamic1` (NiREvil's GitHub repository) for fresh clean IPs and enables SNI case randomization for censorship resistance.

| Property | Value | Rationale |
| --- | --- | --- |
| `name` | `"Harmonyᵀᴸˢ"` | Unicode superscript tags help visually distinguish groups in client UIs |
| `host` | `"index.harmonica01.workers.dev"` | Workers.dev hostname for the primary proxy worker |
| `sni` | `"index.harmonica01.workers.dev"` | SNI matches host (standard for Workers-based configs) |
| `path` | `"/random:18"` | 18 random characters — fresh path per config for obfuscation |
| `tls` | `true` | TLS required for secure transport |
| `ports` | `["443","8443","2053","2083","2087","2096"]` | All Cloudflare-supported TLS ports |
| `alpn` | `"http/1.1"` | WebSocket only supports HTTP/1.1 ALPN |
| `fp` | `["chrome"]` | Chrome fingerprint for uTLS client hello |
| `dataSource` | `"dynamic1"` | NiREvil's auto-updated clean IP list |
| `randomizeSni` | `true` | Randomizes SNI casing to evade DPI filters |

### Group 2 — Harmonyᵀᶜᴾ (Non-TLS / TCP)

This group operates **without TLS encryption**, using plain TCP WebSocket connections. It is restricted to Workers deployments only (no `pages.dev` support). Non-TLS groups have specific constraints: `sni` must be empty and `alpn` must be empty, since TLS negotiation does not occur.

| Property | Value | Rationale |
| --- | --- | --- |
| `name` | `"Harmonyᵀᶜᴾ"` | TCP identifier in client UIs |
| `host` | `"index.harmonica02.workers.dev"` | Separate Workers hostname for TCP proxy |
| `sni` | `""` | **Must be empty** — SNI is a TLS concept |
| `path` | `"/random:18"` | Same obfuscation strategy as Group 1 |
| `tls` | `false` | No TLS — plaintext WebSocket |
| `ports` | `["80","8080","8880","2052","2082","2086","2095"]` | All Cloudflare-supported HTTP ports |
| `alpn` | `""` | **Must be empty** — ALPN requires TLS |
| `fp` | `["chrome"]` | Fingerprint still applied to WebSocket handshake |
| `dataSource` | `"dynamic2"` | Strawberry API for IP diversity |
| `randomizeSni` | `false` | No SNI to randomize in non-TLS mode |

### Group 3 — Harmonyᴱᴹˢ (Alternative TLS / Emergency)

This group serves as a **fallback TLS configuration** using static (hardcoded) clean IPs. It is designed for situations where dynamic IP fetching fails or network conditions are poor. Notice the fixed path with Early Data embedded directly (`?ed=2048`) — this is optimized for Xray-core clients that handle Early Data via the path parameter rather than separate query fields.

| Property | Value | Rationale |
| --- | --- | --- |
| `name` | `"Harmonyᴱᴹˢ"` | Emergency/fallback identifier |
| `host` | `"ems.nscl.workers.dev"` | Different worker hostname for isolation |
| `sni` | `"ems.nscl.workers.dev"` | Matches host |
| `path` | `"/random:14?ed=2048"` | Fixed path with Early Data in URL — Xray-core optimization |
| `tls` | `true` | TLS required |
| `ports` | `["443","2053"]` | Minimal port set for reliability |
| `alpn` | `"http/1.1"` | Standard WebSocket ALPN |
| `fp` | `["chrome"]` | Chrome fingerprint |
| `dataSource` | `"static"` | Hardcoded IPs from `staticIPs` array — no network fetch needed |
| `randomizeSni` | `true` | SNI randomization enabled |

::: info NOTE
Group 3's `dataSource: "static"` means it never triggers a network fetch — its IPs come from the `staticIPs` array hardcoded in worker.js (lines 102–971). This makes it the most resilient group when external APIs are unreachable.
:::

## ⚙️ How Groups Are Processed at Runtime

The runtime processing logic in `handleRequest` reveals the exact execution model. When a client requests the subscription URL, the worker:

1. **Fetches dynamic IPs** — Both `dynamic1` and `dynamic2` are fetched concurrently via `Promise.all` with a 3-second timeout.
2. **Builds IP data sources map** — Each source gets its IP list shuffled (Fisher-Yates) and deduplicated.
3. **Iterates groups** — For each group, it resolves `group.dataSource` to an IP list, then generates up to `ipCount` unique VLESS links.
4. **Encodes output** — All links are joined with newlines and Base64-encoded for subscription compatibility.

::: info NOTE
The key insight is that **each group is independently self-contained**: it specifies its own IP source, ports, TLS mode, and hostname. There is no cross-group dependency or IP sharing unless two groups reference the same `dataSource` value.
:::

## 🔗 VLESS Link Generation Per Group

The `createVlessLink` function translates a single group + IP pair into a complete VLESS URI. Here is the exact algorithm:

1. **Port selection** — A random element is chosen from `group.ports`.
2. **Fingerprint selection** — A random element is chosen from `group.fp`.
3. **Path resolution** — If `group.path` contains `random:N`, the `N` is parsed and replaced with `N` random lowercase alphanumeric characters via `generateRandomPath`.
4. **Query parameter assembly** — Fixed params: `path`, `encryption=none`, `type=ws`, `host`, `fp`, `ed`, `eh`.
5. **TLS conditional block** — If `group.tls` is `true`: sets `security=tls`, computes SNI (applying `randomizeSni` if enabled), and conditionally adds `alpn` and `allowInsecure`.
6. **URI construction** — Final format: `vless://{uuid}@{ip}:{port}?{params}#{encoded_name}`

The resulting VLESS link for a TLS group with all defaults would look like:

```text
vless://a22bff60-...@104.16.92.209:443?path=/a7x9k2...&encryption=none&type=ws&host=index.harmonica01.workers.dev&fp=chrome&ed=2560&eh=Sec-WebSocket-Protocol&security=tls&sni=iNdEx.haRMonICA01.wOrkeRS.dEV&alpn=http/1.1#Harmony%E1%B5%80%E1%B4%B8%CB%A2
```

## 🛠️ Customizing and Extending Groups

The groups array is designed for full flexibility — you can **add, remove, or modify** groups to match your deployment topology.

### Adding a Fourth Group

To add a new group, append an object to the `groups` array following the schema. For example, a Pages.dev-based TLS group:

```javascript
groups: [
  // ... existing groups ...
  {
    name: "Harmonyᴾᴬᴳᴱˢ",
    host: "your-project.pages.dev",
    sni: "your-project.pages.dev",
    path: "/random:20",
    tls: true,
    allowInsecure: false,
    ports: ["443", "8443"],
    alpn: "http/1.1",
    fp: ["chrome"],
    dataSource: "dynamic1",
    randomizeSni: true,
  },
],
```

### Reducing to a Single Group

If you only need one configuration type, keep a single group in the array. The output will contain exactly `ipCount` VLESS links.

### Cross-Group Constraints

::: warning ⚠️ BE CAREFUL
These constraints are critical and ignoring them will cause client errors or broken configurations.
:::

| Constraint | Details |
| --- | --- |
| Non-TLS groups **must** set `sni: ""` | SNI is meaningless without TLS; omitting it causes client errors |
| Non-TLS groups **must** set `alpn: ""` | ALPN negotiation requires a TLS handshake |
| Non-TLS groups **must not** include `pages.dev` hosts | Cloudflare Pages enforces TLS; only Workers support HTTP ports |
| `path` with `?ed=` conflicts with global `ed` | Group 3 uses `?ed=2048` in path for Xray-core; avoid this if your client reads `ed` from query params |
| `fp` currently limited to `["chrome"]` | Other fingerprints (firefox, safari, edge) do not work reliably with Workers WebSocket |

## 📌 Group Property Quick Reference

For rapid lookup when editing `worker.js`, here are the exact line numbers for each default group's properties:

| Property | Group 1 (TLS) | Group 2 (TCP) | Group 3 (Alt TLS) |
| --- | --- | --- | --- |
| `name` | Line 54 | Line 68 | Line 82 |
| `host` | Line 55 | Line 69 | Line 83 |
| `sni` | Line 56 | Line 70 | Line 84 |
| `path` | Line 57 | Line 71 | Line 85 |
| `tls` | Line 58 | Line 72 | Line 86 |
| `allowInsecure` | Line 59 | Line 73 | Line 87 |
| `ports` | Line 60 | Line 74 | Line 88 |
| `alpn` | Line 61 | Line 75 | Line 89 |
| `fp` | Line 62 | Line 76 | Line 90 |
| `dataSource` | Line 63 | Line 77 | Line 91 |
| `randomizeSni` | Line 64 | Line 78 | Line 92 |

## 💠 Next Steps
Now that you understand how configuration groups define the structure and behavior of your VLESS output, explore the specific properties in detail:  

- **[UUID and Hostname Setup](./6-uuid-and-hostname-setup.md)** — How to extract and replace the UUID and host values from your existing VLESS config
- **[Ports and ALPN Settings](./7-ports-and-alpn-settings.md)** — Deep dive into Cloudflare's allowed port ranges and ALPN protocol constraints
- **[IP Data Sources](./8-ip-data-sources.md)** — How the three IP source modes (`static`, `dynamic1`, `dynamic2`) work and when to use each