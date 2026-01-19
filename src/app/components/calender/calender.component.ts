import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingService } from '../../pages/training/services/training.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../pages/training/services/training-admin.service';


export interface Meeting {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: number;
  color?: string;
  status?: string;
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
  role: string = '';
  showCreateButton: boolean = false;
  userRole: number | null = null;
  constructor(
    private trainingService: TrainingService,
    private router: Router,
    private authService: AuthService,
    private adminService: AdminService
  ) {}
  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.showCreateButton = this.authService.hasRole([4]);
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

  async toBlobUrl(fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.adminService.downloadInstituteImage(fileName).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          resolve(url);
        },
        error: (err) => {
          console.error('Error fetching file blob:', err);
          reject(err);
        },
      });
    });
  }

  async prepareScheduleForSelectedMeeting() {
    if (!this.selectedMeeting?.raw) return;
    
    // If already loaded or loading, skip
    if (this.selectedMeeting.raw.scheduleUrl || this.selectedMeeting.raw.isLoadingSchedule) return;

    if (this.selectedMeeting.raw.trainingScheduleDetail) {
      try {
        this.selectedMeeting.raw.isLoadingSchedule = true;
        this.selectedMeeting.raw.scheduleUrl = await this.toBlobUrl(
          this.selectedMeeting.raw.trainingScheduleDetail
        );
      } catch (error) {
        console.error('Failed to load training schedule:', error);
        this.selectedMeeting.raw.scheduleUrl = null;
      } finally {
        this.selectedMeeting.raw.isLoadingSchedule = false;
      }
    }
  }

  selectMeeting(meeting: Meeting): void {
    this.selectedMeeting = meeting;
    this.prepareScheduleForSelectedMeeting();
  }

  clearSelection(): void {
    this.selectedMeeting = null;
  }
  createNewTraining(): void {
    this.router.navigate(['/admin/training-certificate-generation']);
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
          status: t.status ?? undefined,
          raw: t
        } as Meeting;
      })
      .filter((m: Meeting | null) => !!m) as Meeting[];
  }

  // Explicit colors for provided statuses + sensible fallbacks
  private readonly STATUS_COLOR_MAP: Record<string, string> = {
    'new': '#3b82f6',
    'approved by institute head': '#16a34a',
    'rejected by institute head': '#ef4444',
    'rejected by state head': '#ef4444',
    'approved by organization': '#16a34a',
    'rejected by organization': '#ef4444',
    'trainees details uploaded': '#f59e0b',
    'pending for state head approval': '#a855f7',
    'certificate approved / rejected': '#6366f1'
  };

  public colorForStatus(status?: string, mode?: string): string {
    const s = (status || '').trim().toLowerCase();
    const mapped = this.STATUS_COLOR_MAP[s];
    if (mapped) return mapped;

    // Generic fallbacks if API adds new statuses
    if (s.includes('approved')) return '#16a34a';
    if (s.includes('reject')) return '#ef4444';
    if (s.includes('pending')) return '#a855f7';
    if (s.includes('upload')) return '#f59e0b';

    // Mode hint
    const m = (mode || '').toLowerCase();
    if (m === 'online') return '#06b6d4';
    if (m === 'offline') return '#4f46e5';
    return '#6366f1';
  }

  public get legendItems(): { label: string; color: string }[] {
    return Object.entries(this.STATUS_COLOR_MAP).map(([label, color]) => ({ label, color }));
  }

  // Convert a hex/rgb color to an rgba string with provided alpha
  private toRgba(color: string, alpha: number): string {
    if (!color) return `rgba(99,102,241,${alpha})`; // indigo fallback
    const c = color.trim();
    // rgb(...) -> rgba(..., alpha)
    const rgbMatch = c.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (rgbMatch) {
      const r = Number(rgbMatch[1]);
      const g = Number(rgbMatch[2]);
      const b = Number(rgbMatch[3]);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    // rgba(...) -> normalize last component to alpha provided
    const rgbaMatch = c.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*\)/i);
    if (rgbaMatch) {
      const r = Number(rgbaMatch[1]);
      const g = Number(rgbaMatch[2]);
      const b = Number(rgbaMatch[3]);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    // #rgb or #rrggbb
    if (c.startsWith('#')) {
      let hex = c.slice(1);
      if (hex.length === 3) {
        hex = hex.split('').map((ch) => ch + ch).join('');
      }
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r},${g},${b},${alpha})`;
      }
    }
    // fallback
    return `rgba(99,102,241,${alpha})`;
  }

  // Build a subtle overlay background using the status color
  public overlayBackgroundForStatus(status?: string, mode?: string, alpha: number = 0.08): string {
    const base = this.colorForStatus(status, mode);
    const tint = this.toRgba(base, alpha);
    return `linear-gradient(0deg, ${tint}, ${tint}), #fff`;
  }

// Modal state for day trainings
  showDayModal: boolean = false;
  dayModalDate: Date | null = null;
  dayModalTrainings: any[] = [];

  async prepareScheduleForDayModalItems() {
    for (const t of this.dayModalTrainings) {
      if (t.trainingScheduleDetail && !t.scheduleUrl && !t.isLoadingSchedule) {
        t.isLoadingSchedule = true;
        try {
          t.scheduleUrl = await this.toBlobUrl(t.trainingScheduleDetail);
        } catch (error) {
          console.error('Failed to load training schedule for item:', error);
          t.scheduleUrl = null;
        } finally {
          t.isLoadingSchedule = false;
        }
      }
    }
  }

  // Open modal with all trainings for the selected date
  openDayModal(date: Date): void {
    this.dayModalDate = new Date(date);
    const events = this.getDayEvents(this.dayModalDate);
    this.dayModalTrainings = events.map(e => e.raw ?? null).filter((t: any) => !!t);
    this.showDayModal = true;
    this.prepareScheduleForDayModalItems();
  }

  onCloseDayModal(): void {
  this.showDayModal = false;
  this.dayModalTrainings = [];
  this.dayModalDate = null;
}

  navigateToApprovedRejectedTrainings(): void {
    if (this.authService.hasRole([4])) {
      this.router.navigate(['/admin/approvedrejectedTrainings']);
    }
  }

  navigateToAllTrainingsAdmin(): void {
    if (this.authService.hasRole([3])) {
      this.router.navigate(['/admin/all-trainings-admin']);
    }
  }

}
