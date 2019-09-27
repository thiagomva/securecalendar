import './CalendarPage.css'
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { server_error, confirm, error } from '../util/sweetalert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faTh, faAlignJustify, faAngleLeft, faAngleRight, faPlus, faTimes, faPalette } from '@fortawesome/free-solid-svg-icons'
import uuidv4 from 'uuid/v4'
import Calendar from '@toast-ui/react-calendar'
import 'tui-calendar/dist/tui-calendar.css'
import 'tui-date-picker/dist/tui-date-picker.css'
import 'tui-time-picker/dist/tui-time-picker.css'
import BlockstackManager from '../util/blockstackManager'
import moment from 'moment'
import Modal from 'react-bootstrap/Modal'
import { CirclePicker } from 'react-color'
import { Slider, Rail, Handles, Tracks, Ticks } from 'react-compound-slider'
import ScheduleModal from '../partials/ScheduleModal'

const sliderStyle = {  
  position: 'relative',
  width: 350,
  height: 52
}

const railStyle = { 
  position: 'absolute',
  width: '100%',
  height: 10,
  marginTop: 21,
  borderRadius: 5,
  backgroundColor: '#ddd'
}

const scheduleView = ["allday","time"]

const template = {
  alldayTitle() {
    return '<b style="text-align:center;width:100%;float:inherit;margin-top:7px;margin-left:4px;">All Day</b>'
  }
}

class CalendarPage extends Component {
  constructor(props){
    super(props)
    this.calendarRef = React.createRef()
    this.state = {
      loading: true,
      view: "Weekly",
      allCalendarsInfo: true,
      rangeText: "",
      calendarsInfo: [],
      schedules: [],
      showInfoEdit: false,
      showPickColor: false,
      tagColor: "",
      tagText: "",
      showScheduleModal: false,
      editingSchedule: null,
      creatingSchedule: null,
      collapsed: false,
      week: {
        startDayOfWeek: 0,
        showTimezoneCollapseButton: false,
        timezonesCollapsed: true,
        workweek: false,
        hourStart: 7,
        hourEnd: 22,
        narrowWeekend: false
      },
      month: {
        startDayOfWeek: 0,
        workweek: false,
        visibleWeeksCount: 0,
        narrowWeekend: false
      }
    }
  }

  getCalendar() {
    return this.calendarRef.current.getInstance()
  }

  componentWillMount() {
    if (!this.props.userSession || !this.props.userSession.isUserSignedIn()) {
      this.props.history.push('/')
    } else if (window.innerWidth && window.innerWidth < 992) {
      this.state.week.hourStart = 0
      this.state.week.hourEnd = 24
      this.setState({week: Object.assign({}, this.state.week)})
    }
  }

  componentDidMount() {
    BlockstackManager.getCalendarsInfo().then(calendarsInfo =>
      {
        if (calendarsInfo.length === 0) {
          calendarsInfo = this.getDefaultCalandersInfo()
        }
        this.setState({calendarsInfo: calendarsInfo}, () =>
        {
          this.getCalendar().setCalendars(this.state.calendarsInfo)
          const hourNow = (new Date()).getHours()
          if (this.state.week.hourStart > hourNow) {
            this.state.week.hourStart = hourNow
            this.setState({week: Object.assign({}, this.state.week)})
          }
          if (this.state.week.hourEnd <= hourNow) {
            this.state.week.hourEnd = hourNow + 1
            this.setState({week: Object.assign({}, this.state.week)})
          }
          this.setRenderRangeText()
          this.setSchedules()
        })
      }).catch((err) => server_error(err))
  }

  setSchedules() {
    BlockstackManager.getSchedules().then(schedules =>
      {
        if (schedules.length > 0) {
          for (var i = 0; i < schedules.length; ++i) {
            if (schedules[i].end) schedules[i].end = new Date(schedules[i].end)
            if (schedules[i].start) schedules[i].start = new Date(schedules[i].start)
          }
          this.setState({schedules: schedules, loading: false}, () => this.getCalendar().createSchedules(this.state.schedules))
        } else {
          this.setState({loading: false})
        }
      }).catch((err) => server_error(err))
  }

  getDefaultCalandersInfo() {
    const infos = []
    infos.push({
      id: "1",
      name: 'default',
      color: '#ffffff',
      bgColor: '#abb8c3',
      dragBgColor: '#abb8c3',
      borderColor: '#abb8c3',
      checked: true
    })
    infos.push({
      id: "2",
      name: 'Work',
      color: '#ffffff',
      bgColor: '#ffc107',
      dragBgColor: '#ffc107',
      borderColor: '#ffc107',
      checked: true
    })
    infos.push({
      id: "3",
      name: 'Personal',
      color: '#ffffff',
      bgColor: '#03a9f4',
      dragBgColor: '#03a9f4',
      borderColor: '#03a9f4',
      checked: true
    })
    return infos
  }

  setCalendarView(view) {
    const calendar = this.getCalendar()
    const options = calendar.getOptions()
    var viewName = ''
    if (view === "Daily") {
      viewName = 'day'
    } else if (view === "Weekly") {
      viewName = 'week'
    } else if (view === "Month") {
      options.month.visibleWeeksCount = 0
      viewName = 'month'
    } else if (view === "2 weeks") {
      options.month.visibleWeeksCount = 2
      viewName = 'month'
    } else if (view === "3 weeks") {
      options.month.visibleWeeksCount = 3
      viewName = 'month'
    } 
    this.setState({view: view, month: Object.assign({}, options.month)}, () => 
    {
      calendar.setOptions(options, true)
      calendar.changeView(viewName, true)
      this.setRenderRangeText()
      this.refreshScheduleVisibility()
    })
  }

  setWorweek() {
    const calendar = this.getCalendar()
    const options = calendar.getOptions()
    options.month.workweek = !options.month.workweek
    options.week.workweek = !options.week.workweek
    this.setState({month: Object.assign({}, options.month), week: Object.assign({}, options.week)}, () => 
    {
      calendar.setOptions(options, true)
      calendar.changeView(calendar.getViewName(), true)
      this.setRenderRangeText()
      this.refreshScheduleVisibility()
    })
  }

  onClickNavi(action) {
    const calendar = this.getCalendar()
    if (action === "prev") {
      calendar.prev()
    } else if (action === "next") {
      calendar.next()
    } else if (action === "today") {
      calendar.today()
    }
    this.setRenderRangeText()
    this.refreshScheduleVisibility()
  }

  setRenderRangeText() {
    const calendar = this.getCalendar()
    const options = calendar.getOptions()
    const viewName = calendar.getViewName()
    var rangeText = ""
    if (viewName === 'day') {
      rangeText = moment(calendar.getDate().getTime()).format('YYYY.MM.DD')
    } else if (viewName === 'month' && !options.month.visibleWeeksCount) {
      rangeText = moment(calendar.getDate().getTime()).format('YYYY.MM')
    } else {
      rangeText = moment(calendar.getDateRangeStart().getTime()).format('YYYY.MM.DD')
      rangeText += " ~ "
      rangeText += moment(calendar.getDateRangeEnd().getTime()).format('MM.DD')
    }
    this.setState({rangeText: rangeText})
  }

  onChangeHoursLimit(start, end) {
    this.state.week.hourStart = start
    this.state.week.hourEnd = end + 1
    this.setState({week: Object.assign({}, this.state.week)})
  }

  onClickInfo(info) {
    var allChecked = true
    var someUnchecked = false
    for (var i = 0; i < this.state.calendarsInfo.length; ++i) {
      if (this.state.calendarsInfo[i].id === info.id) {
        this.state.calendarsInfo[i].checked = !info.checked
      }
      if (!someUnchecked) {
        someUnchecked = !this.state.calendarsInfo[i].checked
      }
      if (!this.state.calendarsInfo[i].checked) {
        allChecked = false
      }
    }
    if ((this.state.allCalendarsInfo && someUnchecked) || (!this.state.allCalendarsInfo && allChecked)) {
      this.setState({allCalendarsInfo: !this.state.allCalendarsInfo})
    }
    this.setState({calendarsInfo: this.state.calendarsInfo}, () => this.refreshScheduleVisibility())
  }

  onClickViewAll() {
    const newStatus = !this.state.allCalendarsInfo
    for (var i = 0; i < this.state.calendarsInfo.length; ++i) {
      this.state.calendarsInfo[i].checked = newStatus
    }
    this.setState({calendarsInfo: this.state.calendarsInfo, allCalendarsInfo: newStatus}, () => this.refreshScheduleVisibility())
  }

  refreshScheduleVisibility() {
    const calendar = this.getCalendar()
    for (var i = 0; i < this.state.calendarsInfo.length; ++i) {
      calendar.toggleSchedules(this.state.calendarsInfo[i].id, !this.state.calendarsInfo[i].checked, false)
    }
    calendar.render(true)
  }

  onClickNewSchelude() {
    const now = new Date()
    var startDate = null
    if (now.getMinutes() < 30) {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 30, 0)
    } else {
      const nextTime = moment(now).add(30, 'minutes').toDate()
      startDate = new Date(nextTime.getFullYear(), nextTime.getMonth(), nextTime.getDate(), nextTime.getHours(), 0, 0)
    }
    const defaultInfo = this.getDefaultCalandersInfo()[0]
    const schedule = {
      end: moment(startDate).add(30, 'minutes').toDate(),
      start: startDate,
      isAllDay: false,
      calendar: defaultInfo
    }
    this.setState({showScheduleModal: true, editingSchedule: null, creatingSchedule: schedule})
  }

  createSchedule(schedule) {
    var calendar = schedule.calendar
    if (!calendar) {
      for (var i = 0; i < this.state.calendarsInfo.length; ++i) {
        if (this.state.calendarsInfo[i].id === schedule.calendarId) {
          calendar = this.state.calendarsInfo[i]
          break
        }
      }
    }
    if (!calendar) {
      calendar = this.getDefaultCalanderInfo()[0]
    }
    const newSchedule = {
      calendarId: calendar.id,
      color: calendar.color,
      bgColor: calendar.bgColor,
      dragBgColor: calendar.bgColor,
      borderColor: calendar.borderColor,
      id: uuidv4(),
      title: schedule.title,
      isAllDay: schedule.isAllDay,
      start: schedule.start,
      end: schedule.end,
      location: schedule.location,
      category: schedule.isAllDay ? 'allday' : 'time',
      dueDateClass: '',
      raw: { class: "private" }
    }
    this.state.schedules.push(newSchedule)
    BlockstackManager.setSchedules(this.state.schedules)
    this.setState({schedules: this.state.schedules, showScheduleModal: false, editingSchedule: null, creatingSchedule: null}, () => 
    {
      this.getCalendar().createSchedules([newSchedule])
      this.refreshScheduleVisibility()
    })
  }

  updateSchedule(schedule) {
    var index = null
    var calendarId = null
    for (var i = 0; i < this.state.schedules.length; ++i) {
      if (this.state.schedules[i].id === schedule.id) {
        calendarId = this.state.schedules[i].calendarId
        index = i
        break
      }
    }
    if (calendarId) {
      this.state.schedules.splice(index, 1)
      this.setState({schedules: this.state.schedules, showScheduleModal: false, editingSchedule: null, creatingSchedule: null}, () =>
      {
        this.getCalendar().deleteSchedule(schedule.id, calendarId, true)
        this.createSchedule(schedule)
      })
    }
  }

  handleSchedule(schedule) {
    if (this.state.editingSchedule) {
      this.updateSchedule(schedule)
    } else {
      this.createSchedule(schedule)
    }
  }

  onBeforeCreateSchedule(ev) {
    const defaultInfo = this.getDefaultCalandersInfo()[0]
    const schedule = {
      end: ev.end._date,
      start: ev.start._date,
      isAllDay: ev.isAllDay,
      calendar: defaultInfo
    }
    this.setState({showScheduleModal: true, editingSchedule: null, creatingSchedule: schedule})
  }

  onBeforeUpdateSchedule(ev) {
    if (ev.end && ev.start) {
      ev.schedule.end = ev.end._date
      ev.schedule.start = ev.start._date
      this.updateSchedule(ev.schedule)
    } else {
      if (!(ev.schedule.end instanceof Date)) ev.schedule.end = ev.schedule.end._date
      if (!(ev.schedule.start instanceof Date)) ev.schedule.start = ev.schedule.start._date
      for (var i = 0; i < this.state.calendarsInfo.length; ++i) {
        if (this.state.calendarsInfo[i].id === ev.schedule.calendarId) {
          ev.schedule.calendar = this.state.calendarsInfo[i]
          break
        }
      }
      if (!ev.schedule.calendar) {
        ev.schedule.calendar = this.getDefaultCalandersInfo()[0]
      }
      this.setState({showScheduleModal: true, editingSchedule: ev.schedule, creatingSchedule: null})
    }
  }

  onBeforeDeleteSchedule(ev) {
    var index = null
    for (var i = 0; i < this.state.schedules.length; ++i) {
      if (this.state.schedules[i].id === ev.schedule.id) {
        index = i
        break
      }
    }
    if (index || index === 0) {
      this.state.schedules.splice(index, 1)
      BlockstackManager.setSchedules(this.state.schedules)
      this.setState({schedules: this.state.schedules}, () => this.getCalendar().deleteSchedule(ev.schedule.id, ev.schedule.calendarId))
    }
  }

  onClickNewTag() {
    if (!this.state.tagText) {
      error("Tag name must be informed.")
    } else if (!this.state.tagColor) {
      error("Tag color must be picked.")
    } else {
      this.state.calendarsInfo.push({
        id: uuidv4(),
        name: this.state.tagText,
        color: '#ffffff',
        bgColor: this.state.tagColor,
        dragBgColor: this.state.tagColor,
        borderColor: this.state.tagColor,
        checked: this.state.allCalendarsInfo
      })
      BlockstackManager.setCalendarsInfo(this.state.calendarsInfo)
      this.setState({calendarsInfo: this.state.calendarsInfo, tagText: "", tagColor: ""}) 
    }
  }

  onDeleteInfo(infoId, infoName) {
    confirm("The tag '" + infoName + "' will be deleted.", (result) => {
      if (result) {
        const calendar = this.getCalendar()
        const info = this.getDefaultCalandersInfo()[0]
        const updatedSchedules = []
        for (var i = 0; i < this.state.schedules.length; ++i) {
          if (this.state.schedules[i].calendarId === infoId) {
            this.state.schedules[i].calendarId = info.id
            this.state.schedules[i].color = info.color
            this.state.schedules[i].bgColor = info.bgColor
            this.state.schedules[i].dragBgColor = info.bgColor
            this.state.schedules[i].borderColor = info.borderColor
            calendar.deleteSchedule(this.state.schedules[i].id, infoId)
            this.state.schedules[i].id = uuidv4()
            updatedSchedules.push(this.state.schedules[i])
          }
        }
        for (var i = 0; i < this.state.calendarsInfo.length; ++i) {
          if (this.state.calendarsInfo[i].id === infoId) {
            this.state.calendarsInfo.splice(i, 1)
            break
          }
        }
        BlockstackManager.setSchedules(this.state.schedules)
        BlockstackManager.setCalendarsInfo(this.state.calendarsInfo)
        calendar.createSchedules(updatedSchedules)
        this.setState({calendarsInfo: this.state.calendarsInfo, schedules: this.state.schedules}, () => this.refreshScheduleVisibility()) 
      }
    })
  }

  render() {
    return (
      <div className="calendar-page">
        {this.state.loading && 
        <div className="loading-overlay">   
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
            <span>Loading Calendar...</span>
          </div>
        </div>}
        <div className="calendar-left" style={{width: (this.state.collapsed ? 14 : 200)}}>
          <div style={{display: (this.state.collapsed ? "none" : "flex")}}>
            <div className="new-schedule">
              <button type="button" className="btn btn-default btn-sm calendar-btn" onClick={() => this.onClickNewSchelude()}>
                <FontAwesomeIcon className="calendar-icon" icon={faPlus} />New schedule
              </button>
            </div>
            <div className="calendars-info">
              <label>
                <input className="tui-full-calendar-checkbox-square" type="checkbox" value="all" checked={this.state.allCalendarsInfo} onChange={() => {}} />
                <span onClick={() => this.onClickViewAll()}></span>
                <strong>View all tags</strong>
              </label>
              <div className="lnb-calendars">
                {this.state.calendarsInfo && this.state.calendarsInfo.map((info) =>
                  <label key={info.id}>
                    <input type="checkbox" className="tui-full-calendar-checkbox-round" value="1" checked={info.checked} onChange={() => {}} />
                    <span style={{borderColor: info.bgColor, backgroundColor: (info.checked ? info.bgColor : "transparent")}} onClick={() => this.onClickInfo(info)}></span>
                    <div>{info.name}</div>
                  </label>
                )}
              </div>
              <div className="edit-calendars-info" onClick={() => this.setState({showInfoEdit: true, tagColor: "", tagText: ""})}>Edit tags</div>
            </div>
          </div>
          <FontAwesomeIcon 
            icon={(this.state.collapsed ? faAngleRight : faAngleLeft)} 
            title={(this.state.collapsed ? "Expand" : "Collapse")} 
            onClick={() => this.setState({collapsed: !this.state.collapsed}, () => setTimeout(() => this.getCalendar().render(true), 50))} />
        </div>
        <div className="calendar-right">
          <div className="calendar-actions">
            <span className="dropdown">
              <button id="dropdownMenu-calendarType" className="btn btn-default btn-sm dropdown-toggle calendar-btn" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                <FontAwesomeIcon id="calendarTypeIcon" style={{marginRight: "4px"}} 
                  icon={(this.state.view === "Month" ? faTh : faAlignJustify)}
                  className={(this.state.view === "Month" || this.state.view === "Daily" ? "calendar-icon" : "calendar-icon fa-rotate-90")} />
                <span id="calendarTypeName">{this.state.view}</span>&nbsp;
              </button>
              <ul className="dropdown-menu" role="menu" aria-labelledby="dropdownMenu-calendarType">
                <li role="presentation">
                  <a className="dropdown-menu-title" role="menuitem" onClick={() => this.setCalendarView("Daily")}>
                    <FontAwesomeIcon className="calendar-icon" icon={faAlignJustify} />Daily
                  </a>
                </li>
                <li role="presentation">
                  <a className="dropdown-menu-title" role="menuitem" onClick={() => this.setCalendarView("Weekly")}>
                    <FontAwesomeIcon className="calendar-icon fa-rotate-90" icon={faAlignJustify} />Weekly
                  </a>
                </li>
                <li role="presentation">
                  <a className="dropdown-menu-title" role="menuitem" onClick={() => this.setCalendarView("Month")}>
                    <FontAwesomeIcon className="calendar-icon" icon={faTh} />Month
                  </a>
                </li>
                <li role="presentation">
                  <a className="dropdown-menu-title" role="menuitem" onClick={() => this.setCalendarView("2 weeks")}>
                    <FontAwesomeIcon className="calendar-icon fa-rotate-90" icon={faAlignJustify} />2 weeks
                  </a>
                </li>
                <li role="presentation">
                  <a className="dropdown-menu-title" role="menuitem" onClick={() => this.setCalendarView("3 weeks")}>
                    <FontAwesomeIcon className="calendar-icon fa-rotate-90" icon={faAlignJustify} />3 weeks
                  </a>
                </li>
                <li role="presentation" className="dropdown-divider"></li>
                <li role="presentation">
                  <a role="menuitem" onClick={() => this.setWorweek()}>
                    <input type="checkbox" className="tui-full-calendar-checkbox-square" checked={!this.state.week.workweek} onChange={() => {}} />
                    <span className="checkbox-title"></span>Show weekends
                  </a>
                </li>
              </ul>
            </span>
            <div className="actions-btn">
              <span id="menu-navi">
                <button type="button" className="btn btn-default btn-sm move-today calendar-btn d-none d-md-inline-block" onClick={() => this.onClickNavi("today")}>Today</button>
                <button type="button" className="btn btn-default btn-sm move-day calendar-btn" onClick={() => this.onClickNavi("prev")}>
                  <FontAwesomeIcon className="calendar-icon" icon={faAngleLeft} />
                </button>
                <button type="button" className="btn btn-default btn-sm move-day calendar-btn" onClick={() => this.onClickNavi("next")}>
                  <FontAwesomeIcon className="calendar-icon" icon={faAngleRight} />
                </button>
              </span>
              <span id="renderRange" className="render-range">{this.state.rangeText}</span>
              {(this.state.view === "Weekly" || this.state.view === "Daily") &&
              <div className="hours-limit d-none d-lg-flex">
                <span>Limit hours</span>
                <Slider
                  rootStyle={sliderStyle}
                  domain={[0, 23]}
                  step={1}
                  mode={2}
                  values={[this.state.week.hourStart, this.state.week.hourEnd - 1]}
                  onChange={(e) => this.onChangeHoursLimit(e[0], e[1])}>
                  <Rail>{({ getRailProps }) => (<div style={railStyle} {...getRailProps()} />)}</Rail>
                  <Handles>
                    {({ handles, getHandleProps }) => (
                      <div className="slider-handles">
                        {handles.map(handle => (
                        <div key={handle.id} className="hour-slider-handle" style={{ left: `${handle.percent}%`}} {...getHandleProps(handle.id)}>
                          <div>{(handle.value === 12 || handle.value === 0 ? "12" : (handle.value % 12).toString()) + (handle.value >= 12 ? " pm" : " am")}</div>
                        </div>
                        ))}
                      </div>
                    )}
                  </Handles>
                  <Tracks left={false} right={false}>
                    {({ tracks, getTrackProps }) => (
                      <div className="slider-tracks">
                        {tracks.map(({ id, source, target }) => (
                          <div key={id} className="hour-slider-track" style={{ left: `${source.percent}%`, width: `${target.percent - source.percent}%` }} {...getTrackProps()} />
                        ))}
                      </div>
                    )}
                  </Tracks>
                  <Ticks values={[0, 6, 12, 18, 23]}> 
                    {({ ticks }) => (
                      <div className="slider-ticks">
                        {ticks.map(tick => ( 
                        <div key={tick.id} className="hour-slider-tick" style={{ left: `${tick.percent}%` }}>
                          <div>
                            {(tick.value === 12 || tick.value === 0 ? "12" : (tick.value % 12).toString()) + (tick.value >= 12 ? " pm" : " am")}
                          </div>
                        </div>
                        ))}
                      </div>
                    )}
                  </Ticks>
                </Slider>
              </div>}
            </div>
          </div>
          <Calendar
            ref={this.calendarRef}
            height="100%"
            usageStatistics={false}
            disableDblClick={true}
            disableClick={false}
            isReadOnly={false}
            taskView={false}
            useDetailPopup={true}
            useCreationPopup={false}
            scheduleView={scheduleView}
            view={"week"}
            onBeforeCreateSchedule={(ev) => this.onBeforeCreateSchedule(ev)}
            onBeforeUpdateSchedule={(ev) => this.onBeforeUpdateSchedule(ev)}
            onBeforeDeleteSchedule={(ev) => this.onBeforeDeleteSchedule(ev)}
            week={this.state.week}
            month={this.state.month}
            template={template}
          />
        </div>
        {this.state.showInfoEdit &&
        <Modal className="edit-info-modal" centered={true} size="md" show={true} onHide={() => this.setState({showInfoEdit: false})}>
          <Modal.Header closeButton>
            <span>Edit Tags</span>
          </Modal.Header>
          <Modal.Body>
            <div className="edit-info-add">
              <input type="text" maxLength={100} placeholder="New tag name" value={this.state.tagText} onChange={(e) => this.setState({tagText: e.target.value})} />

              {!this.state.tagColor &&
              <button type="button" className="btn btn-default btn-sm calendar-btn">
                <FontAwesomeIcon className="calendar-icon" icon={faPalette} title="Pick a color" onClick={() => this.setState({showPickColor: true})} />
              </button>}
              {this.state.tagColor &&
              <div style={{borderColor: this.state.tagColor, backgroundColor: this.state.tagColor}} title="Change color" onClick={() => this.setState({showPickColor: true})}></div>}

              <button type="button" className="btn btn-default btn-sm calendar-btn" onClick={() => this.onClickNewTag()}>
                <FontAwesomeIcon className="calendar-icon" icon={faPlus} title="Add" />
              </button>
            </div>
            {this.state.calendarsInfo && this.state.calendarsInfo.map((info) =>
              <div key={info.id} className="edit-info-tag" style={{borderColor: info.bgColor, backgroundColor: info.bgColor}}>
                <span>{info.name}</span>
                {info.id !== "1" && 
                <FontAwesomeIcon className="calendar-icon" title="Delete" onClick={() => this.onDeleteInfo(info.id, info.name)} icon={faTimes} />}
              </div>
            )}
          </Modal.Body>
        </Modal>}
        {this.state.showPickColor &&
        <Modal className="pick-color-modal" centered={true} size="xs" show={true} onHide={() => this.setState({showPickColor: false})}>
          <CirclePicker onChangeComplete={(color) => this.setState({tagColor: color.hex, showPickColor: false})} />
        </Modal>}
        {this.state.showScheduleModal &&
        <ScheduleModal 
          actionText={this.state.creatingSchedule ? "Save" : "Update"}
          calendarsInfo={this.state.calendarsInfo}
          schedule={this.state.creatingSchedule ? this.state.creatingSchedule : this.state.editingSchedule} 
          onClose={() => this.setState({showScheduleModal: false, editingSchedule: null, creatingSchedule: null})}
          onSave={(schedule) => this.handleSchedule(schedule)} />}
      </div>
    )
  }
}
export default withRouter(CalendarPage)
