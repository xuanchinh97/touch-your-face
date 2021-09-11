import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="app">
      <video
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
