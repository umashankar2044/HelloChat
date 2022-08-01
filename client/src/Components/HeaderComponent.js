import React, { Component } from "react";
import Axios from "axios";
//#00cc99
//#ff4da6
class Header extends Component {
  Logout = () => {
    document.getElementById("logoutbtn").disabled = true;
    Axios.get("http://localhost:3001/logout").then((response) => {
      if (response.data[0].loggedout) {
        this.props.handleLogout();
      }
    });
  };
  handleName = () => {
    if (this.props.user !== null) {
      return (
        <div className="show row mx-2">
          <h3 style={{ color: "white" }} className="mb-0">
            {this.props.user}
          </h3>
          <button
            style={{ color: "white" }}
            className="btn btn-warning ml-2 font-weight-bold"
            type="button"
            id="logoutbtn"
            aria-haspopup="true"
            aria-expanded="false"
            onClick={this.Logout}
          >
            Logout
          </button>
        </div>
      );
    } else {
      return;
    }
  };
  render() {
    return (
      <div>
        <nav
          className="navbar navbar-extend-sm"
          style={{ background: "#00cc99" }}
        >
          <h1
            className="font-weight-bold text-monospace mb-0 ml-2"
            style={{ color: "white" }}
          >
            HelloChat
          </h1>
          {this.handleName()}
        </nav>
      </div>
    );
  }
}
export default Header;
