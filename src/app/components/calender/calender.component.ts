import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingService } from '../../pages/training/services/training.service';


export interface Meeting {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: number;
  color?: string;
  status?: 'scheduled' | 'cancelled' | 'tentative';
  raw?: any;
}

type CalendarView = 'month' | 'week' | 'day';

@Component({
  selector: 'app-calender',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.css']
})
export class CalenderComponent {
  @Input() meetings: Meeting[] = [];

  view: CalendarView = 'month';
  currentDate: Date = new Date();
  selectedDate: Date = new Date();
  today: Date = new Date();
  selectedMeeting: Meeting | null = null;
  weekStartsOn: 0 | 1 = 1; // 1 = Monday, 0 = Sunday

  // Month view grid
  weeks: { days: { date: Date; inCurrentMonth: boolean; meetings: Meeting[] }[] }[] = [];

  // Day/Week helpers
  hours: number[] = Array.from({ length: 24 }, (_, i) => i);
  minutePixelRatio = 0.6667; // 40px per hour => 0.6667px per minute

  constructor(private trainingService: TrainingService) {}
  ngOnInit(): void {
    if (this.meetings.length > 0) {
      this.buildMonth();
      return;
    }
    this.loadScheduledTrainings();
  }

  // ----- Navigation -----
  setView(view: CalendarView): void {
    this.view = view;
    if (view === 'month') {
      this.buildMonth();
    }
  }

  gotoToday(): void {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.refresh();
  }

  previous(): void {
    if (this.view === 'month') {
      const d = new Date(this.currentDate);
      d.setMonth(d.getMonth() - 1);
      this.currentDate = d;
      this.buildMonth();
    } else if (this.view === 'week') {
      const d = new Date(this.currentDate);
      d.setDate(d.getDate() - 7);
      this.currentDate = d;
    } else {
      const d = new Date(this.currentDate);
      d.setDate(d.getDate() - 1);
      this.currentDate = d;
      this.selectedDate = d;
    }
  }

  next(): void {
    if (this.view === 'month') {
      const d = new Date(this.currentDate);
      d.setMonth(d.getMonth() + 1);
      this.currentDate = d;
      this.buildMonth();
    } else if (this.view === 'week') {
      const d = new Date(this.currentDate);
      d.setDate(d.getDate() + 7);
      this.currentDate = d;
    } else {
      const d = new Date(this.currentDate);
      d.setDate(d.getDate() + 1);
      this.currentDate = d;
      this.selectedDate = d;
    }
  }

  onDatePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.value) return;
    const picked = new Date(input.value);
    this.currentDate = picked;
    this.selectedDate = picked;
    this.refresh();
  }

  onMonthPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (!value) return;
    const [yearStr, monthStr] = value.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1; // 0-based
    if (isNaN(year) || isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return;

    const picked = new Date(year, monthIndex, 1);
    this.currentDate = picked;
    this.selectedDate = picked;
    this.refresh();
  }

  refresh(): void {
    if (this.view === 'month') this.buildMonth();
  }

  // ----- Month grid -----
  buildMonth(): void {
    const firstOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const start = this.startOfCalendar(firstOfMonth);
    const days: { date: Date; inCurrentMonth: boolean; meetings: Meeting[] }[] = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const inCurrentMonth = date.getMonth() === this.currentDate.getMonth();
      days.push({
        date,
        inCurrentMonth,
        meetings: this.getMeetingsOnDate(date)
      });
    }

    // split into weeks of 7
    this.weeks = [];
    for (let w = 0; w < 6; w++) {
      this.weeks.push({ days: days.slice(w * 7, w * 7 + 7) });
    }
  }

  startOfCalendar(date: Date): Date {
    // Start at Monday or Sunday before the first day of the month
    const d = new Date(date);
    const day = d.getDay(); // 0(Sun) - 6(Sat)
    const offset = this.weekStartsOn === 1 ? ((day + 6) % 7) : day; // convert to Monday-start offset
    d.setDate(d.getDate() - offset);
    return d;
  }

  getWeekDays(base: Date): Date[] {
    const start = this.getStartOfWeek(base);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }

  getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = this.weekStartsOn === 1 ? ((day + 6) % 7) : day; // days since week start
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  getEndOfWeek(date: Date): Date {
    const start = this.getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  // ----- Selection -----
  selectDate(date: Date): void {
    this.selectedDate = new Date(date);
    this.selectedMeeting = null;
  }

  selectMeeting(meeting: Meeting): void {
    this.selectedMeeting = meeting;
  }

  clearSelection(): void {
    this.selectedMeeting = null;
  }

  // ----- Data helpers -----
  sameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  getMeetingsOnDate(date: Date): Meeting[] {
    return this.meetings
      .filter((m) => this.occursOnDate(m, date))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  }

  getDayEvents(date: Date): Meeting[] {
    return this.getMeetingsOnDate(date);
  }

  private occursOnDate(m: Meeting, date: Date): boolean {
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = new Date(m.start.getFullYear(), m.start.getMonth(), m.start.getDate());
    const end = new Date(m.end.getFullYear(), m.end.getMonth(), m.end.getDate());
    return day.getTime() >= start.getTime() && day.getTime() <= end.getTime();
  }

  toMinutes(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
  }

  // ----- TrackBy -----
  trackByDay(_: number, day: { date: Date }): string {
    return day.date.toDateString();
  }

  trackByMeeting(_: number, m: Meeting): string {
    return m.id;
  }

  // ----- Formatting -----
  formatTime(d: Date): string {
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const hh = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? 'AM' : 'PM';
    return `${hh}:${m} ${ampm}`;
  }

  formatDateOnly(d: Date | string | null | undefined): string {
    if (!d) return '';
    const date = typeof d === 'string' ? new Date(d) : d;
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  }

  normalizeUrl(u: any): string | null {
    if (!u) return null;
    const s = String(u).trim();
    const cleaned = s.replace(/^`+|`+$/g, '').trim();
    return cleaned || null;
  }

 
  private loadScheduledTrainings(): void {
    this.trainingService.getAllScheduledTrainings().subscribe({
      next: (res: any) => {
        const items = Array.isArray(res) ? res : res?.data ?? [];
        this.meetings = this.mapTrainingsToMeetings(items);
        this.buildMonth();
      },
      error: () => {
        // Fallback to sample data if API fails
        this.buildMonth();
      }
    });
  }

  private mapTrainingsToMeetings(trainings: any[]): Meeting[] {
    return trainings
      .map((t: any) => {
        const start = t.startDate ? new Date(t.startDate) : (t.createDate ? new Date(t.createDate) : null);
        if (!start || isNaN(start.getTime())) {
          return null;
        }
        let end: Date | null = t.endDate ? new Date(t.endDate) : null;
        if (!end || isNaN(end.getTime())) {
          if (t.duration && typeof t.duration === 'number' && (t.durationType || '').toLowerCase() === 'days') {
            end = new Date(start);
            end.setDate(end.getDate() + t.duration);
          } else {
            end = new Date(start);
            end.setHours(end.getHours() + 1);
          }
        }
        const locationParts = [t.venueBlock, t.venueDistrict, t.venueState].filter(Boolean);
        return {
          id: String(t.id ?? Math.random()),
          title: t.trainingTitle ?? 'Training',
          start,
          end: end!,
          location: locationParts.length ? locationParts.join(', ') : t.venueAddress ?? undefined,
          attendees: t.traineeCount ?? undefined,
          color: this.colorForStatus(t.status, t.modeOfTraining),
          status: this.statusToMeetingStatus(t.status),
          raw: t
        } as Meeting;
      })
      .filter((m: Meeting | null) => !!m) as Meeting[];
  }

  private colorForStatus(status?: string, mode?: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('approved')) return '#16a34a';
    if (s.includes('reject')) return '#ef4444';
    // Mode hint
    const m = (mode || '').toLowerCase();
    if (m === 'online') return '#06b6d4';
    if (m === 'offline') return '#4f46e5';
    return '#6366f1';
  }

  private statusToMeetingStatus(status?: string): 'scheduled' | 'cancelled' | 'tentative' {
    const s = (status || '').toLowerCase();
    if (s.includes('reject')) return 'cancelled';
    if (s.includes('approved')) return 'scheduled';
    return 'tentative';
  }

// Modal state for day trainings
showDayModal: boolean = false;
dayModalDate: Date | null = null;
dayModalTrainings: any[] = [];


// Open modal with all trainings for the selected date
openDayModal(date: Date): void {
  this.dayModalDate = new Date(date);
  const events = this.getDayEvents(this.dayModalDate);
  this.dayModalTrainings = events.map(e => e.raw ?? null).filter((t: any) => !!t);
  this.showDayModal = true;
}

onCloseDayModal(): void {
  this.showDayModal = false;
  this.dayModalTrainings = [];
  this.dayModalDate = null;
}

}
