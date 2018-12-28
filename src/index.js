import 'webrtc-adapter';
import 'wired-button';
import 'wired-input';
import 'wired-listbox';
import 'wired-item';
import 'wired-card';
import 'wired-textarea';

let dataChannelSendBtn = document.querySelector('#data-channel-send');
let loginUsersBox = document.querySelector('#login-users');
let messageContainer = document.querySelector('#input-message');
let wsServer = 'ws://192.168.11.136:9501';
let webSocket = new WebSocket(wsServer);
let name = Math.random().toString(36).substr(2);
let video = document.querySelector('#video');

let localConnection = [];
let dataChannel; // todo：修改以适配多个连接
let remoteUser;
let offer = [];
let localStream;

// navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
//     console.log('get local camera')
//     video.style.display = 'block';
//     video.srcObject = stream;
//     localStream = stream;
// }).catch(err => {
//     console.log(err.toString());
// })

function createLocalConnection (remoteUser) {
    let channelLabel = name + "-" + remoteUser;
    let tmpConnection = new RTCPeerConnection(null, null);
    localConnection[remoteUser] = tmpConnection;
    dataChannel = tmpConnection.createDataChannel(channelLabel, null);

    tmpConnection.onicecandidate = (event) => {
        console.log('on ice candidate event');
        if (event.candidate) {
            webSocket.send(JSON.stringify({
                action: 'exchangeCandidate',
                content: {
                    candidate: event.candidate,
                    target: remoteUser,
                    from: name
                },
            }))
        }
    }

    tmpConnection.onconnectionstatechange = () => {
        switch(tmpConnection.connectionState) {
            case 'connected':
                console.log('rtc connected');
                break;
            case 'connecting':
                console.log('rtc connecting');
                break;
            case 'disconnected':
                console.log('rtc disconnected');
                tmpConnection.close();
                tmpConnection = null,
                dataChannel.close();
                dataChannel = null;
                delete localConnection[remoteUser];
                break;
            case 'failed':
                console.log('rtc connect failed');
                break;
            case 'new':
                console.log('rtc new');
                break;
            case 'closed':
                console.log('rtc connection');
                break;
            case 'checking':
                console.log('rtc checking');
                break;
        }
    }

    tmpConnection.ontrack = (event) => {
        console.log(event);
        console.log('ontrack');
        if (!video.srcObject) {
            video.srcObject = event.streams[0];
        }
    }

    tmpConnection.ondatachannel = (event) => {
        let channel = event.channel;
        channel.onopen = () => {
            console.log('channel open');
            messageContainer.disabled = false;
            dataChannelSendBtn.disabled = false;
        }
    
        channel.onmessage = (data) => {
            console.log('channel receive data')
            console.log(data);
        }
    
        channel.onclose = () => {
            console.log('channel close')
            messageContainer.disabled = true;
            dataChannelSendBtn.disabled = true;
        }
    
        channel.onerror = (error) => {
            console.log('channel error');
            console.log(error.toString());
        }
    }
}

dataChannelSendBtn.onclick = () => {
    let message = messageContainer.value;
    console.log(message);
    dataChannel.send(message);
}

webSocket.onopen = () => {
    console.log('connected to WebSocket server.');
    webSocket.send(JSON.stringify({
        action: "getOnlineUsers",
        content: "all"
    }));
    webSocket.send(JSON.stringify({
        action: 'login',
        content: name
    }))
};

webSocket.onclose = () => {
    console.log('disconnected');
};

webSocket.onmessage = (data) => {
    console.log('receive message');
    console.log(data);
    let message
    try {
        message = JSON.parse(data.data);
    } catch (error) {
        console.warn(error);
        return ;
    }
    if (message.action) {
        switch (message.action) {
            case 'exchangeDes':
                console.log('set remote description');
                if (localConnection[message.from] === null || localConnection[message.from] === undefined) {
                    createLocalConnection(message.from);
                }
                localConnection[message.from].setRemoteDescription(message.des);
                remoteUser = message.from;

                if (!offer[message.from]) {
                    localConnection[message.from].createAnswer().then((des) => {
                        console.log('answer set local description');
                        localConnection[message.from].setLocalDescription(des);
                        webSocket.send(JSON.stringify({
                            action: 'exchangeDes',
                            content: {
                                target: message.from,
                                des: des,
                                from: name
                            }
                        }))
                    })
                }

                break;
            case 'loginNotice':
                appendUser(message.content.name);
                break;
            case 'userOffline':
                let users = loginUsersBox.children;
                loginUsersBox.childElementCount
                for (let i = 0; i < loginUsersBox.childElementCount; i++) {
                    if (users[i].text == message.content) {
                        loginUsersBox.removeChild(users[i]);
                    }
                }
                break;
            case 'getOnlineUsers':
                message.content.forEach(element => {
                    appendUser(element);
                });
                break;
            case 'exchangeCandidate':
                console.log('exchange candidate');
                localConnection[message.from].addIceCandidate(
                    message.candidate
                ).then(() => {
                    console.log('addIceCandidate success');
                }, (err) => {
                    console.log('failed to add ice candidate:' + err.toString())
                })
                break;
        }
    }
};

webSocket.onerror = (err) => {
    console.log('error');
    console.log(err);
};

function appendUser(username) {
    let loginUser = document.createElement('wired-item');
    loginUser.text = username;
    loginUser.value = username;
    loginUser.onclick = () => {
        if (localConnection[username] === null || localConnection[username] === undefined) {
            createLocalConnection(username);
        }
        if (localStream) {
            localStream.getTracks().forEach(track => {
                localConnection[username].addTrack(track, localStream);
            })
        }
        localConnection[username].createOffer({offerToReceiveVideo: 1}).then((des) => {
            offer[username] = true;
            remoteUser = username;
            localConnection[username].setLocalDescription(des);
            webSocket.send(JSON.stringify({
                action: 'exchangeDes',
                content: {
                    target: username,
                    des: des,
                    from: name
                }
            }))
        })
    }
    loginUsersBox.appendChild(loginUser);
}
