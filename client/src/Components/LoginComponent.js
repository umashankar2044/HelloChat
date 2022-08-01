import React, { Component } from "react";
import Header from "./HeaderComponent";

class Login extends Component {
  state = {
    usernameLengthMax: 20,
    passwordLengthMax: 20,
    usernameLengthMin: 3,
    passwordLengthMin: 3,
    username: "",
    password: "",
  };

  onSubmit = () => {
    if (this.state.username === "" || this.state.password === "") {
      document.getElementById("message").innerHTML =
        "Please fill the required fields";
    } else {
      document.getElementById("submit").disabled = true;
      this.props.handleSubmit([this.state.username, this.state.password]);
    }
  };

  checkPassword = (s) => {
    document.getElementById("message").innerHTML = "";
    document.getElementById("passwordtag").innerHTML = "";
    let button = document.getElementById("submit");
    button.disabled = true;
    if (s.length < this.state.passwordLengthMin) {
      document.getElementById("passwordtag").innerHTML = "Length too short";
      this.setState({ password: "" });
      return;
    }

    if (s.length > this.state.passwordLengthMax) {
      document.getElementById("passwordtag").innerHTML = "Length too long";
      this.setState({ password: "" });
      return;
    }
    this.setState({ password: s });
    button.disabled = false;
  };

  checkUsername = (s) => {
    document.getElementById("message").innerHTML = "";
    document.getElementById("usernametag").innerHTML = "";
    let button = document.getElementById("submit");
    button.disabled = true;
    if (s.length < this.state.usernameLengthMin) {
      document.getElementById("usernametag").innerHTML = "Length too short";
      this.setState({ username: "" });
      return;
    }

    if (s.length > this.state.usernameLengthMax) {
      document.getElementById("usernametag").innerHTML = "Length too long";
      this.setState({ username: "" });
      return;
    }

    const str = "aAzZ09";
    const achar = str.charCodeAt(0);
    const Achar = str.charCodeAt(1);
    const zchar = str.charCodeAt(2);
    const Zchar = str.charCodeAt(3);
    const char0 = str.charCodeAt(4);
    const char9 = str.charCodeAt(5);
    for (let i = 0; i < s.length; i++) {
      let temp = s.charCodeAt(i);
      if (
        !(
          (temp - achar >= 0 && zchar - temp >= 0) ||
          (temp - Achar >= 0 && Zchar - temp >= 0) ||
          (temp - char0 >= 0 && char9 - temp >= 0)
        )
      ) {
        document.getElementById("usernametag").innerHTML =
          "Invalid Username, Only Character";
        this.setState({ username: "" });
        return;
      }
    }
    this.setState({ username: s });
    button.disabled = false;
  };
  render() {
    return (
      <div className="container">
        <Header
          user={this.props.user}
          handleLogout={this.props.handleLogoutBtn}
        />
        <div style={{ backgroundColor: "#e6fff9" }} className="px-5 mx-5 py-5">
          <h2>Login</h2>
          <div className="form-group justify-content-center">
            <div>
              <h5>
                <label>Username</label>
              </h5>
            </div>
            <div>
              <span id="usernametag" className="form-text text-danger"></span>
            </div>
            <input
              type="text"
              className="form-control"
              name="username"
              onChange={(e) => {
                this.checkUsername(e.target.value);
              }}
              required
            />
          </div>
          <div className="form-group">
            <div>
              <h5>
                <label>Password</label>
              </h5>
            </div>
            <div>
              <span id="passwordtag" className="form-text text-danger"></span>
            </div>
            <input
              type="password"
              className="form-control"
              name="password"
              onChange={(e) => {
                this.checkPassword(e.target.value);
              }}
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="btn btn-primary"
              id="submit"
              onClick={this.onSubmit}
            >
              Login
            </button>
          </div>
          <div>
            <span id="message" className="form-text text-danger"></span>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
