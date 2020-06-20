import React from 'react';
import "./styles.css";
import { Container, Form, Button, Row, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom';
import LoginInput from '../loginComponents/LoginInput'
class Login extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {

    // function checkValidLogin(username, password){
    //   console.log(username)
    //   console.log(password)
    //   const user = this.props.users.filter(
    //     (e) => e.username === username && e.password === password)
    //   console.log(user)
    //   if(user.length !== 0){
    //     this.props.setCurrentUser(user[0])
    //   }
    // }
    const checkValidLogin = ([username, password]) =>{
      console.log(username)
      console.log(password)
      const user = this.props.state.users.filter(
        (e) => e.username === username && e.password === password)
      console.log(user)
      if(user.length !== 0){
        this.props.state.currentUser = user;
        return true;
      }
      else{
        return false;
      }
    }
    return (
      <Container>
        <main>
          <Row>
            <Col md={{ span: 6, offset: 3 }}>
              <h3>Sign in</h3>
              <hr></hr>
              <LoginInput loginInput= {checkValidLogin}  />
            </Col>
          </Row>
        </main>
      </Container>
    );
  }
}




export default Login;