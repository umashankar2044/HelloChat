import React, { Component } from "react";
import Header from "./HeaderComponent";
import ChatList from "./ChatListComponent";
import ChatArea from "./ChatAreaComponent";

class Chat extends Component {
  state = {
    chatAreaFlag: false,
    currentUserName: null,
    currentUserId: -1,
  };

  handleUserList = (id, user) => {
    if (window.screen.width < 768) {
      this.setState({
        chatAreaFlag: true,
        currentUserName: user,
        currentUserId: id,
      });
    } else {
      this.setState({ currentUserName: user, currentUserId: id });
    }
    document.getElementById("chatName").innerHTML = user;
    //document.getElementById(user).style.backgroundColor = "#e6b800";
  };
  //function to call when back button of the chatArea is clicked.if sets the states to the default.
  handleBackScreen = () => {
    this.setState({ chatAreaFlag: false, currentUserName: null });
  };
  //function to conditionally render the chatArea depending on the screen size.
  handleScreenSize = () => {
    if (!this.state.chatAreaFlag) {
      return (
        <ChatList
          userid={this.props.userid}
          user={this.props.user}
          onButtonClick={this.handleUserList}
        />
      );
    } else {
      return;
    }
  };
  render() {
    return (
      <div className="container-fluid">
        <Header
          user={this.props.user}
          handleLogout={this.props.handleLogoutBtn}
        />
        <div className="container-fluid">
          <div className="row">
            {this.handleScreenSize()}
            <ChatArea
              userid={this.props.userid}
              user={this.props.user}
              currentUserName={this.state.currentUserName}
              currentUserId={this.state.currentUserId}
              onClickBack={this.handleBackScreen}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Chat;
