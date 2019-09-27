
import './ScheduleModal.css'
import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import 'tui-calendar/dist/tui-calendar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTag, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import { error } from '../util/sweetalert'

class ScheduleModal extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      calendar: null,
      title: "",
      location: "",
      isAllDay: false,
      start: null,
      end: null
    }
  }

  componentDidMount() {
    this.setStates()
  }

  componentDidUpdate(prevProps) {
    if (prevProps && this.props.schedule && prevProps.schedule !== this.props.schedule) {
      this.setStates()
    }
  }

  setStates() {
    this.setState({
      calendar: this.props.schedule.calendar, 
      start: this.props.schedule.start, 
      end: this.props.schedule.end,
      isAllDay: this.props.schedule.isAllDay,
      title: this.props.schedule.title ? this.props.schedule.title : "",
      body: this.props.schedule.body ? this.props.schedule.body : "",
      location: this.props.schedule.location ? this.props.schedule.location : ""
    })
  }

  onClickAllDay() {
    const newValue = !this.state.isAllDay
    var start = this.state.start, end = this.state.end
    if (newValue) {
      start = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0)
      end = moment(end).add(1, 'days').toDate()
      end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0)
      end = moment(end).subtract(1, 'seconds').toDate()
    } else {
      end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 30, 0)
    }
    this.setState({isAllDay: newValue, start: start, end: end})
  }

  onChangeStartDate(date) {
    if (date && this.state.end && date >= this.state.end) {
      this.setState({end: moment(date).add(30, 'minutes').toDate()})
    }
    this.setState({start: date})
  }

  onChangeEndDate(date) {
    if (date && this.state.start && date <= this.state.start) {
      this.setState({start: moment(date).subtract(30, 'minutes').toDate()})    
    }
    this.setState({end: date})
  }

  onSave() {
    if (!this.state.title || !this.state.title.trim()) {
      error("Subject must be informed.")
    } else if (!this.state.start) {
      error("Start date must be informed.")
    } else if (!this.state.end) {
      error("End date must be informed.")
    } else {
      const schedule = {
        id: this.props.schedule.id,
        calendar: this.state.calendar,
        title: this.state.title.trim(),
        isAllDay: this.state.isAllDay,
        start: this.state.start,
        end: this.state.end,
        location: (this.state.location ? this.state.location.trim() : "")
      }
      this.props.onSave(schedule)
    }
  }

  render() {
    return (
    <Modal className="schedule-modal" centered={true} size="md" show={true} onHide={() => this.props.onClose()}>
      <Modal.Header closeButton>
      </Modal.Header>
      <Modal.Body>
        <div className="schedule-modal-body">
          {this.state.calendar &&
          <span className="dropdown">
            <button id="schedule-modal-tag-dropdown" className="btn btn-default btn-sm dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
              <div className="schedule-modal-tag-color" style={{borderColor: this.state.calendar.bgColor, backgroundColor: this.state.calendar.bgColor}}></div>
              <span>{this.state.calendar.name}</span>
            </button>
            <ul className="dropdown-menu" role="menu" aria-labelledby="schedule-modal-tag-dropdown">
              {this.props.calendarsInfo.map((info) => (
              <li key={info.id} role="presentation">
                  <a className="dropdown-menu-title" role="menuitem" onClick={() => this.setState({calendar: info})}>
                    <div className="schedule-modal-tag-color" style={{borderColor: info.bgColor, backgroundColor: info.bgColor}}></div>
                    <span>{info.name}</span>
                  </a>
              </li>
              ))}
            </ul>
          </span>}
          <div className="icon-input-container">
            <FontAwesomeIcon icon={faTag} className="fa-flip-horizontal" />
            <input placeholder="Subject" value={this.state.title} onChange={(e) => this.setState({title: e.target.value})} />
          </div>
          <div className="icon-input-container">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <input placeholder="Location (optional)" value={this.state.location} onChange={(e) => this.setState({location: e.target.value})} />
          </div>
          <div className="schedule-modal-dates">
            <DatePicker 
              locale="en"
              timeIntervals={30}
              timeCaption="Time"
              dateFormat="yyyy/MM/dd h:mm aa"
              showTimeSelect={!this.state.isAllDay}
              selected={this.state.start}
              onChange={(date) => this.onChangeStartDate(date)} />
            <DatePicker 
              locale="en"
              timeIntervals={30}
              timeCaption="Time"
              dateFormat="yyyy/MM/dd h:mm aa"
              showTimeSelect={!this.state.isAllDay}
              selected={this.state.end}
              onChange={(date) => this.onChangeEndDate(date)} />
            <label className="schedule-modal-checkbox">
              <input type="checkbox" className="tui-full-calendar-checkbox-square" value="all" checked={this.state.isAllDay} onChange={() => {}} />
              <span onClick={() => this.onClickAllDay()}></span>
              <div>All day</div>
            </label>
          </div>
          <div className="action-btn clickable schedule-modal-btn" onClick={() => this.onSave()}>{this.props.actionText}</div>
        </div>
      </Modal.Body>
    </Modal>
    )
  }
}
export default ScheduleModal
