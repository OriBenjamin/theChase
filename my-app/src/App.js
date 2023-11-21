import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div className='mt-10'>
        <button className='btn-prev mr-1'>Prev</button>
        <button className='btn-next ml-1'>Next</button>
        </div>
      </header>
    </div>
  );
}

export default App;
