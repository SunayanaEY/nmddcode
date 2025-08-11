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
  updateTrainingInstitute(id: string, institute: Partial<TrainingInstitute>): Observable<TrainingInstitute> {
    return this.http.put<TrainingInstitute>(
      `${this.apiUrl}training/registerInstitute/${id}`,
      institute,
      this.getHttpOptions()
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
}