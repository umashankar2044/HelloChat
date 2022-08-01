import React, { Component } from "react";
import Axios from "axios";
import "./CSS/App.css";
import Login from "./Components/LoginComponent";
import Chat from "./Components/ChatComponent";

class App extends Component {
  state = {
    userid: -1,
    user: null,
  };
  componentDidMount = () => {
    Axios.defaults.withCredentials = true;
    if (this.state.userid === -1) {
      Axios.get("http://localhost:3001/login").then((response) => {
        if (response.data[0].loggedIn) {
          this.setState({
            user: response.data[2].user,
            userid: response.data[1].id,
          });
        }
      });
    }
  };
  handleLogout = () => {
    this.setState({ userid: -1, user: null });
  };

  handleLogin = (e) => {
    Axios.post("http://localhost:3001/login", {
      username: e[0],
      password: e[1],
    }).then((response) => {
      if (response.data[0].id === -1) {
        document.getElementById("message").innerHTML = response.data[1].message;
      } else {
        this.setState({
          user: response.data[2].user,
          userid: response.data[0].id,
        });
      }
    });
  };

  checkStatus = () => {
    if (this.state.userid === -1) {
      return (
        <Login
          handleSubmit={this.handleLogin}
          handleLogoutBtn={this.handleLogout}
          user={this.state.user}
        />
      );
    } else {
      return (
        <Chat
          handleLogoutBtn={this.handleLogout}
          userid={this.state.userid}
          user={this.state.user}
        />
      );
    }
  };

  render() {
    return <div className="App">{this.checkStatus()}</div>;
  }
}

export default App;
