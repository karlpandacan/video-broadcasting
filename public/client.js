const Peer = require('simple-peer')
const wrtc = require('wrtc')
const socket = io();
const params = new URLSearchParams(window.location.search)
const uniqueKey = params.get('key')
const isInit = params.has('init')

let client = {};
const messsage = document.getElementById("message"),
    handle = document.getElementById("handle"),
    output = document.getElementById("output"),
    typing = document.getElementById("typing"),
    button = document.getElementById("button");

/** Chat using Socket.io (Working) */
message.addEventListener('keypress', () => {
    socket.emit('userTyping', handle.value)
});

button.addEventListener('click', () => {
    socket.emit('userMessage', {
        handle: handle.value,
        message: message.value
    })
    message.value = "";

});

socket.on('userMessage', (data) => {
    typing.innerHTML = "";
    output.innerHTML += '<p><strong>' + data.handle + ' : </strong>' + data.message + '</p>';
});

socket.on('userTyping', (data) => {
    typing.innerHTML = '<p><em>' + (data || 'Someone') + ' is typing... </em></p>';
});
/** END Chat */

/** SIMPLE-PEER (FOR VIDEO CALL/BROADCASTING) */
function createVideo(stream, elemId) {
    let video = document.getElementById(elemId);
    video.srcObject = stream;
    // window.peer_stream = stream;
}
/** END SIMPLE PEER */
document.getElementById("stream").addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            window.localStream = stream;
            // Display own Video
            let video = document.getElementById('lVideo');
            video.srcObject = stream;

            // Socket IO send
            broadcaster = new Peer({
                initiator: true,
                stream: stream,
                wrtc: wrtc
            });

            broadcaster.on('signal', data => {
                socket.emit('signal', data)
            });

            socket.on('startConnection', () => {
                if (broadcaster) {
                    broadcaster.destroy()
                }
                broadcaster = new Peer({
                    initiator: true,
                    stream: stream,
                    wrtc: wrtc
                });
                broadcaster.on('signal', data => {
                    socket.emit('signal', data);
                });
            });

            socket.on('signal', data => {
                broadcaster.signal(data);
            });

        }).catch(err => {
            console.log(err);
            alert('Cannot Access Audio/Camera.')
        });
});

document.getElementById('receive').addEventListener('click', function () {
    console.log('Connecting to Stream.')
    var socketId = socket.io.engine.id;
    var attendee = new Object;
    // socket.emit('NewClientReceiver')
    attendee[socketId] = new Peer();

    attendee[socketId].on('signal', data => {
        socket.emit('signal', data);
    });

    socket.on('signal', data => {
        attendee[socketId].signal(data)
    });

    attendee[socketId].on('stream', stream => {
        let video = document.getElementById('rVideo');
        video.srcObject = stream;
    });

    // Ask broadcaster to start his connection
    socket.emit("startConnection")

    attendee[socketId].on('error', (err) => {
        console.log('error');
        alert('Something Went Wrong.')
    });

    // client.peer = peer;
});
/**
// PEERJS TESTINg Working in 1 on 1

function getLocalVideo(callbacks) {
    let constraints = {
        video: true,
        audio: true
    }

    navigator.mediaDevices.getUserMedia(constraints).then(callbacks.success).catch(callbacks.error)
}

function recStream(stream, elemid) {
    let video = document.getElementById(elemid);
    video.srcObject = stream;
    window.peer_stream = stream;
}

if (isInit) {
    getLocalVideo({
        success: (stream) => {
            window.localstream = stream;
            recStream(stream, 'lVideo')
        },
        error: (err) => {
            alert('Cannot Access Camera');
            console.log(err);
        }
    });
}

var conn;
var peer_id;


var peer = new Peer(uniqueKey);

peer.on('open', () => {
    document.getElementById("displayId").innerHTML = peer.id
});

peer.on('connection', (connection) => {
    conn = connection;
    peer_id = connection.peer;

    document.getElementById('connId').value = peer
});

peer.on('error', function (err) {
    console.log(err)
    alert('an error happend')
})

document.getElementById("conn_btn").addEventListener('click', () => {
    peer_id = document.getElementById("connId").value;
    if (peer_id) {
        conn = peer.connect(peer_id)
    } else {
        alert('Enter ID')
    }
});

peer.on('call', function (call) {
    // optional accept
    // var acceptCall = confirm("Do you want to answer this call.");
    // if (acceptCall) {
    call.answer(window.localstream);

    call.on('stream', function (stream) {
        window.peer_stream = stream;
        recStream(stream, 'rVideo');
    });

    call.on('close', () => {

    })
    // } else {
    // console.log('Call Denied.')
    // }
});

// Ask to Call
document.getElementById("call_btn").addEventListener('click', () => {
    console.log("Calling a peer: " + peer_id);
    console.log(peer);

    if (window.localstream) {
        var call = peer.call(peer_id, window.localstream);
    } else {
        var call = peer.call(peer_id, new webkitMediaStream())
    }

    call.on('stream', stream => {
        window.peer_id_stream = stream;
        console.log('success')
        recStream(stream, 'rVideo');
    })
});

document.getElementById("combo_btn").addEventListener('click', () => {
    console.log("Calling a peer: " + peer_id);
    console.log(peer);

    peer_id = document.getElementById("connId").value;
    if (peer_id) {
        conn = peer.connect(peer_id)
    } else {
        alert('Enter ID')
    }

    if (window.localstream) {
        var call = peer.call(peer_id, window.localstream);
    } else {
        var call = peer.call(peer_id, new webkitMediaStream())
    }

    call.on('stream', stream => {
        window.peer_id_stream = stream;

        recStream(stream, 'rVideo');
    })
});
*/