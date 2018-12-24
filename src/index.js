import 'webrtc-adapter';
import 'wired-button';
import 'wired-input';
import 'wired-listbox';
import 'wired-item';
import 'wired-card';
import 'wired-textarea';

let dataChannelSendBtn = document.querySelector('#data-channel-send');
let callBtn = document.querySelector('#call-btn');
let loginUsersBox = document.querySelector('#login-users');
const wsServer = 'ws://192.168.11.136:9501';
let webSocket = new WebSocket(wsServer);

dataChannelSendBtn.onclick = () => {

}

webSocket.onopen = () => {
    console.log('connected to WebSocket server.');
    webSocket.send(JSON.stringify({
        action: "getOnlineUsers",
        content: "all"
    }));
    dataChannelSendBtn.disabled = false;
};

webSocket.onclose = () => {
    console.log('disconnected');
};

webSocket.onmessage = (data) => {
    console.log('receive message');
    console.log(data);
    let message = JSON.parse(data.data);

    if (message.action) {
        switch (message.action) {
            case 'exchangeDes':
                console.log('set remote description');
                localConnection.setRemoteDescription(message.des);
                break;
            case 'loginNotice':
                
        }

    }
    if (message.action && message.action === 'exchangeDes') {
        console.log('set remote description');
        localConnection.setRemoteDescription(message.des);
    }
};

webSocket.onerror = (err) => {
    console.log('error');
    console.log(err);
};
