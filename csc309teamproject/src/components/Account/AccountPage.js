import React, { useState } from 'react';
import EventItem from "./EventItem"
import EventDetails from "./EventDetails"
import "./AccountPage.css"
class AccountPage extends React.Component {
  state = {
  }

  render() {
    const selectEvent = (eventNum) =>{
        console.log(eventNum)
        this.setState({currentEvent: eventNum})
      }

    return (
      <div>
        <div id="accountDisplay">
          {this.props.state.currentUser.username}
        </div>
      </div>
    );
  }
}


export default AccountPage;
