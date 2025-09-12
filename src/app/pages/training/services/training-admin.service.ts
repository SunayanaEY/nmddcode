import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface TrainingInstitute {
  id: string;
  trainingInstituteName: string;
  roleId: number;
  scheme: string;
  state: string;
  district: string;
  block: string;
  registrationId: string;
  contactPersonName: string;
  designation: string;
  contactNumber: string;
  emailId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewRegisteredInstitute {
  id: string;
  trainingInstituteName: string;
  roleId: number;
  state: string;
  stateId: number;
  district: string;
  districtId: number;
  registrationId: string;
  contactPersonName: string;
  designation: string;
  contactNumber: string;
  emailId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  status: string;
  userId: number;
  instituteImageUrl: string;
}

export interface NotificationItem {
  id: number;
  userId: number;
  userRole: string | null;
  title: string;
  description: string;
  createdAt: string;
  readAt: string | null;
  read: boolean;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: NotificationItem[];
  statusCode: number;
}

export interface MarkAsSeenResponse {
  success: boolean;
  message: string;
  data: boolean;
  statusCode: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${this.getToken()}`
      })
    };
  }

  // Get all training institutes
  getTrainingInstitutes(): Observable<TrainingInstitute[]> {
    return this.http.get<{success: boolean, message: string, data: TrainingInstitute[], statusCode: number}>(
      `${this.apiUrl}training/trainingInstitutes`,
      this.getHttpOptions()
    ).pipe(
      map(response => response.data)
    );
  }

  // Get training institute by ID
  getTrainingInstituteById(id: string): Observable<TrainingInstitute> {
    return this.http.get<TrainingInstitute>(
      `${this.apiUrl}training/registerInstitute/${id}`,
      this.getHttpOptions()
    );
  }

  // Create new training institute
  createTrainingInstitute(institute: Partial<TrainingInstitute>): Observable<TrainingInstitute> {
    return this.http.post<TrainingInstitute>(
      `${this.apiUrl}training/registerInstitute`,
      institute,
      this.getHttpOptions()
    );
  }

  // Update training institute
  updateTrainingInstitute(formData: FormData): Observable<TrainingInstitute> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Don't set Content-Type for FormData, let browser set it with boundary
    });
    
    return this.http.post<TrainingInstitute>(
      `${this.apiUrl}api/auth/registerInstitute`,
      formData,
      { headers }
    );
  }

  // Delete training institute
  deleteTrainingInstitute(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}training/registerInstitute/${id}`,
      this.getHttpOptions()
    );
  }

  // Toggle institute status (if API supports it)
  toggleInstituteStatus(id: string): Observable<TrainingInstitute> {
    return this.http.patch<TrainingInstitute>(
      `${this.apiUrl}training/registerInstitute/${id}/toggle-status`,
      {},
      this.getHttpOptions()
    );
  }

  // Toggle active/inactive status
  toggleActiveInactive(id: string): Observable<{success: boolean, message: string, data: {message: string}, statusCode: number}> {
    return this.http.get<{success: boolean, message: string, data: {message: string}, statusCode: number}>(
      `${this.apiUrl}training/activeInactive/${id}`,
      this.getHttpOptions()
    );
  }

  // Get notifications
  getNotifications(): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(
      `${this.apiUrl}notification/list`,
      this.getHttpOptions()
    );
  }

  // Mark notifications as seen
  markNotificationsAsSeen(notificationIds: number[]): Observable<MarkAsSeenResponse> {
    return this.http.post<MarkAsSeenResponse>(
      `${this.apiUrl}notification/markAsSeen`,
      notificationIds,
      this.getHttpOptions()
    );
  }

  // Approve trainees
  approveTrainees(payload: {
    trainingInstituteId: string;
    trainingId: number;
    traineeIds: number[];
  }): Observable<{success: boolean, message: string, data: any, statusCode: number}> {
    return this.http.post<{success: boolean, message: string, data: any, statusCode: number}>(
      `${this.apiUrl}api/trainees/approve-trainees`,
      payload,
      this.getHttpOptions()
    );
  }

  // Reject trainees
  rejectTrainees(payload: {
    trainingInstituteId: string;
    trainingId: number;
    traineeIds: number[];
    rejectionRemarks: string;
  }): Observable<{success: boolean, message: string, data: any, statusCode: number}> {
    return this.http.post<{success: boolean, message: string, data: any, statusCode: number}>(
      `${this.apiUrl}api/trainees/reject-trainees`,
      payload,
      this.getHttpOptions()
    );
  }

  verifyTrainees(ids:any[]): Observable<{success: boolean, message: string, data: any, statusCode: number}> {
    return this.http.post<{success: boolean, message: string, data: any, statusCode: number}>(
      `${this.apiUrl}api/trainees/verify-trainees`,
      ids,
      this.getHttpOptions()
    );
  }
  cancelTrainees(payload: {
   
    traineeIds: number[];
    cancelRemarks: string;
  }): Observable<{success: boolean, message: string, data: any, statusCode: number}>  {
    return this.http.post<{success: boolean, message: string, data: any, statusCode: number}>(
      `${this.apiUrl}api/trainees/cancel-trainees`,
      payload,
      this.getHttpOptions()
    );
  }
  sendTrainingToValidate(trainingId: string): Observable<{success: boolean, message: string, data: any, statusCode: number}>  {
    return this.http.get<{success: boolean, message: string, data: any, statusCode: number}>(
      `${this.apiUrl}training/validateByInstituteHead/${trainingId}`,
      this.getHttpOptions()
    );
  }
  rejectTrainingSchedule(trainingId: string): Observable<{success: boolean, message: string, data: any, statusCode: number}>  {
    return this.http.get<{success: boolean, message: string, data: any, statusCode: number}>(
      `${this.apiUrl}training/rejectTrainingSchedule/${trainingId}`,
      this.getHttpOptions()
    );
  }


  approveTrainingSchedule(trainingId: string): Observable<{success: boolean, message: string, data: any, statusCode: number}>  {
    return this.http.get<{success: boolean, message: string, data: any, statusCode: number}>(
      `${this.apiUrl}training/approveTrainingSchedule/${trainingId}`,
      this.getHttpOptions()
    );
  }


}