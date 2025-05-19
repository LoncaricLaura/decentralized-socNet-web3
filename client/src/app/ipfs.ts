const IPFS_API_URLS = (process.env.NEXT_PUBLIC_IPFS_API_URLS || '').split(',');
const IPFS_GATEWAYS = (process.env.NEXT_PUBLIC_IPFS_GATEWAYS || '').split(',');

function getRandomIpfsUrl() {
  return IPFS_API_URLS[Math.floor(Math.random() * IPFS_API_URLS.length)];
}

function getRandomGateway() {
  return IPFS_GATEWAYS[Math.floor(Math.random() * IPFS_GATEWAYS.length)];
}

let ipfsClient: any;

export async function getIpfsClient() {
  if (!ipfsClient) {
    const { create } = await import('ipfs-http-client');
    ipfsClient = create({ url: getRandomIpfsUrl() });
  }
  return ipfsClient;
}

export async function addFile(file: File): Promise<string> {
  try {
    const client = await getIpfsClient();
    const added = await client.add(file);
    return added.cid.toString();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function addJson(jsonData: object): Promise<string> {
  try {
    const client = await getIpfsClient();
    const added = await client.add(JSON.stringify(jsonData));
    return added.cid.toString();
  } catch (error) {
    console.error('Error uploading JSON:', error);
    throw error;
  }
}

export async function getFile(cid: string): Promise<Uint8Array> {
  try {
    const client = await getIpfsClient();
    const stream = client.cat(cid);
    const chunks: Uint8Array[] = [];

    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    return combined;
  } catch (error) {
    console.error('Error fetching file:', error);
    throw error;
  }
}

export function getIPFSUrl(cid?: string): string {
  if (!cid) return '/images/icon-profile.png';
  const index = cid.charCodeAt(0) % IPFS_GATEWAYS.length;
  return `${IPFS_GATEWAYS[index]}${cid}`;
}

export function getIPFSUrls(cids: string[]): string[] {
  return cids.map(cid => `${getRandomGateway()}${cid}`);
}

export async function removePinnedData(cid: string) {
  try {
    const client = await getIpfsClient();
    await client.pin.rm(cid);
    console.log("Unpinned CID:", cid);
  } catch (error) {
    console.error("Error unpinning data: ", error);
  }
}
