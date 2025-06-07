import Gun from 'gun/gun';

const GUN_PEERS = (process.env.NEXT_PUBLIC_GUN_PEERS || '').split(',').map(url => url.trim()).filter(Boolean); 

const gun = Gun({
  peers: GUN_PEERS
});

gun.on('hi', peer => {
  console.log('Frontend connected to:', peer.url);
});

export default gun;
