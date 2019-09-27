
import './SignIn.css'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import Modal from 'react-bootstrap/Modal'

class SignIn extends Component {
  constructor(props) {
    super(props)
    this.state = { }
  }

  render() {
    if (this.props.userSession && (this.props.userSession.isUserSignedIn() || this.props.userSession.isSignInPending())) {
      return (<Redirect to={`/`} />)
    }
    return (
      <Modal className="signin-modal" centered={true} size="lg" show={true} onHide={(e) => this.props.onHide(false)}>
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-6">
              <div className="signin-left-container">
                <img className="signin-img" src="/logo.png" alt="Secure Calendar"/>
                <p>{this.props.message}</p>
                <div className="action-btn clickable" onClick={(e) => this.props.onHide(true)}>Continue with Blockstack</div>
              </div>
            </div>
            <div className="col-6">
              <div className="signin-right-container">
                <h5>What is Blockstack?</h5>
                <p>Secure Calendar is built using <a target="_blank" rel="noopener noreferrer" href="https://blockstack.org/try-blockstack">Blockstack</a> infrastructure, allowing us to provide decentralized encrypted storage.</p>
                <p>Blockstack ID provides user-controlled login and storage that enable you to take back control of your identity and data.</p>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    )
  }
}
export default SignIn
