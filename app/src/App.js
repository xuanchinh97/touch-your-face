import React, { useEffect, useRef } from 'react';
import './App.css';
import { Howl } from 'howler';
import sourdURL from './assets/botayxuongbanoi.mp3'
// const mobilenet = require('@tensorflow-models/mobilenet');
// const knnClassifier = require('@tensorflow-models/knn-classifier');

var sound = new Howl({
  src: [sourdURL]
});

sound.play();

function App() {
  const video = useRef();

  const init = async () => {
    console.log('init...');
    await setupCamera();
  }

  const setupCamera = () => {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia = navigator.getUserMedia || navigator.webketGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

      if (navigator.getUserMedia) {
        navigator.getUserMedia({
          video: true
        }, stream => {
          video.current.srcObject = stream;
          video.current.addEventListener('loadeddata', resolve)
        }, error => reject(error))
      } else {
        reject();
      }
    })
  }

  useEffect(() => {
    init();


    // cleanup
    return () => {

    }
  }, [])


  return (
    <div className="app">
      <video
        ref={video}
        className="video"
        autoPlay
      />
      <div className="control">
        <button className="btn">Train 1</button>
        <button className="btn">Train 2</button>
        <button className="btn">Run</button>
      </div>
    </div>
  );
}

export default App;
