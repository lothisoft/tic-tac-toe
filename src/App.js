import React, { Component } from 'react';

import {TicTacToe} from './components/TicTacToe';

import './css/App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <TicTacToe />
      </div>
    );
  }
}

export default App;
