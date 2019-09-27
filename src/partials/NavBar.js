import './NavBar.css'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import BlockstackManager from '../util/blockstackManager'
import { server_error } from '../util/sweetalert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'

class NavBar extends Component {
  constructor(props){
    super(props)
		this.state = {
      person: null
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.userSession && this.props.userSession.isUserSignedIn() && this.state.person === null) {
		  this.componentWillMount()
		}
  }
  
  componentWillMount() {
    if (this.props.userSession && this.props.userSession.isUserSignedIn()) {
      BlockstackManager.getUserProfile(this.props.userSession.loadUserData().username).then((person) => 
      {
        this.setState({ person: person })
      }).catch((err) => server_error(err))
    }
  }

  render() {
    var username = null
    var userImage = null
    if (this.props.userSession && this.props.userSession.isUserSignedIn()) {
      username = this.state.person && this.state.person.name ? this.state.person.name : this.props.userSession.loadUserData().username
      userImage = this.state.person && this.state.person.avatarUrl
    }
    var style = {}
    if (window.location && window.location.pathname && window.location.pathname.startsWith("/calendar")) {
      style = {borderBottomColor: "#989797", borderBottomWidth: 1, borderBottomStyle: "solid"}
    }
    return (
      <div>
      <nav className="navbar navbar-expand-lg navbar-light" style={style}>
        <div className="container">
          <Link className="logo-link clickable" to={`/`}>
            <img src="/logo.png" alt="Secure Calendar" />
          </Link>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            {username && 
            <ul className="navbar-nav">
              <li className="nav-item mx-lg-3">
                <div className="nav-link link-nav clickable" onClick={() => this.props.history.push("/calendar")}>My Calendar</div>
              </li>  
            </ul>}
            <ul className="navbar-nav ml-auto">
              {username &&
                <li className="nav-item dropdown">                  
                  <a className="dropdown-toggle nav-link clickable" id="navbarProfile" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <div className="user-nav-container">
                      <div className="user-nav-wrap">
                        {userImage ? <img src={userImage} className="user-img-nav" alt={username} /> : <FontAwesomeIcon icon={faUserCircle} className="mr-1" /> }
                        <span>{username}</span>
                      </div>
                    </div>
                  </a>
                  <div className="dropdown-menu" aria-labelledby="navbarProfile">
                    <a className="dropdown-item clickable" onClick={() => this.props.signOut()}>SIGN OUT</a>
                  </div>
                </li>
              }
              {!username && 
                <li className="nav-item mx-lg-2">
                  <div className="nav-link link-nav underline clickable" onClick={() => this.props.signIn()}>SIGN IN</div>
                </li>
              }
            </ul>
          </div>
        </div>
      </nav>
      </div>)   
  }
}
export default withRouter(NavBar)
