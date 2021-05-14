import React from 'react';
import io from 'socket.io-client';
import { ReactMic } from 'react-mic';
import audioFile from './mpthreetest.mp3';

// const socket = io.connect("http://localhost:3001");
const socket = io.connect("http://192.168.1.101:1339");
const localAudio = new Audio();

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      role: "",
      playing: [],
      record: false,
      buffer: null
    }
    this.videoRef = React.createRef()
  };

  componentDidMount() {
    socket.on('play', (message) => { this.receiveMessage(message) });
    socket.on('stop', (message) => { this.stopAudio(message) });
    socket.on("videoStream", (data) => { this.receiveVideoStream(data) })
  }

  componentWillUnmount() {
    socket.off('play');
    socket.off('stop');
    localAudio.removeEventListener("ended", this.handleAudioStop());
  }

  receiveVideoStream(data) {
    // console.log(data);
    // this.setState({
    //   buffer: URL.createObjectURL(data)
    // })
    // this.videoRef.current.srcObject = data;
    const stream = new MediaStream()
    stream.addTrack(data)
    this.videoRef.current.srcObject = stream
    // this.setState(() => ({ stream }))
  }

  handlePlaySound(url) {
    socket.emit('play', { author: this.state.role, path: url });
  }

  receiveMessage(m) {
    console.log(`----------- receiveMessage() -----------`);
    console.log(m)
    if (m.author === this.state.role) {
      console.log(`this is my sound...`)
      localAudio.src = m.path;
      localAudio.play()
      localAudio.addEventListener("ended", () => { this.handleAudioStop() });
    } else {
      console.log(`not my sound...`)
      const audio = new Audio();
      audio.src = m.path;
      audio.play();
    }

    let newPlaying = this.state.playing;
    newPlaying.push(m.author);
    console.log(`new Array: ${newPlaying}`);
    this.setState({ playing: newPlaying });
  }

  stopAudio(m) {
    console.log(`----------- stopAudio() -----------`);
    console.log(m);
    let newPlaying = this.state.playing;
    newPlaying.splice(newPlaying.indexOf(m.author), 1);
    console.log(`removed ${m.author} from playing: ${newPlaying}`);
    this.setState({ playing: newPlaying });
  };

  handleAudioStop() {
    console.log("Audio ended")
    socket.emit('stop', { author: this.state.role });
  }

  startRecording = () => {
    this.setState({
      record: true
    });
  }

  stopRecording = () => {
    this.setState({
      record: false
    });
  }

  onData(recordedBlob) {
    console.log('chunk of real-time data is: ', recordedBlob);
    // socket.emit('play', { audioData: recordedBlob });
  }

  onStop(recordedBlob) {
    console.log('recordedBlob url is ', recordedBlob.blobURL);
    this.handlePlaySound(recordedBlob);
    // this.handlePlaySound(recordedBlob.blobURL);
  }

  render() {
    return (
      <div className="App">
        <h1>Stream POC</h1>
        <div>
          <input type="text" onChange={(e) => { this.setState({ role: e.target.value }) }} value={this.state.role} ></input>
        </div>
        <br />
        <div>
          <video ref={this.videoRef} />
        </div>
        <br />
        <div>
          <br />
          <h3 >Stream audio</h3>
          <ReactMic
            record={this.state.record}
            className="sound-wave"
            onStop={(data) => { this.onStop(data) }}
            onData={(data) => { this.onData(data) }}
            strokeColor="#000000"
            backgroundColor="#FF4081" />
        </div>
        <br />
        <div>
          <button onClick={() => { this.startRecording() }} type="button">Start</button>
          <button onClick={() => { this.stopRecording() }} type="button">Stop</button>
        </div>

        <div>
          {
            this.state.playing.map((sound) => {
              return (
                <h3 key={Math.random() * 100} >{sound}</h3>
              )
            })
          }
        </div>

      </div>
    )
  }
}