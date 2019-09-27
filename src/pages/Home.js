import './Home.css'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'


class Home extends Component {
  constructor(props){
    super(props)
    this.state = {
    }
  }

  componentWillMount() {
    if (window.location.pathname !== '/') {
      this.props.history.push('/')
    }
  }

  onClickGetStart() {
    if (!this.props.userSession || !this.props.userSession.isUserSignedIn()) {
      this.props.signIn()
    } else {
      this.props.history.push("/calendar")
    }
  }

  render() {
    return (
      <div>
        <div className="container">
          <div className="home-header">
            <div className="home-header-action">
              <div className="home-header-text">
                <h1>Free Encrypted Calendar</h1>
                <h3>Secure, end-to-end encrypted, and privacy respecting calendar</h3>
              </div>
              <button onClick={() => this.onClickGetStart()}>GET STARTED  <FontAwesomeIcon icon={faAngleRight} /></button>
            </div>
            <img src="/home_img.png" alt="Secure Calendar" className="d-none d-lg-block" />
          </div>
          <div className="home-features">
            <h3>FEATURES</h3>
            <div>
              <div className="home-feature">
                <img src="/icon1.png" alt="Secure & Encrypted" />
                <span></span>
                <div>
                  <strong>Secure & Encrypted</strong>
                  <div>The built-in encryption guarantees that your calendar belongs to you.</div>
                </div>
              </div>

              <div className="home-feature">
                <img src="/icon2.png" alt="Create events" />
                <span></span>
                <div>
                  <strong>Create events</strong>
                  <div>Create events with custom-named color labels, start & end time or all-day event.</div>
                </div>
              </div>

              <div className="home-feature">
                <img src="/icon3.png" alt="User-friendly interface" />
                <span></span>
                <div>
                  <strong>User-friendly interface</strong>
                  <div>Easily switch between monthly, weekly and daily view.</div>
                </div>
              </div>
            </div>
            <img src="/icon4.png" alt="Secure Calendar" />
          </div>
        </div>
      </div>
    )
  }
}
export default withRouter(Home)
