# Decentralized social network (Spark)

- **GUN.js** for decentralized data storage and real-time encrypted peer-to-peer messaging
- **IPFS & IPFS Cluster** for decentralized media and file storage
- **Smart Contracts (Solidity)** for user identity and token rewards
- **Next.js** frontend

## 🛠 Setup Instructions
- 2 IPFS Nodes (Kubo) connected via swarm
- 2 IPFS Cluster peers with shared secret for coordinated pinning
- 2 GUN relay peers (port 8765) using persistent LevelDB
- Frontend connects to both IPFS and GUN peers 

### 1. Prerequisites
- Node.js (v18+)
- MetaMask extension
- Two machines or VMs (PC1, PC2 for testing)

### 2. IPFS + IPFS Cluster (on both PCs)

#### Install and initialize:
```bash
# Install IPFS (Kubo)
wget https://dist.ipfs.io/go-ipfs/latest/go-ipfs.tar.gz
tar -xvzf go-ipfs.tar.gz
cd go-ipfs
sudo bash install.sh

# Initialize and run
ipfs init
ipfs daemon

# Install IPFS cluster service
wget https://dist.ipfs.tech/ipfs-cluster-service/v1.1.2/ipfs-cluster-service_v1.1.2_linux-amd64.tar.gz
tar -xvzf ipfs-cluster-service_v1.1.2_linux-amd64.tar.gz
cd ipfs-cluster-service
sudo bash install.sh

# Install IPFS Cluster CLI
wget https://dist.ipfs.tech/ipfs-cluster-ctl/v1.1.2/ipfs-cluster-ctl_v1.1.2_linux-amd64.tar.gz
tar -xvzf ipfs-cluster-ctl_v1.1.2_linux-amd64.tar.gz
cd ipfs-cluster-ctl
sudo bash install.sh

# Initialize and run
ipfs-cluster-service init
ipfs-cluster-service daemon
```
- Save and share the Cluster Secret Key between nodes
- Connect nodes with:
```bash
ipfs swarm connect /ip4/<OTHER-PC-IP>/tcp/4001/p2p/<Peer-ID>
```

- Confirm connections
```bash
ipfs swarm peers
ipfs-cluster-ctl peers ls
```

### 3. GUN Relay Server
- On each PC:
```bash
mkdir gun-peer
cd gun-peer
npm init -y
npm install gun level
```
- Create relay.js 

- Start relay:
```bash
GUN_DEBUG=true node relay.js
```

###  4. Smart Contracts
- Install and deploy (using Hardhat):
```bash
# Compile and deploy locally
npx hardhat compile
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```
- Add the deployed addresses and ABIs in Constants.js file
```bash
export const SPARKTOKEN_ADDRESS = '0xYourDeployedSparkTokenAddress';
export const SPARKTOKEN_ABI = sparkcoin.abi;

export const PROFILE_ADDRESS = '0xYourDeployedProfileAddress';
export const PROFILE_ABI = profile.abi;
```

### 5. Frontend setup
```bash
cd client
cp .env.example .env

# Add environment variables
NEXT_PUBLIC_IPFS_API_URLS=http://<PC1-IP>:5001,http://<PC2-IP>:5001
NEXT_PUBLIC_IPFS_GATEWAYS=https://<PC1-IP>:8080/ipfs/,http://<PC2-IP>:9090/ipfs/
NEXT_PUBLIC_GUN_PEERS=http://<PC1-IP>:8765/gun,http://<PC2-IP>:8765/gun

npm install
npm run dev
```

## Funtionalities
#### All interactions (posts, likes, comments, chat, etc.) are off-chain, stored in GUN.js and IPFS

- Login via Metamask
- Edit  profile (stored in Profile.sol smart contract)
- Create post
- Like post
- Comment post
- Hide/unhide posts on profile
- Send/accept friend requests
- View friends list
- Save posts
- peer-to-peer chat
    - GUN.js for real-time sync
    - SEA encryption for message privacy
    - IPFS for sharing files
- inbox list 
- rewards with SparkCoin (ERC-20 token)
    - for posting first post
    - getting more than 5 likes on a post
- tip other users

