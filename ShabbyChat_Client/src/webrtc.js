import React from 'react';
import adapter from 'webrtc-adapter';
import './App.css';
import { io } from "socket.io-client";
const socket = io.connect();
/*
import socketIOClient from "socket.io-client";
const socket = socketIOClient('localhost:3003', {
    transports: ['websocket']
});
*/
let localStream; 
let rtcPeerConnection;



const iceServers = { 
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
}
 

const constraints = window.constraints = {
    audio: true,
    video: true
};


class Videochat  extends React.Component{
    constructor(props){
	super(props);
	this.call = this.call.bind(this); 
	this.hangup = this.hangup.bind(this);
    }

    componentDidMount() {
	socket.on('start_call', async () => {
	    console.log('Socket event callback: start_call')
	    if (!localStream) {
		console.log('not ready yet');
		return;
            }
	    document.getElementById("local").muted = false;
	    rtcPeerConnection = new RTCPeerConnection(iceServers)
	    this.addLocalTracks(rtcPeerConnection)
	    rtcPeerConnection.ontrack = this.setRemoteStream
	    rtcPeerConnection.onicecandidate = this.sendIceCandidate
	    await this.createOffer(rtcPeerConnection)
	}) 
	    
	socket.on('webrtc_offer', async (event) => {
	    console.log('Socket event callback: webrtc_offer')
	    document.getElementById("local").muted = false;
	    rtcPeerConnection = new RTCPeerConnection(iceServers)
	    this.addLocalTracks(rtcPeerConnection)
	    rtcPeerConnection.ontrack = this.setRemoteStream
	    rtcPeerConnection.onicecandidate = this.sendIceCandidate
	    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
	    await this.createAnswer(rtcPeerConnection)
	})
 
	socket.on('webrtc_answer', (event) => {
	    console.log('Socket event callback: webrtc_answer') 
	    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
	    console.log(event);
	})  
	
	socket.on('webrtc_ice_candidate', (event) => {
	    console.log('Socket event callback: webrtc_ice_candidate')
	    var candidate = new RTCIceCandidate({
		sdpMLineIndex: event.label,
		candidate: event.candidate,
	    })
	    rtcPeerConnection.addIceCandidate(candidate)
	})
  
	
    }

    sendIceCandidate(event) {
	if (event.candidate) {
	    socket.emit('webrtc_ice_candidate', {
		label: event.candidate.sdpMLineIndex,
		candidate: event.candidate.candidate,
	    })
 	} }

     
    addLocalTracks(rtcPeerConnection) {
	console.log("addlocaltrack");
	console.log(localStream);
	localStream.getTracks().forEach((track) => {rtcPeerConnection.addTrack(track, localStream)});
    }
    
    async createOffer(rtcPeerConnection) {
	let sessionDescription
	try {
	    sessionDescription = await rtcPeerConnection.createOffer()
	    rtcPeerConnection.setLocalDescription(sessionDescription)
	} catch (error) {
	    console.error(error)
	}
	
	socket.emit('webrtc_offer', {
	    type: 'webrtc_offer',
	    sdp: sessionDescription,
	})
    }

    async createAnswer(rtcPeerConnection) {
	let sessionDescription
	try {
	    sessionDescription = await rtcPeerConnection.createAnswer()
	    rtcPeerConnection.setLocalDescription(sessionDescription)
	} catch (error) {
	    console.error(error)
	}
	 
	socket.emit('webrtc_answer', {
	    type: 'webrtc_answer',
	    sdp: sessionDescription,
	})
    }
    
    async setRemoteStream(event) {
	try{	    
	    document.getElementById("remote").srcObject = event.streams[0];
	} catch (error) {
            console.log(error);
        }	
    }

     
    async call() {
	try {
	    localStream = await navigator.mediaDevices.getUserMedia(constraints);
            const videoTracks = localStream.getVideoTracks();
	    document.getElementById("local").srcObject = localStream;
	    socket.emit('start_call')
	} catch (error) { 
	    console.log(error);
	}
	 
    }
    
         
    async hangup() {
	try{
	    localStream.getTracks().forEach(track => track.stop());
	    document.getElementById("remote").src = null;
	    console.log(localStream);
	}catch(error){
	    console.log(error);
	}
    }

         
    render(){
	return (
                <div className="videochat">
                <div><video id="local" autoPlay playsInline></video></div>
		<div><video id="remote" autoPlay playsInline></video></div>
                <button className="button-container" onClick={this.call}>Call</button>
		<button className="button-container" onClick={this.hangup}>Hang Up</button>
                </div>	    
	);
    }
};

export default Videochat;
