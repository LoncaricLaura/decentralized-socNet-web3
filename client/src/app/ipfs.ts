import { create } from 'ipfs-http-client';

const ipfsClient = create({ url: "http://localhost:5001" });

export async function addFile(file: File): Promise<string> {
  try {
    const added = await ipfsClient.add(file);
    return added.cid.toString();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function addJson(jsonData: object): Promise<string> {
  try {
    const added = await ipfsClient.add(JSON.stringify(jsonData));
    return added.cid.toString();
  } catch (error) {
    console.error('Error uploading JSON:', error);
    throw error;
  }
}

export async function getFile(cid: string): Promise<Uint8Array> {
  try {
    const stream = ipfsClient.cat(cid);
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

export function getIPFSUrl(cid: string): string {
  return `http://localhost:8080/ipfs/${cid}`;
}

export function getIPFSUrls(cids: string[]): string[] {
  return cids.map(cid => `http://localhost:8080/ipfs/${cid}`);
}

export async function removePinnedData(cid: string) {
  try {
    await ipfsClient.pin.rm(cid);
    console.log("Unpinned CID:", cid);
  } catch (error) {
    console.error("Error unpinning data: ", error);
  }
}