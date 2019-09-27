import './App.css'
import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { UserSession } from 'blockstack'
import Home from './pages/Home'
import CalendarPage from './pages/CalendarPage'
import NavBar from './partials/NavBar'
import SignIn from './partials/SignIn'
import { appConfig } from './util/constants'
import { withRouter } from 'react-router-dom'
import { server_error } from './util/sweetalert'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Footer from './partials/Footer'


class App extends Component {
  constructor() {
    super()
    this.userSession = new UserSession({ appConfig })
    this.state = {
      showSignIn: false
    }
  }

  componentWillMount() {
    if (!this.userSession.isUserSignedIn() && this.userSession.isSignInPending()) {
      this.userSession.handlePendingSignIn()
      .then((userData) => {
        if(!userData.username) {
          throw new Error('This app requires a username.')
        }
        this.props.history.push('/calendar')
      }).catch((err) => server_error(err))
    } 
  }

  onCloseSignIn(redirect) {
    this.setState({ showSignIn: false })
    if (redirect) {
      var origin = window.location.origin
      var redirectPath = window.location.pathname.replace("#","/")
      setTimeout(() => this.userSession.redirectToSignIn(origin + redirectPath, origin + '/manifest.json', ['store_write', 'publish_data']), 0)  
    }
  }

  signOut() {
    this.userSession.signUserOut(window.location.origin)
  }

  render() {
    return (
      <main role="main">
        <NavBar 
          userSession={this.userSession} 
          signOut={() => this.signOut()} 
          signIn={() => this.setState({ showSignIn: true })}
        />
        <div className="app-content">
        <Switch>
          <Route 
            path={`/privacy`} 
            render={ routeProps => <Privacy {...routeProps} /> }
          />
          <Route 
            path={`/terms`} 
            render={ routeProps => <Terms {...routeProps} /> }
          />
          <Route 
            path={`/calendar`} 
            render={ routeProps => <CalendarPage {...routeProps} 
              userSession={this.userSession} /> }
          />
          <Route 
            path={`/`} 
            render={ routeProps => <Home {...routeProps} 
              userSession={this.userSession}
              signIn={() => this.setState({ showSignIn: true })}/> }
          />
        </Switch>
        </div>
        <Footer />
        {this.state.showSignIn && 
        <SignIn 
          userSession={this.props.userSession} 
          message="Login to get started."
          onHide={(redirect) => this.onCloseSignIn(redirect)}
        />}
      </main>
    );
  }
}
export default withRouter(App)
