---
layout: doc
outline: deep
title: "cf-clean.json Reference"
description: "cf-clean.json is Harmonys local clean IP database — an 18,000+ line structured snapshot of Cloudflare edge IPs that have been verified as clean for VLESS proxy traffic."
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

# cf-clean.json Reference

**cf-clean.json** is Harmony's local clean IP database — an 18,000+ line structured snapshot of Cloudflare edge IPs that have been verified as clean (unblocked) for VLESS proxy traffic. It defines the canonical schema that the `dynamic1` fetching pipeline consumes at runtime from the upstream repository, and it serves as the authoritative reference for understanding every field that flows through Harmony's IP selection system.

## Top-Level Structure

The file is a single JSON object with three root keys. The `ipv4` array is the primary data payload; the metadata fields track freshness for cache invalidation decisions.

| Key | Type | Purpose |
| --- | --- | --- |
| `last_update` | `string` | Human-readable UTC timestamp of the last database refresh |
| `last_timestamp` | `number` | Unix epoch of the same refresh — enables programmatic staleness checks |
| `ipv4` | `array<object>` | Ordered list of clean IP entry objects (the core dataset) |

```json
{
    "last_update": "4:20 PM UTC - Thursday, 30 July 2026",
    "last_timestamp": 1785418102,
    "ipv4": [ ... ]
}
```

::: info `Naming Convention`
Despite the `ipv4` key name, each entry carries **both** IPv4 and IPv6 address data alongside domain and protocol metadata — the key name reflects that the array's primary selection axis is the IPv4 address.
:::

## Entry Object Schema

Every element inside the `ipv4` array conforms to this exact six-field structure:

| Field | Type | Example | Description |
| --- | --- | --- | --- |
| `domain` | `string` | `"codepen.io"` | The Cloudflare-proxied domain that resolved to this IP. Serves as both a provenance record and a usable SNI/Host value. |
| `ip` | `string` | `"104.26.4.246"` | **The consumed field.** The clean IPv4 address — this is the value extracted by `dynamic1` and injected into VLESS links. |
| `ipv6` | `string` | `"2606:4700:3037::6815:50c5"` | Full IPv6 address of the same Cloudflare edge node. Available for future IPv6 routing but **not currently consumed** by worker.js. |
| `short_ipv6` | `string` | `"::ffff:6815:50c5"` | IPv4-mapped IPv6 shorthand (`::ffff:` prefix). This is the format used in the `staticIPs` array in worker.js. |
| `is_ir` | `boolean` | `true` | Indicates whether the domain is an Iranian `.ir` TLD. Useful for region-specific IP preference or filtering. |
| `protocol_version` | `string` | `"TLSv1.3"` | The TLS protocol version supported at this edge node. All entries currently report `TLSv1.3`. |

## How Worker.js Consumes This Data

The consumption pipeline is narrow and deliberate — despite the rich six-field schema, **only the `ip` field is extracted at runtime**. Here is the precise data flow:

The extraction occurs in a single chained operation at line 1042:

```javascript
const ipListRE1 = (ipv4listRE1.ipv4 || []).map((ipData) => ipData.ip).filter((ip) => ip);
```

::: danger `Discarded Fields`
This means: access the `ipv4` array → map each entry to its `.ip` string → filter out any falsy values. The remaining fields (`domain`, `ipv6`, `short_ipv6`, `is_ir`, `protocol_version`) are **discarded** during the dynamic pipeline execution. They exist in the JSON for offline analysis, debugging, and potential future use.
:::

::: info `Dynamic vs Local`
The `dynamic1` URL in worker.js does **not** point to `cf-clean.json` in this repository — it fetches from `https://raw.githubusercontent.com/NiREvil/vless/refs/heads/main/Cloudflare-IPs.json`, which follows the identical schema but is updated every 6 hours. The local `cf-clean.json` is the schema reference and offline snapshot.
:::

## Relationship to staticIPs

The `staticIPs` array in worker.js contains entries in two formats that directly correspond to cf-clean.json fields:

| staticIPs Format | cf-clean.json Source | Example |
| --- | --- | --- |
| `[::ffff:XXXX]` (bracketed IPv4-mapped) | `short_ipv6` field | `"[::ffff:6810:31f]"` ↔ `"::ffff:6810:31f"` |
| Plain domain string | `domain` field | `"codepen.io"` ↔ `"codepen.io"` |
| Plain IPv4 string | `ip` field | `"104.16.0.223"` ↔ `"104.16.0.223"` |

The staticIPs array is a **curated subset** — hand-picked entries from the same IP universe that cf-clean.json documents comprehensively. When `dataSource: "static"` is configured for a group, the worker resolves these entries via DNS at connection time rather than using them as direct IP addresses.

## Domain Origin Categories

The `domain` field in cf-clean.json entries falls into three distinct categories, identifiable by TLD and subdomain patterns:

| Category | TLD Pattern | `is_ir` | Count Share | Examples |
| --- | --- | --- | --- | --- |
| **Iranian sites** | `.ir` | `true` | ~85% | `didgahnews.ir`, `cdn.license-market.ir`, `subfixer.ir` |
| **Workers.dev subdomains** | `.workers.dev` | `false` | ~5% | `0x00.serpents.workers.dev`, `0.royal-di.workers.dev` |
| **International sites** | `.com`, `.io`, `.org` | `true`* | ~10% | `codepen.io`, `nodejs.org`, `harbor.io`, `fbi.gov` |

::: danger Understanding the `is_ir` Flag
* International domains are marked `is_ir: true` when they have been verified accessible from Iranian networks — the flag signals *regional reachability*, not TLD ownership. The heavy weighting toward `.ir` domains is intentional: these are Cloudflare-proxied Iranian websites whose edge IPs are known to route cleanly from within Iran's network, making them the most reliable candidates for the `dynamic1` pipeline.
:::

## IP Address Ranges

The `ip` field spans three Cloudflare anycast prefix families, each with distinct routing characteristics:

| Prefix | Range | Example | Typical Use |
| --- | --- | --- | --- |
| **104.16–26.x.x** | `104.16.0.0/12` | `104.16.0.223` | Primary Cloudflare edge — largest share of entries |
| **162.159.x.x** | `162.159.0.0/16` | `162.159.36.77` | Secondary Cloudflare edge — common for enterprise plans |
| **172.64–67.x.x** | `172.64.0.0/13` | `172.67.69.223` | Tertiary edge — often used by free-tier proxied sites |
| **188.114.x.x** | `188.114.96.0/20` | `188.114.99.220` | Specialized edge range — appears in staticIPs fallback |

The `ipv6` field shows two address families: Cloudflare's `2606:4700:...` global unicast range and the `2a06:98c1:3120::3` / `2a06:98c1:3121::3` addresses which appear repeatedly — these are Cloudflare's anycast gateway addresses shared across many edge nodes.

## short_ipv6 Decoding

The `short_ipv6` field uses the **IPv4-mapped IPv6 address** format defined in RFC 4291: `::ffff:w.x.y.z` where `w.x.y.z` is the original IPv4 address encoded in hex. This format is what the `staticIPs` array in worker.js wraps in brackets (`[::ffff:XXXX]`) for IPv6 socket binding.

::: info `Decoding Example`
For example, decoding `::ffff:6810:31f`:
- Split into bytes: `68` `10` `03` `1f`
- Convert to decimal: `104` `16` `3` `31`
- Result: **`104.16.3.31`**
:::

The `short_ipv6` representation saves space versus storing the full `2606:4700:...` address, and it doubles as the exact format needed for IPv6-mapped socket connections in the staticIPs fallback path — no runtime conversion required.

## Freshness and Update Cadence

The metadata fields track when the database was last regenerated:

```json
"last_update": "4:20 PM UTC - Thursday, 30 July 2026",
"last_timestamp": 1785418102
```

::: info `Sync with Subscription Headers`
The upstream source (fetched by `dynamic1`) is refreshed every **6 hours**, which aligns with the `Profile-Update-Interval: 6` header that worker.js returns in subscription responses. This ensures that clients pulling fresh subscriptions will always receive IPs from a database no older than 6 hours — critical because Cloudflare edge IP cleanliness can change as routing policies or blocklists are updated.
:::

## Schema Validation Summary

::: danger `Complete Validation Contract`
For any consumer implementing a parser or validator for this format, the complete contract is:

| Rule | Constraint |
| --- | --- |
| Root type | `object` with exactly 3 keys: `last_update`, `last_timestamp`, `ipv4` |
| `last_update` | Non-empty string, UTC timestamp format |
| `last_timestamp` | Positive integer, Unix epoch seconds |
| `ipv4` | Non-empty array of entry objects |
| Entry `domain` | Non-empty string (FQDN) |
| Entry `ip` | Non-empty string, valid IPv4 dotted-decimal |
| Entry `ipv6` | Non-empty string, valid full IPv6 address |
| Entry `short_ipv6` | Non-empty string, `::ffff:XXXX:XXXX` format |
| Entry `is_ir` | Boolean |
| Entry `protocol_version` | `"TLSv1.3"` (single known value as of current dataset) |
| Entry completeness | All 6 fields are **required** — no null/missing values observed |
:::

## The End

**Freedom to Dream 🩶**