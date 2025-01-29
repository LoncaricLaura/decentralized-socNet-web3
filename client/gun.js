import Gun from 'gun';

const gun = Gun({
    peers: [process.env.GUN_PEER_URL],
});

export default gun;
