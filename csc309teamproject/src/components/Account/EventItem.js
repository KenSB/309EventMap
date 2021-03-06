import React from 'react';
import { Button } from 'react-bootstrap'
import "./AccountPage.css"
class EventItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: {
        title: ""
      }
    };
  }

  onSubmitDetails = (e) => {
    e.preventDefault();
    this.props.selectEvent(this.props.eventNum)
    this.props.buttonClick(1)
  }
  onSubmitEdit = (e) => {
    e.preventDefault();
    this.props.selectEvent(this.props.eventNum)
    this.props.buttonClick(2)
  }
  onSubmitDelete = (e) => {
    e.preventDefault();
    this.props.actions.deleteEvent(this.props.eventNum)
    this.props.buttonClick(3)
  }

  componentDidMount = () => {
    // [*] Exchanging data with external source
    this.props.actions.getEvent(this.props.eventNum).then((e) => {
      if (e !== null)
        this.setState({event: e});
    });
  }
  render() {
    return (
      <tr className="tableRow">
        <th className="tableTitle">
            <p> {this.state.event.title} </p>
        </th>
        <th>
          <Button className="tableButtonDetail" variant="primary" type="submit" onClick={this.onSubmitDetails}>
          </Button>
        </th>
        <th>
          <Button className="tableButtonEdit" variant="primary" type="submit" onClick={this.onSubmitEdit}>
          </Button>
        </th>
        <th>
          <Button className="tableButtonDelete" variant="primary" type="submit" onClick={this.onSubmitDelete}>
          </Button>
        </th>
      </tr>
    );
  }
}


export default EventItem;
