import React, { useEffect, useRef, useState } from 'react';
import '@tensorflow/tfjs-backend-cpu';
import * as mobilenet from '@tensorflow-models/mobilenet'
import * as knnClassifier from '@tensorflow-models/knn-classifier'
import { initNotifications, notify } from '@mycv/f8-notification';
import sourdURL from './assets/hey_sondn.mp3'
import * as tf from '@tensorflow/tfjs'
import { Howl } from 'howler';
import './App.css';

var sound = new Howl({
  src: [sourdURL]
});


const NOT_TOUCH_LABEL = 'not_touch'
const TOUCHED_LABEL = 'touched'
const TRAINING_TIMES = 50
const TOUCHED_CONFIDENCE = 0.8

function App() {
  const video = useRef();
  const model = useRef();
  const classifier = useRef();
  const canPlaySound = useRef(true);
  const [touched, setTouched] = useState(false)

  const init = async () => {
    console.log('init...');
    await setupCamera();
    console.log('set up camera success');

    model.current = await mobilenet.load();

    classifier.current = knnClassifier.create();

    console.log('set up done');

    initNotifications({ cooldown: 3000 });

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

  const train = async label => {
    console.log(`[${label}] đang training`)
    for (let i = 0; i < TRAINING_TIMES; i++) {
      console.log(`progress ${parseInt((i + 1) / TRAINING_TIMES * 100)}%`);

      await training(label)
    }
  }

  const training = label => {
    return new Promise(async resolve => {
      const embedding = model.current.infer(video.current, true)
      classifier.current.addExample(embedding, label)
      await sleep(100)
      resolve()
    })
  }

  const run = async () => {
    const embedding = model.current.infer(video.current, true)
    const result = await classifier.current.predictClass(embedding)
    console.log('label: ', result.label)
    console.log('confidences: ', result.confidences)

    if (result.label === TOUCHED_LABEL && result.confidences[result.label] > TOUCHED_CONFIDENCE) {
      setTouched(true)
      if(canPlaySound) {
        sound.play();
        canPlaySound.current = false
        notify('Cảnh báo!!!', { body: 'Bạn vừa chạm tay lên mặt !!' });
      }

    } else {
      setTouched(false)
    }

    await sleep(200)
    run()

  }

  const sleep = (ms = 0) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  useEffect(() => {
    init();
    sound.on('end', function(){
      canPlaySound.current = true
    });

    // cleanup
    return () => {

    }
  }, [])


  return (
    <div className={`app ${touched ? 'touched' : ''}`}>
      <h1 className="titile">Phần mềm phát hiện thay đổi</h1>
      <video
        ref={video}
        className="video"
        autoPlay
      />
      <div className="control">
        <button className="btn" onClick={() => train(NOT_TOUCH_LABEL)}>Train 1</button>
        <button className="btn" onClick={() => train(TOUCHED_LABEL)}>Train 2</button>
        <button className="btn" onClick={() => run()}>Run</button>
      </div>
    </div>
  );
}

export default App;
