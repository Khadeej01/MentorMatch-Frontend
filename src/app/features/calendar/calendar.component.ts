import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
  @Input() events: EventInput[] = [];
  @Output() dateClick = new EventEmitter<any>();
  @Output() eventClick = new EventEmitter<any>();

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    weekends: true,
    editable: true, // Allows events to be dragged and resized
    selectable: true, // Allows selection of dates/times
    selectMirror: true,
    dayMaxEvents: true,
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: this.events // Bind events from input
  };

  ngOnInit(): void {
    // Update calendar options when events input changes
    this.calendarOptions.events = this.events;
  }

  handleDateClick(arg: any) {
    this.dateClick.emit(arg);
  }

  handleEventClick(arg: any) {
    this.eventClick.emit(arg);
  }
}
