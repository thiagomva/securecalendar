import './Footer.css'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'


class Footer extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    if (window.location && window.location.pathname && window.location.pathname.startsWith("/calendar")) {
      return <div></div>
    } else {
      return (
      <footer className="text-muted">
          <div className="container footer-container">
            <div className="row">
              <div className="col-3">
                <a className="clickable footer-link mr-1" href="/terms" target="_self">Terms</a>
                <span className="vr"></span>
                <a className="clickable footer-link ml-1" href="/privacy" target="_self">Privacy</a>
              </div>
              <div className="col-6 footer-copyright"><p>Secure Calendar - 2019</p></div>
              <div className="col-3 footer-github">
                <a className="clickable mr-1" title="See on Github" href="https://github.com/thiagomvaraujo/securecalendar" target="_blank">
                  <FontAwesomeIcon icon={faGithub} />
                </a>
              </div>
            </div>
          </div>
      </footer>)
    }
  }
}
export default withRouter(Footer)