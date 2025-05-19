import Gun from 'gun/gun';

const gun = Gun({
  peers: [
    'http://192.168.1.29:8765/gun', 
    'http://192.168.1.70:8765/gun', 
  ]
});

gun.on('hi', peer => {
  console.log('🌐 Frontend connected to:', peer.url);
});

export default gun;
