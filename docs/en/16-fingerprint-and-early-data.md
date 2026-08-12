---
layout: doc
outline: deep
title: "Fingerprint and Early Data"
description: "Harmony employs two synergistic anti-detection mechanisms — TLS client fingerprinting and WebSocket early data."
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

# Fingerprint and Early Data

> ⏱️ 8 min · Level: <Badge type="danger" text="Advanced" />  

Harmony employs two synergistic anti-detection mechanisms — **TLS client fingerprinting** and **WebSocket early data** — that operate at different layers of the connection handshake to make VLESS traffic appear indistinguishable from legitimate browser-originated WebSocket sessions. Together, they close the two most common detection surfaces used by Deep Packet Inspection (DPI) systems: the TLS ClientHello fingerprint mismatch and the WebSocket upgrade timing anomaly.

## TLS Client Fingerprint (`fp`)

When a real browser initiates a TLS connection, it sends a ClientHello message containing a specific ordering and selection of cipher suites, extensions, supported groups, and signature algorithms. This unique combination forms a **JA3/JA4 fingerprint** — a hash that DPI systems use to classify the TLS client. Proxy clients like Xray/sing-box generate their own ClientHello, which produces a fingerprint drastically different from any known browser, making the proxy connection trivially detectable.

Harmony addresses this by specifying a `fp` (fingerprint) parameter in each configuration group. The VLESS client then **emulates the exact ClientHello structure** of the declared browser, ensuring the TLS handshake fingerprint matches a legitimate browser profile.

### Group-Level Configuration

Each configuration group declares its fingerprint as an **array** of allowed values. During VLESS link generation, one value is selected at random from the array per link:

| Group | Line | Setting | Effective Behavior |
| --- | --- | --- | --- |
| Harmonyᵀᴸˢ (TLS) | L62 | `fp: ["chrome"]` | Chrome fingerprint on all TLS configs |
| Harmonyᵀᶜᴾ (TCP) | L76 | `fp: ["chrome"]` | Chrome fingerprint on all TCP configs |
| Harmonyᴱᴹˢ (Alt TLS) | L90 | `fp: ["chrome"]` | Chrome fingerprint on all alt TLS configs |

The random selection logic resides in `createVlessLink`, which picks a fingerprint from the group's `fp` array and injects it as the `fp` query parameter in the generated VLESS URI:

```javascript
const randomFp = group.fp[Math.floor(Math.random() * group.fp.length)];
// ... later:
queryParams.set("fp", randomFp);
```

::: danger Current Limitation: `Chrome Only`
At present, only `chrome` is specified across all groups. This is an **intentional constraint**, not a design limitation of the code itself. The underlying reason is that Cloudflare Workers' TLS termination behavior interacts reliably only with the Chrome fingerprint profile — other browser fingerprints (firefox, safari, edge, randomized) may cause connection failures or inconsistent handshake completion when routing through Workers.
:::

::: details Future expansion   
(not yet reliably functional with Workers)
The array-based architecture is forward-compatible: when Workers TLS handling stabilizes for additional fingerprints, you can expand the array without any code changes:

```javascript
// Future expansion (not yet reliably functional with Workers)
fp: ["chrome", "firefox", "safari", "edge", "android", "ios", "360", "qq", "randomized"],
```
:::

## Early Data (`ed` and `eh`)

The **early data** mechanism is a performance optimization that also doubles as a timing-based anti-detection feature. In a standard WebSocket upgrade, the client must wait for the HTTP 101 Switching Protocols response before sending any application data. This creates a visible timing gap between the TLS handshake completion and the first data packet — a pattern that DPI systems can statistically detect as proxy behavior.

Early data (specified via the `ed` parame⁴ter) allows the VLESS client to **piggyback initial payload bytes onto the WebSocket upgrade request itself**, eliminating the inter-handshake silence. The server reads these bytes from the upgrade request headers before the WebSocket is formally established, effectively merging the connection setup and first data transmission into a single round-trip.

### Global Configuration

Unlike fingerprint which is group-scoped, early data is configured **globally** in `USER_SETTINGS` — it applies uniformly to every VLESS link generated by the worker:

| Parameter | Line | Default Value | Purpose |
| --- | --- | --- | --- |
| `ed` | L38 | `"2560"` | Maximum early data size in bytes |
| `eh` | L39 | `"Sec-WebSocket-Protocol"` | HTTP header name carrying the early data |

Both values are injected into every VLESS URI as query parameters during link construction:

```javascript
const queryParams = new URLSearchParams({
  // ... other params ...
  ed: settings.ed,    // "2560"
  eh: settings.eh,    // "Sec-WebSocket-Protocol"
});
```

### Why `ed: 2560`?

::: info Rationale behind the value
The value **2560** is not arbitrary — it represents the maximum number of bytes that can be encoded into a `Sec-WebSocket-Protocol` header within standard HTTP header size limits (typically 8 KiB for the entire header block). The Base64 encoding used to embed the early data inflates the byte count by approximately 4/3, so 2560 raw bytes become ~3414 encoded characters — comfortably within header limits while maximizing the amount of data that bypasses the round-trip penalty.
:::

The `eh` (early data header) value of `"Sec-WebSocket-Protocol"` is chosen because this header is **semantically expected** in any WebSocket upgrade request. DPI systems that inspect headers will see a normal WebSocket protocol negotiation rather than a suspicious custom header, preserving the traffic's resemblance to legitimate WebSocket usage.

::: info Modifying `ed`
Modifying `ed` to a value significantly different from 2560 risks header overflow (too large) or degraded performance (too small). Values within ±512 of the default are generally safe, but the default has been empirically validated as optimal for the Xray/sing-box cores used with these configurations.
:::

## Path-Embedded Early Data (Xray Optimization)

Group 3 (Harmonyᴱᴹˢ) demonstrates an alternative early data specification where the `ed` value is embedded directly in the **path** rather than as a standalone query parameter:

```javascript
path: "/random:14?ed=2048"
```

This pattern is specifically optimized for the **Xray core**, which reads early data configuration from the path's query string rather than from separate `ed`/`eh` parameters. The value `2048` (vs. the global `2560`) reflects Xray's internal buffer size for WebSocket early data — a smaller, core-specific limit that avoids buffer overflow in Xray's implementation while still providing meaningful early data capacity.

When this path is processed by `createVlessLink`, the `random:14` segment is replaced with 14 random characters (via Path Obfuscation), while the `?ed=2048` query string is preserved as-is in the final path, producing a URL like:

```text
vless://uuid@ip:443?path=/a7x9k2m4p1q8w3?ed=2048&...&ed=2560&eh=Sec-WebSocket-Protocol
```

::: info Cross-Compatibility
Note that this results in **two `ed` values** in the URL — one in the path (for Xray) and one as a query parameter (for sing-box). Clients parse whichever their core supports, making the configuration cross-compatible.
:::

## Combined Effect in the Generated VLESS URI

The `createVlessLink` function merges all anti-detection parameters into a single VLESS URI. Here is the exact parameter assembly order and how fingerprint and early data integrate with the broader configuration:

```mermaid
flowchart TD
    A[createVlessLink(ip, group, settings)] --> B[Select random port from group.ports]
    B --> C[Select random fingerprint from group.fp]
    C --> D[Process path: resolve random:N directive]
    D --> E[Build URLSearchParams]
    E --> F[Set: path, encryption, type=ws, host]
    F --> G[Set: fp = randomFp]
    G --> H[Set: ed = settings.ed (2560)]
    H --> I[Set: eh = settings.eh]
    I --> J{group.tls?}
    J -- Yes --> K[Set: security=tls, sni, alpn]
    J -- No --> L[Omit security & sni params]
    K --> M[Construct final VLESS URI]
    L --> M
```

Every parameter serves a distinct anti-detection role: `fp` masks the TLS fingerprint, `ed`/`eh` eliminate the handshake timing gap, and together they present a connection profile that is statistically indistinguishable from a normal browser WebSocket session to Cloudflare.

## Configuration Reference

| Parameter | Scope | Location | Type | Default | Anti-Detection Layer |
| --- | --- | --- | --- | --- | --- |
| `fp` | Per-group | Lines 62, 76, 90 | `string[]` | `["chrome"]` | TLS fingerprint emulation |
| `ed` | Global | Line 38 | `string` | `"2560"` | WebSocket timing optimization |
| `eh` | Global | Line 39 | `string` | `"Sec-WebSocket-Protocol"` | Early data carrier header |
| `?ed=N` in path | Per-group | Line 85 | Embedded | `2048` | Xray-specific early data |

<br/>

## Next Steps

The fingerprint and early data mechanisms work in concert with Harmony's other anti-detection features. To understand the full anti-detection pipeline:  

- **[SNI Case Randomization](./14-sni-case-randomization)** — How randomized SNI casing prevents domain-based blocking
- **[Path Obfuscation](./15-path-obfuscation)** — How random path segments prevent pattern-matching detection
- **[VLESS Link Builder](./11-vless-link-builder)** — The complete link generation pipeline that assembles all parameters