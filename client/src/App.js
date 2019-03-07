import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import axios from "axios";

class App extends Component {
  constructor() {
    super();
    this.state = { text: "" };
  }

  loadData = url => {
    axios
      .get(url)
      .then(res => {
        console.log("res");
        console.log(res);

        this.setState({ text: res.data });
      })
      .catch(err => console.log(err));
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />

          <button onClick={() => this.loadData("/api")}>Get Api</button>
          <button onClick={() => this.loadData("/code")}>Get Code</button>
          
          <h1>sweeeeety - once more! oh FULL </h1>

          <p>{this.state.text}</p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
