import React, { Component } from 'react';
import NameForm from './NameForm';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <NameForm/>
        </div>
      </div>
    );
  }
}

export default App;
