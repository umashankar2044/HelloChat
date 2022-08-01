import React, { Component } from "react";
import Axios from "axios";
import "../CSS/chatlist.css";
const { autocomplete, closeAllLists } = require("./utility/autocomplete.js");
//#ffe066
//#e6fff9

class ChatList extends Component {
  //@params userList(listId,userId,userName)
  state = {
    userList: [],
    newUser: null,
  };
  componentDidMount = () => {
    Axios.defaults.withCredentials = true;
    Axios.post("http://localhost:3001/list", {
      userid: this.props.userid,
    }).then((response) => {
      if (response.data[0].statusList) {
        if (response.data[1] !== null) {
          var newList = [];
          for (var i = 0; i < response.data[1].length; i++) {
            newList.push([
              response.data[1][i].id,
              response.data[1][i].rearuser,
              response.data[1][i].rearusername,
            ]);
          }
          this.setState({ userList: newList });
        }
      } else {
        document.getElementById("searchResult").innerHTML =
          response.data[1].message;
      }
    });
    //closes all the suggestions input
    document.addEventListener("click", function (e) {
      closeAllLists(e.target);
    });
  };
  //function to delete particular list from all the list.
  deleteList = (userListId) => {
    Axios.post("http://localhost:3001/list/deleteList", {
      listid: userListId,
    }).then((response) => {
      if (response.data[0].deleteStatus) {
        var newList = [];
        for (var i = 0; i < this.state.userList.length; i++) {
          if (this.state.userList[i][0] !== userListId) {
            newList.push(this.state.userList[i]);
          }
        }
        this.setState({ userList: newList });
      } else {
        document.getElementById("searchResult").innerHTML =
          response.data[1].message;
      }
    });
  };

  //adding a new user to the list of username with whom we are chatting with
  addUserToList = () => {
    if (this.state.newUser == null) {
      document.getElementById("searchResult").innerHTML =
        "User already exist in list";
    } else {
      var d = new Date();
      Axios.post("http://localhost:3001/list/addUser", {
        userid: this.props.userid,
        newUser: this.state.newUser,
        datetime:
          d.toISOString().split("T")[0] + " " + d.toTimeString().split(" ")[0],
      }).then((response) => {
        if (response.data[0].id === -1) {
          document.getElementById("searchResult").innerHTML =
            response.data[1].message;
        } else {
          var newList = [
            [response.data[0].id, response.data[1].userid, this.state.newUser],
          ];
          for (var i = 0; i < this.state.userList.length; i++) {
            newList.push(this.state.userList[i]);
          }
          this.setState({ userList: newList, newUser: null });
        }
      });
    }
  };
  //checking name of the user typed in the search box to add it to the list.
  //checking whether it already exist in the list or it is not the name of the user logged in itself.
  checkNewUser = (user) => {
    document.getElementById("searchResult").innerHTML = "";
    if (
      this.state.userList.some((row) => row.includes(user)) ||
      user === this.props.user
    ) {
      closeAllLists(null, document.getElementById("searchboxInput"));
      if (this.state.newUser != null) {
        this.setState({ newUser: null });
      }
    } else {
      this.setState({ newUser: user });
      if (user !== "" && user !== " ") {
        Axios.post("http://localhost:3001/list/suggest", {
          username: user,
        }).then((response) => {
          var arr = [user];
          for (var i = 0; i < response.data.length; i++) {
            arr.push(response.data[i].username);
          }
          autocomplete(
            document.getElementById("searchboxInput"),
            user,
            arr,
            this
          );
        });
      } else {
        closeAllLists(null, document.getElementById("searchboxInput"));
      }
    }
  };
  //making all the lists components to add
  renderList = () => {
    if (this.state.userList.length === 0) {
      return (
        <div className="list row justify-content-center">
          <h3>Oops! No Chats</h3>
        </div>
      );
    } else {
      return this.state.userList.map((list) => {
        const userListId = list[0];
        const userId = list[1];
        const userName = list[2];
        return (
          <div
            key={userListId}
            id={userName}
            className="list row justify-content-center"
          >
            <h3>
              <button
                onClick={() => this.props.onButtonClick(userId, userName)}
              >
                {userName}
              </button>
            </h3>
            <div className="deleteButton">
              <button onClick={() => this.deleteList(userListId)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-x"
                  viewBox="0 0 16 16"
                >
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            </div>
          </div>
        );
      });
    }
  };
  render() {
    return (
      <div className="col-sm-12 col-md-4 pb-5 chatlist">
        <div className="row searchbox justify-content-center">
          <div className="autocomplete">
            <input
              id="searchboxInput"
              type="text"
              placeholder="Search..."
              onChange={(e) => {
                this.checkNewUser(e.target.value);
              }}
            ></input>

            <button
              type="submit"
              className="btn btn-info ml-2"
              onClick={this.addUserToList}
            >
              Search
            </button>
          </div>
        </div>
        <div id="searchResult" className="row ml-5 pl-5 text-danger"></div>
        {this.renderList()}
      </div>
    );
  }
}
export default ChatList;
