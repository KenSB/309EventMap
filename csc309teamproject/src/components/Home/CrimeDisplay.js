import React, {Component } from 'react';
import {Card, Button} from 'react-bootstrap'
import { Route } from 'react-router-dom';
class CrimeDisplay extends Component {
    sendData = (data) => {
        this.props.callbackFromParent(data);
    }

    render() {
        return (
           <div>
               <Card style={{ width: '25rem', position: "absolute", top: 90, right: 0, height: "70vh"}}>
               <Card.Header as="h3">Crime Info</Card.Header>
               <Card.Body>
               <Card.Title as="h4"> Title: {this.props.crimeTitle}</Card.Title>
               <Card.Subtitle className="mb-2 text-muted">Posted by: {this.props.crimeArthor}</Card.Subtitle>
               <Card.Text> Description: {this.props.crimeDescription} </Card.Text>
               <Card.Text> Votes: {this.props.crimeVote} </Card.Text>
               </Card.Body>
               <Card.Footer className="text-muted">Posted on {this.props.crimeDate}</Card.Footer>
               <Button variant="outline-primary" onClick={() => this.sendData(1)} size="sm">Upvote</Button>
               <Button variant="outline-primary" onClick={() => this.sendData(0)} size="sm">Downvote</Button>
               </Card>
           </div>
        );
    }
}
export default CrimeDisplay
