const socket = io();
let peer;
let mediaConstraints = {
    video:true
}
let start = document.querySelector('.start');
start.addEventListener('click', async function(){
    start.disabled = true;
    peer = new RTCPeerConnection({'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }]});
    peer.onnegotiationneeded = handleNegotiationNeeded;
    peer.onicecandidate = handleICE;
    peer.ontrack = handleTrack;
    localStream1 = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    document.querySelector('.localStream').srcObject = localStream1;
    localStream1.getTracks().forEach(
        transceiver = track => peer.addTransceiver(track, {streams: [localStream1]})
      );
});

function handleTrack(event){
   document.querySelector('.remoteStream').srcObject = event.streams[0];
}
async function handleICE(event){
    if(event.candidate){
        socket.emit('newICE', {
            candidate:event.candidate,
            id:socket.id
        })
    }
}
async function handleNegotiationNeeded(){
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit('video-offer', {
        sdp:peer.localDescription,
        id:socket.id
    })
}
socket.on('video-offer', async function(data){
   if(socket.id !== data.id){
    peer = new RTCPeerConnection({'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }]});
    peer.onnegotiationneeded = handleNegotiationNeeded;
    peer.onicecandidate = handleICE;
    peer.ontrack = handleTrack;
    let sessionObject = new RTCSessionDescription(data.sdp);
    await peer.setRemoteDescription(sessionObject);
    localStream2 = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    document.querySelector('.localStream').srcObject = localStream2;
    localStream2.getTracks().forEach(
     transceiver = track => peer.addTransceiver(track, {streams: [localStream2]})
   );
   const answer = await peer.createAnswer();
   await peer.setLocalDescription(answer);
   socket.emit('video-answer', {
        sdp:peer.localDescription,
        id:socket.id
   })
   }  
})
socket.on('video-answer', async function(data){
    if(socket.id !== data.id){
        let session = new RTCSessionDescription(data.sdp);
        await peer.setRemoteDescription(session);
    }
});
socket.on('addICECandidate', async function(data){
    if(socket.id !== data.id){
        let candidate = new RTCIceCandidate(data.candidate);  
        await peer.addIceCandidate(candidate);
    }
})