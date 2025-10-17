/**
 * Last update: Tuesday, 31 December 2024, 11:59 PM
 * - The code dynamically creates VLESS configuration with clean IPs and returns subscription link in a base64 encoded format .
 * - Replace these lines with your uuid and hostname, UUID in line (12) - Hostname in lines (928), (953) and (981) and also SNI in (931), (956) and (984) . Tamam ;)
 * We are all REvil
 */

const defaultConfigvless = {
  v: '2',
  ps: '',
  port: '443',
  id: 'B686E42E-3EB4-4AB5-8354-32D7AFA5F541', // Specify the UUID of your VLESS configuration.
  aid: '0',
  net: 'ws',
  type: 'none',
  host: '',
  tls: 'tls',
  sni: '',
  ed: '2560', // Max Early Data, Default set is "2048"
  eh: 'Sec-WebSocket-Protocol', // Early Data Header Name
};

const fp = ['randomized', 'firefox', 'chrome', 'safari', 'randomized', 'firefox', 'chrome', 'ios']; // Preferred fingeprints, is better to use chrome, firefox, safari.

const port = ['8443', '2053']; // Preferred TLS Ports for 1st configs ex: ['443', '8443', '2053', '2083', '2087', '2096'];

const IP1 = [
  '141.101.120.187',
  '198.41.209.210',
  '172.64.95.71',
  '141.101.120.246',
  '198.41.209.120',
  '104.17.166.122',
  '104.18.69.233',
  '104.16.101.86',
  '104.18.111.51',
  '104.19.62.62',
  '162.159.128.242',
  '172.67.95.79',
  '172.67.147.96',
  '172.67.68.78',
  '141.101.114.156',
  '172.64.87.213',
  '104.18.149.118',
  '198.41.222.205',
  '104.16.142.201',
  '104.18.198.8',
  '104.17.40.88',
  '172.67.213.29',
  '172.67.118.230',
  '172.67.143.45',
  '172.64.84.254',
  '172.64.95.154',
  '198.41.208.9',
  '198.41.209.180',
  '172.64.88.85',
  '162.159.251.118',
  '198.41.208.231',
  '104.18.67.197',
  '104.19.119.159',
  '104.17.232.95',
  '104.18.97.99',
  '104.16.2.214',
  '172.67.136.223',
  '172.67.218.87',
  '172.67.160.139',
  '172.67.77.89',
  '172.64.94.220',
  '198.41.209.202',
  '104.17.198.92',
  '104.18.150.71',
  '104.19.194.247',
  '104.16.216.245',
  '104.19.10.166',
  '162.159.160.207',
  '172.67.77.71',
  '172.67.242.60',
  '172.67.159.73',
  '172.64.91.10',
  '198.41.209.149',
  '198.41.209.71',
  '198.41.208.119',
  '162.159.46.91',
  '198.41.223.141',
  '104.19.76.235',
  '104.17.51.67',
  '162.159.236.238',
  '190.93.244.160',
  '172.67.233.243',
  '172.67.156.199',
  '162.159.136.4',
  '172.67.85.5',
  '172.64.80.0',
  '104.16.10.137',
  '104.19.37.137',
  '104.17.30.128',
  '104.19.202.206',
  '172.67.230.25',
  '172.67.100.38',
  '162.159.253.29',
  '172.67.177.195',
  '162.159.153.219',
  '104.18.240.250',
  '162.159.46.235',
  '104.16.220.241',
  '104.17.44.95',
  '104.17.62.168',
  '172.67.104.222',
  '172.67.107.11',
  '172.67.129.49',
  '172.67.96.109',
  '172.67.152.198',
  '104.19.123.25',
  '104.19.59.13',
  '104.19.150.205',
  '104.16.70.248',
  '104.19.160.88',
  '172.67.112.255',
  '172.67.83.17',
  '172.67.107.239',
  '162.159.192.61',
  '172.67.75.253',
  '198.41.208.202',
  '198.41.209.100',
  '104.17.89.249',
  '104.18.252.190',
  '172.64.80.139',
  '104.16.107.178',
  '104.19.47.115',
  '172.67.81.232',
  '172.67.101.45',
  '172.67.84.9',
  '172.67.104.160',
  '172.67.80.46',
  '198.41.208.133',
  '162.159.251.118',
  '162.159.248.151',
  '162.159.241.246',
  '198.41.208.155',
  '104.17.166.89',
  '104.16.101.86',
  '104.17.83.101',
  '104.18.94.92',
  '104.18.92.16',
  '172.67.111.151',
  '162.159.240.58',
  '172.67.140.210',
  '172.67.204.218',
  '141.101.120.173',
  '198.41.209.149',
  '198.41.209.202',
  '198.41.209.100',
  '198.41.208.133',
  '162.159.241.246',
  '104.18.97.145',
  '104.17.187.58',
  '104.16.190.213',
  '198.41.211.223',
  '104.18.13.44',
  '172.67.179.77',
  '172.67.165.145',
  '172.64.72.202',
  '172.67.230.145',
  '141.101.115.151',
  '141.101.121.104',
  '172.64.89.84',
  '198.41.208.186',
  '198.41.209.192',
  '104.19.104.246',
  '141.101.120.147',
  '104.17.218.30',
  '104.19.10.163',
  '198.41.208.176',
  '104.18.202.108',
  '162.159.134.101',
  '172.67.250.209',
  '172.67.207.35',
  '172.64.100.216',
  '172.67.219.103',
  '198.41.208.176',
  '198.41.209.0',
  '172.64.94.9',
  '162.159.248.151',
  '141.101.115.46',
  '104.17.158.150',
  '172.67.134.226',
  '141.101.121.104',
  '172.64.89.84',
  '198.41.208.186',
  '198.41.209.192',
  '104.19.104.246',
  '141.101.120.147',
  '104.17.218.30',
  '104.19.10.163',
  '198.41.208.176',
  '104.18.202.108',
  '162.159.134.101',
  '172.67.250.209',
  '172.67.207.35',
  '172.64.100.216',
  '172.67.219.103',
  '198.41.208.176',
  '198.41.209.0',
  '172.64.94.9',
  '162.159.248.151',
  '141.101.115.46',
  '104.17.158.150',
  '172.67.134.226',
  '104.16.126.178',
  '162.159.255.101',
  '104.24.177.69',
  '172.67.164.46',
  '172.67.132.179',
  '162.159.237.238',
  '172.67.146.28',
  '172.67.116.63',
];

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const configsList = [];

  const shuffledVLESS = shuffleArray(Array.from(new Set(IP1)));
  const ipv4urlRE1 =
    'https://raw.githubusercontent.com/NiREvil/Harmony/refs/heads/main/cf-clean.json'; // 2nd source of Cloudflare clean IP addresses.
  const ipv4urlRE2 = 'https://strawberry.victoriacross.ir'; // 3rd source of Cloudflare clean IP addresses.

  const [ipv4listRE1, ipv4listRE2] = await Promise.all([fetch(ipv4urlRE1), fetch(ipv4urlRE2)]);

  const ipListDataRE1 = await ipv4listRE1.json();
  const ipListDataRE2 = await ipv4listRE2.json();

  const ipv4ListRE1 = ipListDataRE1.ipv4 || [];
  const ipv4ListRE2 = ipListDataRE2.data.map(item => item.ipv4) || [];

  const ipListRE1 = ipv4ListRE1.map(ipData => ipData.ip);
  const ipListRE2 = ipv4ListRE2.filter(ip => ip);

  const shuffledIPListRE1 = shuffleArray(ipListRE1);
  const shuffledIPListRE2 = shuffleArray(ipListRE2);

  for (let i = 0; i < 10; i++) {
    const randomport = port[Math.floor(Math.random() * port.length)];
    const randomfp = fp[Math.floor(Math.random() * fp.length)];
    const ip = shuffledVLESS.shift();

    const randomPath = generateRandomPath();
    const config = {
      ...defaultConfigvless,
      add: ip,
      ps: 'HARMONY-1', // Specify the 1st set configs name
      port: randomport,
      path: randomPath,
    };
    const queryParams = new URLSearchParams({
      path: randomPath,
      security: config.tls,
      encryption: config.type,
      alpn: 'h3', // Preferred alpn type
      host: 'your-vless.pages.dev', // Set your hostname here -1
      fp: randomfp,
      type: config.net,
      sni: 'YOUR-VlESS.PAGES.DEV', // Set your SNI here -1
      ed: config.ed, // Add ed parameter
      eh: config.eh, // Add eh parameter
    });
    const vlessUrl = `vless://${config.id}@${config.add}:${config.port}?${queryParams.toString()}#${config.ps}`;
    configsList.push(vlessUrl);
  }

  const uniqueIPsRE1 = new Set();
  for (const ip of shuffledIPListRE1) {
    if (uniqueIPsRE1.size >= 10) break;
    const randomfp = fp[Math.floor(Math.random() * fp.length)];
    const randomPath = generateRandomPath();
    const config = {
      ...defaultConfigvless,
      add: ip,
      ps: 'HARMONY-2', // Specify the 2nd set configs name
      path: randomPath,
    };
    const queryParams = new URLSearchParams({
      path: randomPath,
      security: config.tls,
      encryption: config.type,
      alpn: 'http/1.1', // Preferred alpn type
      host: 'your-vless.pages.dev', // Set your hostname here -2
      fp: randomfp,
      type: config.net,
      sni: 'YOUR-VlESS.PAGES.DEV', // Set your SNI here -2
      ed: config.ed,
      eh: config.eh,
    });
    const vlessUrl = `vless://${config.id}@${config.add}:${config.port}?${queryParams.toString()}#${config.ps}`;
    if (!uniqueIPsRE1.has(ip)) {
      configsList.push(vlessUrl);
      uniqueIPsRE1.add(ip);
    }
  }

  const uniqueIPsRE2 = new Set();
  for (const ip of shuffledIPListRE2) {
    if (uniqueIPsRE2.size >= 10) break;
    const randomfp = fp[Math.floor(Math.random() * fp.length)];
    const randomPath = generateRandomPath();
    const config = {
      ...defaultConfigvless,
      add: ip,
      ps: 'HARMONY-3', // Specify the 3rd set configs name
      path: randomPath,
    };
    const queryParams = new URLSearchParams({
      path: randomPath,
      security: config.tls,
      encryption: config.type,
      alpn: 'http/1.1', // Preferred alpn type
      host: 'your-vless.pages.dev', // Set your hostname here -3
      fp: randomfp,
      type: config.net,
      sni: 'YOUR-VlESS.PAGES.DEV', // Set your SNI here -3
      ed: config.ed,
      eh: config.eh,
    });
    const vlessUrl = `vless://${config.id}@${config.add}:${config.port}?${queryParams.toString()}#${config.ps}`;
    if (!uniqueIPsRE2.has(ip)) {
      configsList.push(vlessUrl);
      uniqueIPsRE2.add(ip);
    }
  }

  return new Response(btoa(configsList.join('\n')), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

function generateRandomPath() {
  let result = '/';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function shuffleArray(array) {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
