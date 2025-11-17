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
  stateHeadContactPerson: string;
  stateHeadContact: string;
  stateHeadEmail: string;
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
  stateHeadContactPerson: string;
  stateHeadContact: string;
  stateHeadEmail: string;
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
  providedIn: 'root',
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
      }),
    };
  }

  // Get all training institutes
  getTrainingInstitutes(): Observable<any[]> {
    return this.http
      .get<{
        success: boolean;
        message: string;
        data: any[];
        statusCode: number;
      }>(`${this.apiUrl}training/trainingInstitutes`, this.getHttpOptions())
      .pipe(map((response) => response.data));
  }
  getTrainingInstitutesOrganization(id: any): Observable<TrainingInstitute[]> {
    return this.http
      .get<{
        success: boolean;
        message: string;
        data: TrainingInstitute[];
        statusCode: number;
      }>(`${this.apiUrl}organization/institutes/${id}`, this.getHttpOptions())
      .pipe(map((response) => response.data));
  }

  // Get all organization data
  getOrganizationsData(): Observable<any> {
    return this.http
      .get<{
        success: boolean;
        message: string;
        data: any[];
        statusCode: number;
      }>(`${this.apiUrl}organization/getAll`, this.getHttpOptions())
      .pipe(map((response) => response.data));
  }
  getOrganizationDataById(id: any): Observable<any> {
    return this.http
      .get<{
        success: boolean;
        message: string;
        data: any[];
        statusCode: number;
      }>(`${this.apiUrl}organization/getById/${id}`, this.getHttpOptions())
      .pipe(map((response) => response.data));
  }
  getAllOrganization(): Observable<any> {
    return this.http
      .get<{
        success: boolean;
        message: string;
        data: any[];
        statusCode: number;
      }>(`${this.apiUrl}organization/getAll`, this.getHttpOptions())
      .pipe(map((response) => response.data));
  }
  // Get training institute by ID
  getTrainingInstituteById(id: string): Observable<TrainingInstitute> {
    return this.http.get<TrainingInstitute>(
      `${this.apiUrl}training/registerInstitute/${id}`,
      this.getHttpOptions()
    );
  }

  // Create new training institute
  createTrainingInstitute(
    institute: Partial<TrainingInstitute>
  ): Observable<TrainingInstitute> {
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
      Authorization: `Bearer ${token}`,
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

  // Delete Organization
  deleteOrganization(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}organization/delete/${id}`,
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
  toggleActiveInactive(id: string): Observable<{
    success: boolean;
    message: string;
    data: { message: string };
    statusCode: number;
  }> {
    return this.http.get<{
      success: boolean;
      message: string;
      data: { message: string };
      statusCode: number;
    }>(`${this.apiUrl}training/activeInactive/${id}`, this.getHttpOptions());
  }

  // Get notifications
  getNotifications(): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(
      `${this.apiUrl}notification/list`,
      this.getHttpOptions()
    );
  }

  // Mark notifications as seen
  markNotificationsAsSeen(
    notificationIds: number[]
  ): Observable<MarkAsSeenResponse> {
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
  }): Observable<{
    success: boolean;
    message: string;
    data: any;
    statusCode: number;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: any;
      statusCode: number;
    }>(
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
  }): Observable<{
    success: boolean;
    message: string;
    data: any;
    statusCode: number;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: any;
      statusCode: number;
    }>(
      `${this.apiUrl}api/trainees/reject-trainees`,
      payload,
      this.getHttpOptions()
    );
  }

  verifyTrainees(ids: any[]): Observable<{
    success: boolean;
    message: string;
    data: any;
    statusCode: number;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: any;
      statusCode: number;
    }>(
      `${this.apiUrl}api/trainees/verify-trainees`,
      ids,
      this.getHttpOptions()
    );
  }
  cancelTrainees(payload: {
    traineeIds: number[];
    cancelRemarks: string;
  }): Observable<{
    success: boolean;
    message: string;
    data: any;
    statusCode: number;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: any;
      statusCode: number;
    }>(
      `${this.apiUrl}api/trainees/cancel-trainees`,
      payload,
      this.getHttpOptions()
    );
  }
  sendTrainingToValidate(trainingId: string): Observable<{
    success: boolean;
    message: string;
    data: any;
    statusCode: number;
  }> {
    return this.http.get<{
      success: boolean;
      message: string;
      data: any;
      statusCode: number;
    }>(
      `${this.apiUrl}training/validateByInstituteHead/${trainingId}`,
      this.getHttpOptions()
    );
  }
  // rejectTrainingSchedule(trainingId: string): Observable<{
  //   success: boolean;
  //   message: string;
  //   data: any;
  //   statusCode: number;
  // }> {
  //   return this.http.get<{
  //     success: boolean;
  //     message: string;
  //     data: any;
  //     statusCode: number;
  //   }>(
  //     `${this.apiUrl}training/rejectTrainingSchedule/${trainingId}`,
  //     this.getHttpOptions()
  //   );
  // }
  rejectTrainingSchedule(
    trainingId: string,
    rejectionRemark: string
  ): Observable<{
    success: boolean;
    message: string;
    data: any;
    statusCode: number;
  }> {
    const body = {
      trainingId,
      rejectionRemark,
    };

    return this.http.post<{
      success: boolean;
      message: string;
      data: any;
      statusCode: number;
    }>(
      `${this.apiUrl}training/rejectTrainingSchedule`,
      body,
      this.getHttpOptions()
    );
  }

  approveTrainingSchedule(trainingId: string): Observable<{
    success: boolean;
    message: string;
    data: any;
    statusCode: number;
  }> {
    return this.http.get<{
      success: boolean;
      message: string;
      data: any;
      statusCode: number;
    }>(
      `${this.apiUrl}training/approveTrainingSchedule/${trainingId}`,
      this.getHttpOptions()
    );
  }

  addTrainer(payload: {
    trainingHeadId: string;
    trainerName: string;
    mobile: string;
    email: string;
    expertiseIn: string;
  }): Observable<{
    success: boolean;
    message: string;
    data: any;
    statusCode: number;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: any;
      statusCode: number;
    }>(`${this.apiUrl}trainers/save`, payload, this.getHttpOptions());
  }

  // Get trainers by training head ID
  getTrainersByTrainingHead(trainingHeadId: string): Observable<{
    success: boolean;
    message: string;
    data: any[];
    statusCode: number;
  }> {
    return this.http.get<{
      success: boolean;
      message: string;
      data: any[];
      statusCode: number;
    }>(
      `${this.apiUrl}trainers/getByTrainingHead/${trainingHeadId}`,
      this.getHttpOptions()
    );
  }

  // Save or update state admin profile
  saveOrUpdateStateAdmin(payload: {
    contactPersonName: string;
    designation: string;
    contactNumber: string;
    emailId: string;
    password: string;
    stateId: number;
  }): Observable<{
    success: boolean;
    message: string;
    data: {
      id: string;
      contactNumber: string;
      emailId: string;
      userId: number;
      stateId: number;
      contactPersonName: string;
      designation: string;
      // ... other fields
    };
    statusCode: number;
  }> {
    return this.http.post<any>(
      `${this.apiUrl}states/saveOrUpdate`,
      payload,
      this.getHttpOptions()
    );
  }

  getAllActiveStateHeads(): Observable<{
    success: boolean;
    message: string;
    data: {
      id: string;
      contactNumber: string;
      emailId: string;
      userId: number;
      stateId: number;
      panNumber: string | null;
      contactPersonName: string;
      designation: string;
      isActive: boolean;
      validFrom: string;
      validTo: string | null;
      stateName: string | null;
      password: string | null;
    }[];
    statusCode: number;
  }> {
    return this.http.get<any>(
      `${this.apiUrl}states/AllActiveStateHeads`,
      this.getHttpOptions()
    );
  }

  getPreviousStateHeads(stateId: number): Observable<{
    success: boolean;
    message: string;
    data: {
      id: string;
      contactNumber: string;
      emailId: string;
      userId: number;
      stateId: number;
      panNumber: string | null;
      contactPersonName: string;
      designation: string;
      isActive: boolean;
      validFrom: string;
      validTo: string;
      stateName: string;
      password: string | null;
    }[];
    statusCode: number;
  }> {
    return this.http.get<any>(
      `${this.apiUrl}states/previousStateHead/${stateId}`,
      this.getHttpOptions()
    );
  }
}
