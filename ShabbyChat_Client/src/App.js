import React from 'react';
import logo from './logo.svg';
import './App.css';
import "../node_modules/video-react/dist/video-react.css";
import { Player } from 'video-react';
import Videochat from './webrtc';
import myVideo from './asserts/sintel.mp4';

//import axios from 'axios'

//local
/*
import socketIOClient from "socket.io-client";
const socket = socketIOClient('localhost:3003', {
    transports: ['websocket']
});
*/

//server
import { io } from "socket.io-client";
const socket = io.connect(); 

//server
//const api = axios.create();
 
/*
const api = axios.create({
    baseURL: 'http://localhost:3001',
})
*/   


// change code below this line
class App extends React.Component{
    constructor(props){
	super(props);
	this.state = {
	    input: '',
	    recvMessage: [{data:''}],
	    isSubmitted: false,
	    userID: '',
	    username: '',
	    videoTime: 0
	}
	
	this.changeCurrentTime = this.changeCurrentTime.bind(this);
	
	this.enterSubmit = this.enterSubmit.bind(this);
	this.submit = this.submit.bind(this);
	this.handleInputChange = this.handleInputChange.bind(this);
    }
    
    componentDidMount() {

	let userIDVal = localStorage.getItem('userID')
	let usernameVal = localStorage.getItem('username')
        let chat = document.getElementById('chat');

	if(!userIDVal){
 
	    socket.emit("CreateUser")
	    socket.on("SetUserData", userData => {
		this.setState({
		    username: userData.username,
		    userID: userData.userID
		})
		localStorage.setItem('userID', userData.userID)
		localStorage.setItem('username', userData.username)
            });
	}
	else{
	    this.setState({
                username: usernameVal,
                userID: userIDVal
             })

            socket.on("RetrieveVideoTime", (setTime) => {
	        console.log(setTime)
		const { player } = this.player.getState();
		this.player.seek(setTime);
	    }) 
	    
	    socket.on("RetrieveChatRoomData", (chatRoomData) => {	    
		console.log(chatRoomData)
		let ptag = document.createElement('p'); 
		ptag.innerHTML = chatRoomData;
		chat.appendChild(ptag);
		this.setState({
	            recvMessage: chatRoomData
		})
 	    
	    })
	}
    }

    handleStateChange(state) {
    // copy player state to this component's state
	this.setState({
	    player: state
	});
    }
    
    changeCurrentTime() {
	let seconds = document.getElementById("seconds").value;
	socket.emit("SetTime", {seconds});
 	//const { player } = this.player.getState();
	//this.player.seek(seconds);
    } 
    
    componentWillUnmount() {
	socket.off("SetUserData")
    }
    
    handleInputChange(e) {
	this.setState({
	    input: e.target.value,
	    isSubmitted: false
	});
    }

    enterSubmit(e){
	if(e.which === 13) {
	    this.submit();
	    this.setState({
		input: ''
            });
	};
 
    }
    
    submit(){
	this.setState({
	    isSubmitted:!this.state.isSubmitted
	}); 
	let data = this.state.userID+"->"+this.state.username+": "+this.state.input
	socket.emit("SendMessage", {data});
    }
     
    render(){
	const buttonOne = <button type="Submit" onClick={this.submit}>Submit</button>;
	const buttonTwo = <button onClick={this.submit}>Submitted</button>;

 
	return (
	    <div className="App">
		<ul>
		    <li><a href="#home">Home</a></li>
		    <li><a href="http://localhost:3001/api">API</a></li>
		    <li><a href="#contact">Contact</a></li>
		    <li><a href="#about">About</a></li>
		</ul>
		<header className="App-header">
		    <img src={logo} className="App-logo" alt="logo" />
		</header>
		
		<div className="App-body"> 
                     <div className="movie">
		        <div className="moviescreen">
		        <Player
	                ref={player => {
			    this.player = player;
			}}
                         fluid={false}
	       	       	width="100%"
                        height="100%"
	    //src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4"/>~
	    src = {myVideo}/>
		</div>
		
	        <input className="button-container" type="number" id="seconds"/>
                <button className="button-container" type="button" onClick={this.changeCurrentTime}>set seconds</button>
		
 	            </div>
		    <Videochat />
		    <div className="receive">
                        <p className="message">This is what you received</p>
                        <div className="chat-room" id="chat"></div>
                    </div>
		
		    <div className="send">
			<p className="message">Send your massage here!</p>
			<p className="message">user: {this.state.username}</p>
 		      
		        <textarea className="chat-window"
	                          id="inputtext"
	                          value={this.state.input}
	                          onKeyPress={this.enterSubmit}
				  onChange={this.handleInputChange} /><br />
			{ 
			    this.state.isSubmitted == false
				? buttonOne
				: this.state.isSubmitted == false
				? buttonOne
				: buttonTwo
			} 

	             </div>
		</div> 
	    </div>
	);
    } 
};


 
export default App;
