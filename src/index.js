import { connect } from "cloudflare:sockets";

/**
 * LAST UPDATE
 *  - Sat, 24 February 2026, 04:20 UTC.
 *    https://github.com/NiREvil/zizifn
 *
 * UUID
 *  - Generate your own uuid: https://www.uuidgenerator.net
 *  - Add multiple: comma-separated (uuid1, uuid2) - Line 30..
 *
 * PROXY IP LAND
 *  - An array of proxy addresses. You can add multiple proxies to the list.
 *    Example: ['proxy1.ir:8443', '1.1.1.1:443', 'proxy2.com:2053'], - Line 31.
 *  - Daily, tested proxy list:
 *    https://github.com/NiREvil/vless/blob/main/sub/ProxyIP.md
 *
 * SCAMALYTICS API
 *  - Default key is public, Line 33, 34, 45.
 *  - If you fork or expect heavy use, get your own free key:
 *    https://scamalytics.com/ip/api/enquiry?monthly_api_calls=5000
 *
 */
 
/** @type {ReturnType<typeof socks5AddressParser> | null} */
let parsedSocksCache = null;

const decodeSecure = (encoded) => atob(encoded);

const HTML_URL = "https://nirevil.github.io/zizifn/";

const Config = {
  userID: "bb813507-8ed8-40c0-9b64-3eba878349a2",
  proxyIPs: ["nima.nscl.ir:443"],
  scamalytics: {
    username: "nimasecure999",
    apiKey: "ce75d58f98849753077a270e6013a036d6f4a6c562fd74c960960ae7a7087b40",
    baseUrl: "https://api12.scamalytics.com/v3/",
  },
  socks5: {
    enabled: false,
    relayMode: false,
    address: "",
  },

  /**
   * @param {{ PROXYIP: string; UUID: any; SCAMALYTICS_USERNAME: any; SCAMALYTICS_API_KEY: any; SCAMALYTICS_BASEURL: any; SOCKS5: any; SOCKS5_RELAY: string; }} env
   */
  fromEnv(env) {
    const selectedProxyIP =
      env.PROXYIP || this.proxyIPs[Math.floor(Math.random() * this.proxyIPs.length)];
    const [proxyHost, proxyPort = "443"] = selectedProxyIP.split(":");

    return {
      userID: env.UUID || this.userID,
      proxyIP: proxyHost,
      proxyPort: proxyPort,
      proxyAddress: selectedProxyIP,
      scamalytics: {
        username: env.SCAMALYTICS_USERNAME || this.scamalytics.username,
        apiKey: env.SCAMALYTICS_API_KEY || this.scamalytics.apiKey,
        baseUrl: env.SCAMALYTICS_BASEURL || this.scamalytics.baseUrl,
      },
      socks5: {
        enabled: !!env.SOCKS5,
        relayMode: env.SOCKS5_RELAY === "true" || this.socks5.relayMode,
        address: env.SOCKS5 || this.socks5.address,
      },
    };
  },
};

/**
 * @param {URL | RequestInfo<unknown, CfProperties<unknown>>} url
 */
async function safeFetch(url, options = {}, timeout = 4000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

const CONST = {
  ED_PARAMS: { ed: 2560, eh: "Sec-WebSocket-Protocol" },
  AT_SYMBOL: "@",
  VLESS_PROTOCOL: decodeSecure("dmxlc3M="), // "vless"
  WS_READY_STATE_OPEN: 1,
  WS_READY_STATE_CLOSING: 2,
};

/**
 * Generates a random path string for WebSocket connection.
 * @param {number} length - Length of the random path part.
 * @param {string} [query] - Optional query string to append (e.g., 'ed=2048').
 * @returns {string} The generated path.
 */
function generateRandomPath(length = 28, query = "") {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `/${result}${query ? `?${query}` : ""}`;
}

const CORE_PRESETS = {
  // Xray cores – Dream
  xray: {
    tls: {
      path: () => generateRandomPath(12, "ed=2048"),
      security: "tls",
      fp: "chrome",
      alpn: "http/1.1",
      extra: {},
    },
    tcp: {
      path: () => generateRandomPath(12, "ed=2560"),
      security: "none",
      fp: "chrome",
      extra: {},
    },
  },
  // Singbox cores – Freedom
  sb: {
    tls: {
      path: () => generateRandomPath(18),
      security: "tls",
      fp: "chrome",
      alpn: "http/1.1",
      extra: CONST.ED_PARAMS,
    },
    tcp: {
      path: () => generateRandomPath(18),
      security: "none",
      fp: "chrome",
      extra: CONST.ED_PARAMS,
    },
  },
};

/**
 * @param {any} tag
 * @param {string} proto
 */
function makeName(tag, proto) {
  return `${tag}-${proto.toUpperCase()}`;
}

function createVlessLink({
  userID,
  address,
  port,
  host,
  path,
  security,
  sni,
  fp,
  alpn,
  extra = {},
  name,
}) {
  const params = new URLSearchParams({
    type: decodeSecure("d3M="), // "ws"
    host,
    path,
  });

  if (security) {
    params.set("security", security);
    if (security === "tls") params.set("allowInsecure", "1");
  }

  if (sni) params.set("sni", sni);
  if (fp) params.set("fp", fp);
  if (alpn) params.set("alpn", alpn);

  for (const [k, v] of Object.entries(extra)) params.set(k, v);

  return `${CONST.VLESS_PROTOCOL}://${userID}@${address}:${port}?${params.toString()}#${encodeURIComponent(name)}`;
}

function buildLink({ core, proto, userID, hostName, address, port, tag }) {
  const p = CORE_PRESETS[core][proto];
  return createVlessLink({
    userID,
    address,
    port,
    host: hostName,
    path: p.path(),
    security: p.security,
    sni: p.security === "tls" ? hostName : undefined,
    fp: p.fp,
    alpn: p.alpn,
    extra: p.extra,
    name: makeName(tag, proto),
  });
}

const pick = (/** @type {string | any[]} */ arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * @param {Request} request
 * @param {string} core
 * @param {any} userID
 * @param {string} hostName
 * @param {{ waitUntil: (arg0: Promise<void>) => void; }} ctx
 */
async function handleIpSubscription(request, core, userID, hostName, ctx) {
  const url = new URL(request.url);
  const subName = url.searchParams.get("name");

  /**
   * Cake Subscription usage details
   * - These values create fake usage statistics for subscription clients
   * - Customize these values to display desired traffic and expiry information
   */
  const CAKE_INFO = {
    total_TB: 380, // Total traffic quota in Terabytes
    base_GB: 42000, // Base usage that's always shown (in Gigabytes)
    daily_growth_GB: 250, // Daily traffic growth (in Gigabytes) - simulates gradual usage
    expire_date: "2028-4-20", // Subscription expiry date (YYYY-MM-DD)
  };

  // Domains behind Cloudflare, fixed in the subscription links, you can add as many as you want..
  const mainDomains = [
    hostName,
    "creativecommons.org",
    "2027.victoriacross.ir",
    "www.speedtest.net",
    "sky.rethinkdns.com",
    "chat.openai.com",
    "cfip.xxxxxxxx.tk",
    "go.inmobi.com",
    "singapore.com",
    "www.visa.com",
    "www.wto.org",
    "chatgpt.com",
    "yakamoz.nscl.ir",
    "nodejs.org",
    "zzula.ir",
    "csgo.com",
    "fbi.gov",
  ];

  const httpsPorts = [443, 8443, 2053, 2083, 2087, 2096]; // Standard cloudflare TLS/HTTPS ports.
  const httpPorts = [80, 8080, 8880, 2052, 2082, 2086, 2095]; // Standard cloudflare TCP/HTTP ports.
  let links = [];
  const isPagesDeployment = hostName.endsWith(".pages.dev");

  mainDomains.forEach((domain, i) => {
    links.push(
      buildLink({
        core,
        proto: "tls",
        userID,
        hostName,
        address: domain,
        port: pick(httpsPorts),
        tag: `Domain${i + 1}`,
      }),
    );
    if (!isPagesDeployment) {
      links.push(
        buildLink({
          core,
          proto: "tcp",
          userID,
          hostName,
          address: domain,
          port: pick(httpPorts),
          tag: `Domain${i + 1}`,
        }),
      );
    }
  });

  try {
    const cache = caches.default;
    const cacheKey = new Request("https://cf-ip-cache.local");

    let response = await cache.match(cacheKey);

    if (!response) {
      const r = await safeFetch(
        "https://raw.githubusercontent.com/NiREvil/vless/refs/heads/main/Cloudflare-IPs.json",
        {},
        4000,
      );
      if (r.ok) {
        response = new Response(await r.text(), {
          headers: {
            "Cache-Control": "public, max-age=86400",
          },
        });
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
      }
    }

    if (response) {
      const json = await response.json();
      const ips = [...(json.ipv4 || []), ...(json.ipv6 || [])].slice(0, 20).map((x) => x.ip);

      ips.forEach((ip, i) => {
        const formattedAddress = ip.includes(":") ? `[${ip}]` : ip;
        links.push(
          buildLink({
            core,
            proto: "tls",
            userID,
            hostName,
            address: formattedAddress,
            port: pick(httpsPorts),
            tag: `IP${i + 1}`,
          }),
        );
        if (!isPagesDeployment) {
          links.push(
            buildLink({
              core,
              proto: "tcp",
              userID,
              hostName,
              address: formattedAddress,
              port: pick(httpPorts),
              tag: `IP${i + 1}`,
            }),
          );
        }
      });
    }
  } catch (e) {
    console.error("Cached IP fetch failed", e);
  }

  // Creating cake information headers
  const GB_in_bytes = 1024 * 1024 * 1024;
  const TB_in_bytes = 1024 * GB_in_bytes;
  const total_bytes = CAKE_INFO.total_TB * TB_in_bytes;
  const base_bytes = CAKE_INFO.base_GB * GB_in_bytes;
  // Calculating "dynamic" consumption based on hours per day
  const now = new Date();
  const hours_passed = now.getHours() + now.getMinutes() / 60;
  const daily_growth_bytes = (hours_passed / 24) * (CAKE_INFO.daily_growth_GB * GB_in_bytes);
  // Splitting usage between upload and download
  const cake_download = base_bytes + daily_growth_bytes / 2;
  const cake_upload = base_bytes + daily_growth_bytes / 2;
  // Convert expiration date to Unix Timestamp
  const expire_timestamp = Math.floor(new Date(CAKE_INFO.expire_date).getTime() / 1000);
  const subInfo = `upload=${Math.round(cake_upload)}; download=${Math.round(cake_download)}; total=${total_bytes}; expire=${expire_timestamp}`;

  const headers = {
    "Content-Type": "text/plain;charset=utf-8",
    "Profile-Update-Interval": "6",
    "Subscription-Userinfo": subInfo,
  };

  if (subName) headers["Profile-Title"] = subName;
  return new Response(btoa(links.join("\n")), { headers });
}

/**
 * Core vless protocol logic
 * Handles VLESS protocol over WebSocket.
 * @param {Request} request
 * @param {object} config
 * @returns {Promise<Response>}
 */
async function ProtocolOverWSHandler(request, config) {
  const webSocketPair = new WebSocketPair();
  const [client, webSocket] = Object.values(webSocketPair);
  webSocket.accept();
  let address = "";
  let portWithRandomLog = "";
  let udpStreamWriter = null;
  const log = (info, event) => {
    console.log(`[${address}:${portWithRandomLog}] ${info}`, event || "");
  };
  const earlyDataHeader = request.headers.get("Sec-WebSocket-Protocol") || "";
  const readableWebSocketStream = MakeReadableWebSocketStream(webSocket, earlyDataHeader, log);
  let remoteSocketWapper = { value: null };

  readableWebSocketStream
    .pipeTo(
      new WritableStream({
        async write(chunk, controller) {
          if (udpStreamWriter) return udpStreamWriter.write(chunk);
          if (remoteSocketWapper.value) {
            const writer = remoteSocketWapper.value.writable.getWriter();
            await writer.write(chunk);
            writer.releaseLock();
            return;
          }

          const {
            hasError,
            message,
            addressType,
            portRemote = 443,
            addressRemote = "",
            rawDataIndex,
            ProtocolVersion = new Uint8Array([0, 0]),
            isUDP,
          } = ProcessProtocolHeader(chunk, config.userID);
          address = addressRemote;
          portWithRandomLog = `${portRemote}--${Math.random()} ${isUDP ? "udp" : "tcp"} `;

          if (hasError) throw new Error(message);

          const vlessResponseHeader = new Uint8Array([ProtocolVersion[0], 0]);
          const rawClientData = chunk.slice(rawDataIndex);

          if (isUDP) {
            if (portRemote === 53) {
              const dnsPipeline = await createDnsPipeline(webSocket, vlessResponseHeader, log);
              udpStreamWriter = dnsPipeline.write;
              udpStreamWriter(rawClientData);
            } else {
              throw new Error("UDP proxy is only enabled for DNS (port 53)");
            }
            return;
          }

          HandleTCPOutBound(
            remoteSocketWapper,
            addressType,
            addressRemote,
            portRemote,
            rawClientData,
            webSocket,
            vlessResponseHeader,
            log,
            config,
          );
        },
        close() {
          log(`readableWebSocketStream closed`);
        },
        abort(err) {
          log(`readableWebSocketStream aborted`, err);
        },
      }),
    )
    .catch((err) => {
      console.error("Pipeline failed:", err.stack || err);
    });

  return new Response(null, { status: 101, webSocket: client });
}

/**
 * @param {string} uuid
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Helper function to randomize uppercase and lowercase letters in a string
 * @param {string} str Input string (like SNI)
 * @returns {string} String with random characters
 */
function randomizeCase(str) {
  let result = "";
  // 50% chance of making a big deal out of it.
  for (let i = 0; i < str.length; i++)
    result += Math.random() < 0.5 ? str[i].toUpperCase() : str[i].toLowerCase();
  return result;
}

/**
 * Handles TCP outbound logic for VLESS.
 * @param {{ value: any; }} remoteSocket
 * @param {number} addressType
 * @param {string} addressRemote
 * @param {number} portRemote
 * @param {any} rawClientData
 * @param {WebSocket} webSocket
 * @param {Uint8Array} protocolResponseHeader
 * @param {{ (info: any, event: any): void; (arg0: string): void; }} log
 * @param {{ socks5Relay: any; parsedSocks5Address: any; enableSocks: any; proxyIP: any; proxyPort: any; userID?: string; socks5Address?: string; }} config
 */
async function HandleTCPOutBound(
  remoteSocket,
  addressType,
  addressRemote,
  portRemote,
  rawClientData,
  webSocket,
  protocolResponseHeader,
  log,
  config,
) {
  async function connectAndWrite(address, port, socks = false) {
    let tcpSocket;
    if (config.socks5Relay) {
      tcpSocket = await socks5Connect(addressType, address, port, log, config.parsedSocks5Address);
    } else {
      tcpSocket = socks
        ? await socks5Connect(addressType, address, port, log, config.parsedSocks5Address)
        : connect({ hostname: address, port: port });
    }
    remoteSocket.value = tcpSocket;
    log(`connected to ${address}:${port}`);
    const writer = tcpSocket.writable.getWriter();
    await writer.write(rawClientData);
    writer.releaseLock();
    return tcpSocket;
  }

  async function retry() {
    const tcpSocket = config.enableSocks
      ? await connectAndWrite(addressRemote, portRemote, true)
      : await connectAndWrite(
          config.proxyIP || addressRemote,
          config.proxyPort || portRemote,
          false,
        );

    tcpSocket.closed
      .catch((error) => console.log("retry tcpSocket closed error", error))
      .finally(() => safeCloseWebSocket(webSocket));
    RemoteSocketToWS(tcpSocket, webSocket, protocolResponseHeader, null, log);
  }

  const tcpSocket = await connectAndWrite(addressRemote, portRemote);
  RemoteSocketToWS(tcpSocket, webSocket, protocolResponseHeader, retry, log);
}

/**
 * Converts WebSocket messages to a readable stream.
 * @param {WebSocket} webSocketServer
 * @param {string} earlyDataHeader
 * @param {{ (info: any, event: any): void; (arg0: string): void; }} log
 */
function MakeReadableWebSocketStream(webSocketServer, earlyDataHeader, log) {
  return new ReadableStream({
    start(controller) {
      webSocketServer.addEventListener("message", (event) => controller.enqueue(event.data));
      webSocketServer.addEventListener("close", () => {
        safeCloseWebSocket(webSocketServer);
        controller.close();
      });
      webSocketServer.addEventListener("error", (err) => {
        log("webSocketServer has error");
        controller.error(err);
      });
      const { earlyData, error } = base64ToArrayBuffer(earlyDataHeader);
      if (error) controller.error(error);
      else if (earlyData) controller.enqueue(earlyData);
    },
    pull(_controller) {},
    cancel(reason) {
      log(`ReadableStream was canceled, due to ${reason}`);
      safeCloseWebSocket(webSocketServer);
    },
  });
}

function ProcessProtocolHeader(protocolBuffer, userID) {
  if (protocolBuffer.byteLength < 24) return { hasError: true, message: "invalid data" };
  const dataView = new DataView(protocolBuffer);
  const version = dataView.getUint8(0);
  const slicedBufferString = stringify(new Uint8Array(protocolBuffer.slice(1, 17)));
  const uuids = userID.split(",").map((id) => id.trim());
  if (!slicedBufferString) return { hasError: true, message: "invalid uuid format" };
  const isValidUser = uuids.some((uuid) => slicedBufferString === uuid);
  if (!isValidUser) return { hasError: true, message: "invalid user" };

  const optLength = dataView.getUint8(17);
  const command = dataView.getUint8(18 + optLength);
  if (command !== 1 && command !== 2)
    return { hasError: true, message: `command ${command} is not supported` };

  const portIndex = 18 + optLength + 1;
  const portRemote = dataView.getUint16(portIndex);
  const addressType = dataView.getUint8(portIndex + 2);
  let addressValue, addressLength, addressValueIndex;

  switch (addressType) {
    case 1: // IPv4
      addressLength = 4;
      addressValueIndex = portIndex + 3;
      addressValue = new Uint8Array(
        protocolBuffer.slice(addressValueIndex, addressValueIndex + addressLength),
      ).join(".");
      break;
    case 2: // Domain
      addressLength = dataView.getUint8(portIndex + 3);
      addressValueIndex = portIndex + 4;
      addressValue = new TextDecoder().decode(
        protocolBuffer.slice(addressValueIndex, addressValueIndex + addressLength),
      );
      break;
    case 3: // IPv6
      addressLength = 16;
      addressValueIndex = portIndex + 3;
      addressValue = Array.from({ length: 8 }, (_, i) =>
        dataView.getUint16(addressValueIndex + i * 2).toString(16),
      ).join(":");
      break;
    default:
      return { hasError: true, message: `invalid addressType: ${addressType}` };
  }

  if (!addressValue)
    return { hasError: true, message: `addressValue is empty, addressType is ${addressType}` };

  return {
    hasError: false,
    addressRemote: addressValue,
    addressType,
    portRemote,
    rawDataIndex: addressValueIndex + addressLength,
    ProtocolVersion: new Uint8Array([version]),
    isUDP: command === 2,
  };
}

/**
 * Pipes remote socket data to WebSocket.
 * @param {Socket} remoteSocket
 * @param {WebSocket} webSocket
 * @param {string | Uint8Array | ArrayBuffer | ArrayBufferView | Blob} protocolResponseHeader
 * @param {{ (): Promise<void>; (): any; }} retry
 * @param {{ (info: any, event: any): void; (arg0: string): void; (info: any, event: any): void; (arg0: string): void; (arg0: string): void; }} log
 */
async function RemoteSocketToWS(remoteSocket, webSocket, protocolResponseHeader, retry, log) {
  let hasIncomingData = false;
  try {
    await remoteSocket.readable.pipeTo(
      new WritableStream({
        async write(chunk) {
          if (webSocket.readyState !== CONST.WS_READY_STATE_OPEN)
            throw new Error("WebSocket is not open");
          hasIncomingData = true;
          const dataToSend = protocolResponseHeader
            ? await new Blob([protocolResponseHeader, chunk]).arrayBuffer()
            : chunk;
          webSocket.send(dataToSend);
          protocolResponseHeader = null;
        },
        close() {
          log(`Remote connection readable closed.`);
        },
        abort(reason) {
          console.error(`Remote connection readable aborted:`, reason);
        },
      }),
    );
  } catch (error) {
    console.error(`RemoteSocketToWS error:`, error.stack || error);
    safeCloseWebSocket(webSocket);
  }
  if (!hasIncomingData && retry) {
    log(`No incoming data, retrying`);
    await retry();
  }
}

/**
 * decodes base64 string to ArrayBuffer.
 * @param {string} base64Str
 */
function base64ToArrayBuffer(base64Str) {
  if (!base64Str) return { earlyData: null, error: null };
  try {
    const binaryStr = atob(base64Str.replace(/-/g, "+").replace(/_/g, "/"));
    const buffer = new ArrayBuffer(binaryStr.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binaryStr.length; i++) view[i] = binaryStr.charCodeAt(i);
    return { earlyData: buffer, error: null };
  } catch (error) {
    return { earlyData: null, error };
  }
}

/**
 * Safely closes a WebSocket connection.
 * @param {{ readyState: number; close: () => void; }} socket
 */
function safeCloseWebSocket(socket) {
  try {
    if (
      socket.readyState === CONST.WS_READY_STATE_OPEN ||
      socket.readyState === CONST.WS_READY_STATE_CLOSING
    )
      socket.close();
  } catch (error) {
    console.error("safeCloseWebSocket error:", error);
  }
}

const byteToHex = Array.from({ length: 256 }, (_, i) => (i + 0x100).toString(16).slice(1));

/*
 * @param {Uint8Array | (string | number)[]} arr
 */
function unsafeStringify(arr, offset = 0) {
  return (
    byteToHex[arr[offset]] +
    byteToHex[arr[offset + 1]] +
    byteToHex[arr[offset + 2]] +
    byteToHex[arr[offset + 3]] +
    "-" +
    byteToHex[arr[offset + 4]] +
    byteToHex[arr[offset + 5]] +
    "-" +
    byteToHex[arr[offset + 6]] +
    byteToHex[arr[offset + 7]] +
    "-" +
    byteToHex[arr[offset + 8]] +
    byteToHex[arr[offset + 9]] +
    "-" +
    byteToHex[arr[offset + 10]] +
    byteToHex[arr[offset + 11]] +
    byteToHex[arr[offset + 12]] +
    byteToHex[arr[offset + 13]] +
    byteToHex[arr[offset + 14]] +
    byteToHex[arr[offset + 15]]
  ).toLowerCase();
}

/*
 * @param {Uint8Array} arr
 */
function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset);
  return isValidUUID(uuid) ? uuid : "";
}

/**
 * DNS pipeline for UDP DNS requests, using DNS-over-HTTPS, (REvil Method).
 * @param {WebSocket} webSocket
 * @param {Uint8Array} vlessResponseHeader
 * @param {Function} log
 * @returns {Promise<{write: Function}>}
 */
async function createDnsPipeline(webSocket, vlessResponseHeader, log) {
  let isHeaderSent = false;
  const transformStream = new TransformStream({
    transform(chunk, controller) {
      // Parse UDP packets from VLESS framing
      for (let index = 0; index < chunk.byteLength; ) {
        const lengthBuffer = chunk.slice(index, index + 2);
        const udpPacketLength = new DataView(lengthBuffer).getUint16(0);
        const udpData = new Uint8Array(chunk.slice(index + 2, index + 2 + udpPacketLength));
        index = index + 2 + udpPacketLength;
        controller.enqueue(udpData);
      }
    },
  });

  transformStream.readable
    .pipeTo(
      new WritableStream({
        async write(chunk) {
          try {
            // Send DNS query using DoH
            const resp = await safeFetch(
              `https://1.1.1.1/dns-query`,
              {
                method: "POST",
                headers: { "content-type": "application/dns-message" },
                body: chunk,
              },
              3000,
            );
            const dnsQueryResult = await resp.arrayBuffer();
            const udpSize = dnsQueryResult.byteLength;
            const udpSizeBuffer = new Uint8Array([(udpSize >> 8) & 0xff, udpSize & 0xff]);

            if (webSocket.readyState === CONST.WS_READY_STATE_OPEN) {
              if (isHeaderSent) {
                webSocket.send(await new Blob([udpSizeBuffer, dnsQueryResult]).arrayBuffer());
              } else {
                webSocket.send(
                  await new Blob([
                    vlessResponseHeader,
                    udpSizeBuffer,
                    dnsQueryResult,
                  ]).arrayBuffer(),
                );
                isHeaderSent = true;
              }
            }
          } catch (error) {
            log("DNS query error: " + error);
          }
        },
      }),
    )
    .catch((e) => log("DNS stream error: " + e));

  const writer = transformStream.writable.getWriter();
  return {
    write: (/** @type {any} */ chunk) => writer.write(chunk),
  };
}

/**
 * SOCKS5 TCP connection logic.
 * @param {any} addressType
 * @param {string} addressRemote
 * @param {number} portRemote
 * @param {any} log
 * @param {{ username: any; password: any; hostname: any; port: any; }} parsedSocks5Addr
 */
async function socks5Connect(addressType, addressRemote, portRemote, log, parsedSocks5Addr) {
  const { username, password, hostname, port } = parsedSocks5Addr;
  const socket = connect({ hostname, port });
  const writer = socket.writable.getWriter();
  const reader = socket.readable.getReader();
  const encoder = new TextEncoder();

  await writer.write(new Uint8Array([5, 2, 0, 2]));
  let res = (await reader.read()).value;
  if (res[0] !== 0x05 || res[1] === 0xff) throw new Error("SOCKS5 server connection failed.");

  if (res[1] === 0x02) {
    if (!username || !password) throw new Error("SOCKS5 auth credentials not provided.");
    const authRequest = new Uint8Array([
      1,
      username.length,
      ...encoder.encode(username),
      password.length,
      ...encoder.encode(password),
    ]);
    await writer.write(authRequest);
    res = (await reader.read()).value;
    if (res[0] !== 0x01 || res[1] !== 0x00) throw new Error("SOCKS5 authentication failed.");
  }

  let DSTADDR;
  switch (addressType) {
    case 1:
      DSTADDR = new Uint8Array([1, ...addressRemote.split(".").map(Number)]);
      break;
    case 2:
      DSTADDR = new Uint8Array([3, addressRemote.length, ...encoder.encode(addressRemote)]);
      break;
    case 3:
      DSTADDR = new Uint8Array([
        4,
        ...addressRemote
          .split(":")
          .flatMap((x) => [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2), 16)]),
      ]);
      break;
    default:
      throw new Error(`Invalid addressType for SOCKS5: ${addressType}`);
  }

  const socksRequest = new Uint8Array([5, 1, 0, ...DSTADDR, portRemote >> 8, portRemote & 0xff]);

  await writer.write(socksRequest); // SOCKS5 greeting
  res = (await reader.read()).value;
  if (res[1] !== 0x00) throw new Error("Failed to open SOCKS5 connection.");

  writer.releaseLock();
  reader.releaseLock();
  return socket;
}

/**
 * Parses SOCKS5 address string.
 * @param {string} address
 * @returns {object}
 */
function socks5AddressParser(address) {
  try {
    const [authPart, hostPart] = address.includes("@") ? address.split("@") : [null, address];
    const [hostname, portStr] = hostPart.split(":");
    const port = parseInt(portStr, 10);
    if (!hostname || isNaN(port)) throw new Error();
    let username, password;
    if (authPart) {
      [username, password] = authPart.split(":");
      if (!username) throw new Error();
    }
    return { username, password, hostname, port };
  } catch {
    throw new Error("Invalid SOCKS5 address format.");
  }
}

async function handleScamalyticsLookup(request, config) {
  const url = new URL(request.url);
  const ipToLookup = url.searchParams.get("ip");
  if (!ipToLookup)
    return new Response(JSON.stringify({ error: "Missing IP" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });

  const { username, apiKey, baseUrl } = config.scamalytics;
  if (!username || !apiKey)
    return new Response(JSON.stringify({ error: "Scamalytics API not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

  const scamalyticsUrl = `${baseUrl}${username}/?key=${apiKey}&ip=${ipToLookup}`;
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });

  try {
    const scamalyticsResponse = await fetch(scamalyticsUrl);
    const responseBody = await scamalyticsResponse.json();
    return new Response(JSON.stringify(responseBody), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.toString() }), { status: 500, headers });
  }
}

async function handleConfigPage(userID, hostName, proxyAddress) {
  const dream = buildLink({
    core: "xray",
    proto: "tls",
    userID,
    hostName,
    address: hostName,
    port: 443,
    tag: `${hostName}-Xray`,
  });
  const freedom = buildLink({
    core: "sb",
    proto: "tls",
    userID,
    hostName,
    address: hostName,
    port: 443,
    tag: `${hostName}-Singbox`,
  });

  const encodedSubName = encodeURIComponent("INDEX");
  const subXrayUrl = `https://${hostName}/xray/${userID}?name=${encodedSubName}`;
  const subSbUrl = `https://${hostName}/sb/${userID}?name=${encodedSubName}`;

  try {
    const response = await safeFetch(HTML_URL);
    if (!response.ok) throw new Error(`Failed to load HTML from GitHub Pages: ${response.status}`);

    let finalHTML = await response.text();

    finalHTML = finalHTML
      .replace(/{{PROXY_ADDRESS}}/g, proxyAddress)
      .replace(/{{CONFIG_DREAM}}/g, dream)
      .replace(/{{CONFIG_FREEDOM}}/g, freedom)
      .replace(/{{URL_HIDDIFY}}/g, `hiddify://install-config?url=${encodeURIComponent(subXrayUrl)}`)
      .replace(
        /{{URL_V2RAYNG}}/g,
        `v2rayng://install-config?url=${encodeURIComponent(subXrayUrl)}#${encodedSubName}`,
      )
      .replace(
        /{{URL_CLASH}}/g,
        `clash://install-config?url=${encodeURIComponent(`https://revil-sub.pages.dev/sub/clash-meta?url=${subSbUrl}`)}`,
      )
      .replace(
        /{{URL_EXCLAVE}}/g,
        `sn://subscription?url=${encodeURIComponent(subSbUrl)}&name=${encodedSubName}`,
      );

    return new Response(finalHTML, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch (error) {
    return new Response(`Error rendering panel: ${error.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

export default {
  /**
   * @param {Request<any, CfProperties<any>>} request
   * @param {{ PROXYIP: string; UUID: any; SCAMALYTICS_USERNAME: any; SCAMALYTICS_API_KEY: any; SCAMALYTICS_BASEURL: any; SOCKS5: any; SOCKS5_RELAY: string; }} env
   * @param {any} ctx
   */
  async fetch(request, env, ctx) {
    try {
      const cfg = Config.fromEnv(env);
      const url = new URL(request.url);

      const upgradeHeader = request.headers.get("Upgrade");
      if (upgradeHeader && upgradeHeader.toLowerCase() === "websocket") {
        if (cfg.socks5.enabled && !parsedSocksCache) {
          parsedSocksCache = socks5AddressParser(cfg.socks5.address);
        }

        const requestConfig = {
          userID: cfg.userID,
          proxyIP: cfg.proxyIP,
          proxyPort: cfg.proxyPort,
          socks5Address: cfg.socks5.address,
          socks5Relay: cfg.socks5.relayMode,
          enableSocks: cfg.socks5.enabled,
          parsedSocks5Address: cfg.socks5.enabled ? parsedSocksCache : {},
        };
        return ProtocolOverWSHandler(request, requestConfig);
      }

      if (url.pathname === "/scamalytics-lookup") return handleScamalyticsLookup(request, cfg);
      if (url.pathname.startsWith(`/xray/${cfg.userID}`))
        return handleIpSubscription(request, "xray", cfg.userID, url.hostname, ctx);
      if (url.pathname.startsWith(`/sb/${cfg.userID}`))
        return handleIpSubscription(request, "sb", cfg.userID, url.hostname, ctx);
      if (url.pathname.startsWith(`/${cfg.userID}`))
        return handleConfigPage(cfg.userID, url.hostname, cfg.proxyAddress);

      return new Response(
        "UUID not found. Please set the UUID environment variable in the Cloudflare dashboard.",
        { status: 404 },
      );
    } catch (err) {
      return new Response(`Worker Logic Error: ${err.message}\n${err.stack}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  },
};
