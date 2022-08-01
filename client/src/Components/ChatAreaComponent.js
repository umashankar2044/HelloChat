import React, { Component } from "react";
import io from "socket.io-client";
import Axios from "axios";
import "../CSS/chatarea.css";
//#2d5986

let socket;
const ConnectionPort = "localhost:3001/";

class ChatArea extends Component {
  //@params messages(messageId,message,loggedinUser,readStatus)
  //readStatus: -1=>message sent , 0=>message recieved , 1=>message read
  state = {
    messages: [],
    message: null,
    currentUserName: null,
  };

  componentDidMount = () => {
    //connecting user to the socket
    socket = io(ConnectionPort);
    socket.emit("join_chat", this.props.user);

    //will get the socket that someone has send a message
    socket.on("recieve_message", (data) => {
      if (this.state.currentUserName === data.userfrom) {
        let users = {
          userfrom: data.userfrom,
          userto: data.userto,
        };
        socket.emit("readStatusTrue", users);

        var newMessages = [];
        newMessages.push([data.messageid, data.message, false, 1]);
        for (var i = 0; i < this.state.messages.length; i++) {
          newMessages.push(this.state.messages[i]);
        }
        this.setState({ messages: newMessages }, () =>
          this.handleUnreadMessages([data.messageid])
        );
      }
    });

    //will get that the message sent was seen by the user
    socket.on("read", (data) => {
      if (this.state.currentUserName === data.userto) {
        let newMessages = [];
        for (var i = 0; i < this.state.messages.length; i++) {
          if (this.state.messages[i][2]) {
            newMessages.push([
              this.state.messages[i][0],
              this.state.messages[i][1],
              this.state.messages[i][2],
              1,
            ]);
          } else {
            newMessages.push(this.state.messages[i]);
          }
        }
        this.setState({ messages: newMessages });
      }
    });
  };

  componentDidUpdate = () => {
    if (this.props.currentUserName !== this.state.currentUserName) {
      Axios.post("http://localhost:3001/chatArea", {
        userfrom: this.props.userid,
        userto: this.props.currentUserId,
      }).then((response) => {
        if (response.data[0].fetchStatus) {
          var newMessages = [];
          var unreadMessages = [];
          for (var i = 0; i < response.data[1].length; i++) {
            if (response.data[1][i].userfrom !== this.props.userid) {
              if (!response.data[1][i].readstatus) {
                unreadMessages.push(response.data[1][i].id);
              }
            }
            newMessages.push([
              response.data[1][i].id,
              response.data[1][i].message,
              response.data[1][i].userfrom === this.props.userid,
              response.data[1][i].readstatus,
            ]);
          }
          this.setState(
            {
              messages: newMessages,
              currentUserName: this.props.currentUserName,
            },
            () => this.handleUnreadMessages(unreadMessages)
          );
        } else {
          this.setState({ currentUserName: this.props.currentUserName });
          document.getElementById("messageError").innerHTML =
            response.data[1].message;
        }
      });
    }
  };
  //function that takes all ids of the unread messages and set it to read status in database.
  handleUnreadMessages = (unreadMessages) => {
    if (unreadMessages.length > 0) {
      Axios.post("http://localhost:3001/chatArea/setReadStatus", {
        messageIds: unreadMessages,
      }).then((response) => {
        console.log(response);
      });
    }
  };
  //function to send message to the server to insert it into the database.
  handleMessageSend = () => {
    if (this.props.currentUserName != null) {
      if (this.state.message != null) {
        var d = new Date();
        Axios.post("http://localhost:3001/chatArea/message", {
          userfrom: this.props.userid,
          userto: this.props.currentUserId,
          message: this.state.message,
          datetime:
            d.toISOString().split("T")[0] +
            " " +
            d.toTimeString().split(" ")[0],
        }).then((response) => {
          if (response.data[0].inserted) {
            //send message through socket
            let messageContent = {
              messageid: response.data[1].id,
              message: this.state.message,
              userfrom: this.props.user,
              userto: this.props.currentUserName,
              datetime:
                d.toISOString().split("T")[0] +
                " " +
                d.toTimeString().split(" ")[0],
            };
            socket.emit("send_message", messageContent);
            //
            var newMessages = [
              [response.data[1].id, this.state.message, true, 0],
            ];
            for (var i = 0; i < this.state.messages.length; i++) {
              newMessages.push(this.state.messages[i]);
            }
            this.setState({ message: null, messages: newMessages });
          } else {
            this.setState({ message: null });
            document.getElementById("messageError").innerHTML =
              response.data[1].message;
          }
        });
        document.getElementById("sendInput").value = "";
      }
    }
  };

  //function to update the state of the message every time it is changed
  updateMessage = (s) => {
    if (this.props.currentUserName != null) {
      if (s.length === 0) {
        if (this.state.message != null) {
          this.setState({ message: null });
        }
      } else {
        this.setState({ message: s });
      }
    }
  };
  //function to conditionally render back button to go to the chatlist when screen size is small.
  //it only render the back button if the screen size is less
  checkBackButton = () => {
    let screenFlag = false;
    if (window.screen.width < 768) {
      screenFlag = true;
    }
    if (screenFlag) {
      return (
        <button
          onClick={this.props.onClickBack}
          className="btn btn-secondary my-2 mx-2"
        >
          Back
        </button>
      );
    } else {
      return;
    }
  };
  //function to render all messages which are in the state.
  renderMessages = () => {
    if (this.props.currentUserName === null) {
      return (
        <div
          style={{ color: "#2d5986" }}
          className="justify-content-center mb-5"
        >
          <h3>Select someone to Chat</h3>
        </div>
      );
    } else {
      if (this.state.messages.length === 0) {
        return (
          <div
            style={{ color: "#2d5986" }}
            className="justify-content-center mb-5"
          >
            <h3>Lets Start some Chatting!</h3>
          </div>
        );
      } else {
        return this.state.messages.map((temp) => {
          const messageid = temp[0];
          const message = temp[1];
          const me = temp[2];
          const readStatus = temp[3];
          if (me) {
            if (readStatus === -1) {
              return (
                <div key={messageid} className="messageout">
                  <h4 className="name">{this.props.user}</h4>
                  <div className="message">
                    <h5>
                      <span>{message}</span>
                    </h5>
                  </div>
                  <div className="row">
                    <div className="status"></div>
                  </div>
                </div>
              );
            } else {
              if (readStatus === 0) {
                return (
                  <div key={messageid} className="messageout">
                    <h4 className="name">{this.props.user}</h4>
                    <div className="message">
                      <h5>
                        <span>{message}</span>
                      </h5>
                    </div>
                    <div className="row">
                      <div className="status"></div>
                      <div className="status"></div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={messageid} className="messageout">
                    <h4 className="name">{this.props.user}</h4>
                    <div className="message">
                      <h5>
                        <span>{message}</span>
                      </h5>
                    </div>
                    <div className="row">
                      <div
                        style={{ backgroundColor: "deepskyblue" }}
                        className="status"
                      ></div>
                      <div
                        style={{ backgroundColor: "deepskyblue" }}
                        className="status"
                      ></div>
                    </div>
                  </div>
                );
              }
            }
          } else {
            return (
              <div key={messageid} className="messagein">
                <h4 className="name">{this.props.currentUserName}</h4>
                <div className="message">
                  <h5>
                    <span>{message}</span>
                  </h5>
                </div>
              </div>
            );
          }
        });
      }
    }
  };

  render() {
    return (
      <div className="col-md-8 mx-0">
        <div className="messageHeader row ">
          {this.checkBackButton()}
          <h3 id="chatName" className="my-2">
            HelloChat
          </h3>
          <span
            id="messageError"
            className="text-danger mt-3  ml-2 justify-content-center"
          ></span>
        </div>
        <div className="messages">{this.renderMessages()}</div>
        <div className="messageinput row">
          <input
            type="text"
            className="form-control"
            placeholder="Type a message..."
            id="sendInput"
            onChange={(e) => this.updateMessage(e.target.value)}
          ></input>
          <button
            type="submit"
            id="send"
            onClick={this.handleMessageSend}
            className="btn btn-success"
          >
            Send
          </button>
        </div>
      </div>
    );
  }
}

export default ChatArea;
