---
layout: doc
outline: deep
title: "SNI Case Randomization"
description: "SNI Case Randomization is an anti-detection technique built into Harmony that transforms the Server Name Indication (SNI) field in TLS handshakes by randomly permuting the character casing of each letter."
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

# SNI Case Randomization

SNI Case Randomization is an anti-detection technique built into Harmony that transforms the Server Name Indication (SNI) field in TLS handshakes by randomly permuting the character casing of each letter. Because DNS is case-insensitive and TLS SNI comparison on Cloudflare's edge treats mixed-case hostnames as equivalent to their lowercase originals, this mutation is **functionally transparent** to the proxy connection — yet it produces a distinct byte-level fingerprint on every subscription refresh, making it significantly harder for network-level censors to pattern-match or block the connection based on a static SNI string.

## How It Works

The feature operates through two coordinated elements: a per-group boolean toggle (`randomizeSni`) and the `randomizeCase()` utility function. When a VLESS link is being constructed for a TLS-enabled group, the builder checks the toggle. If `randomizeSni: true`, the original SNI string (derived from `group.sni` or falling back to `group.host`) is passed through `randomizeCase()`, which iterates over every character and independently flips each letter to uppercase or lowercase with equal probability (50/50). The resulting mixed-case string is then injected into the VLESS URL's `sni` query parameter. This happens **per-link, per-subscription-refresh** — meaning every config in every group gets an independently randomized SNI, and a fresh randomization occurs each time the client fetches the subscription.

## Configuration

The feature is controlled by the `randomizeSni` boolean property within each configuration group definition. It is **only meaningful for TLS-enabled groups** — non-TLS groups omit the SNI parameter entirely, so setting `randomizeSni: true` on a non-TLS group has no effect.

| Property | Type | Default | Applies To | Effect |
| --- | --- | --- | --- | --- |
| `randomizeSni` | `boolean` | `false` | TLS groups only | When `true`, randomizes character casing in the SNI field |

## Implementation Detail: The `randomizeCase` Function

The core algorithm is deliberately simple — a single pass through the input string where each character is independently and uniformly randomized between its uppercase and lowercase forms:

```javascript
function randomizeCase(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    // 50% chance to uppercase each character
    result += Math.random() < 0.5 ? str[i].toUpperCase() : str[i].toLowerCase();
  }
  return result;
}
```

This design has several intentional properties. **Non-alphabetic characters** (dots, hyphens, digits) pass through unchanged because `toUpperCase()` and `toLowerCase()` are no-ops on them. **Each character decision is independent** — there is no correlation between adjacent characters, maximizing entropy per position. **The probability is exactly 0.5** — this produces a uniform distribution over the 2ⁿ possible case permutations for an n-letter string, where n is the count of alphabetic characters.

## Entropy and Uniqueness Analysis

For a hostname like `index.harmonica01.workers.dev`, the alphabetic characters are `indexharmonicaworkersdev` — 22 letters. Each has 2 possible states (upper or lower), yielding **2²² ≈ 4.2 million** distinct SNI variants. Across 10 configs per group, the probability of any two sharing the same randomized SNI is approximately 10×9/(2×2²²) ≈ 1.1×10⁻⁵ — effectively zero. This per-refresh entropy means a censor observing the SNI field cannot build a stable signature for the connection pattern.

## Practical Effects and Limitations

::: danger `Why this works`
Deep Packet Inspection (DPI) systems often rely on exact or substring matching against the SNI plaintext in the TLS ClientHello. A randomized case variant like `InDeX.hArMoNiCa01.wOrKeRs.dEv` will not match a rule looking for `index.harmonica01.workers.dev`, even though both resolve identically at the DNS and TLS layers. This is because the SNI field in the TLS specification (RFC 6066) carries the hostname as a literal byte string — case mutations produce different bytes.
:::

::: info `Why it's safe`
Cloudflare's edge validates the SNI by matching it against registered hostnames in a **case-insensitive** manner, consistent with DNS case-insensitivity (RFC 4343). The mixed-case SNI will be accepted and routed correctly to your Worker.
:::

::: danger `Limitations to be aware of`
- **Not effective against domain-blocking censors** — A censor blocking all `*.workers.dev` will not be fooled by case randomization — the domain suffix is still present.
- **Not effective against protocol-aware DPI** — Advanced DPI that normalizes SNI casing before matching will see through this technique.
- **Non-TLS groups unaffected** — The `randomizeSni` flag is inert for non-TLS groups because no SNI field exists in the connection.
- **Client support** — The VLESS client must honor the mixed-case SNI from the subscription link. Most mainstream clients (v2rayN, NekoBox, Clash Meta) do this correctly.
:::

## Enabling or Disabling Per Group

To toggle the feature, edit the `randomizeSni` property in the desired group within `USER_SETTINGS.groups`:

::: info NOTE

**Enable on a TLS group**  

```javascript
{
  name: "Harmonyᵀᴸˢ",
  host: "index.harmonica01.workers.dev",
  sni: "index.harmonica01.workers.dev",
  tls: true,
  randomizeSni: true,  // ← set to true
  // ... other settings
}
```

**Disable on a TLS group**

```javascript
{
  name: "Harmonyᵀᴸˢ",
  host: "index.harmonica01.workers.dev",
  sni: "index.harmonica01.workers.dev",
  tls: true,
  randomizeSni: false,  // ← set to false (SNI stays lowercase)
  // ... other settings
}
```

:::

After modifying the setting, redeploy the Worker for the change to take effect. Existing subscription links in clients will reflect the new behavior on the next subscription refresh.

## 💠 Next Steps

With SNI case randomization understood, you can explore the other anti-detection mechanisms that work alongside it:  

- **[Path Obfuscation](./15-path-obfuscation.md)** — Randomizes the WebSocket path in each generated config, providing a second layer of variability in the connection signature.  
- **[Fingerprint and Early Data](./16-fingerprint-and-early-data.md)** — Controls the TLS client fingerprint (`fp`) and early data parameters (`ed`/`eh`) that shape how the connection appears to middleboxes.  