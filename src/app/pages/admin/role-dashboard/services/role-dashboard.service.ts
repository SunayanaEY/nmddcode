import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface RoleDashboardStats {
  trainingScheduleApproved: number;
  trainingScheduleRejected: number;
  traineesApproved: number;
  traineesRejected: number;
}

export interface RoleDashboardResponse {
  success: boolean;
  message: string;
  data: RoleDashboardStats;
  statusCode: number;
}

@Injectable({
  providedIn: 'root'
})
export class RoleDashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get role-specific dashboard statistics
   * @param stateId - Optional state ID for filtering
   * @param districtId - Optional district ID for filtering
   * @returns Observable<RoleDashboardResponse>
   */
  getRoleDashboardStats(stateId?: number, districtId?: number): Observable<RoleDashboardResponse> {
    let params = new HttpParams();
    
    if (stateId) {
      params = params.set('stateId', stateId.toString());
    }
    if (districtId) {
      params = params.set('districtId', districtId.toString());
    }

    return this.http.get<RoleDashboardResponse>(`${this.apiUrl}dashboard/role-stats`, { params });
  }

  /**
   * Get training schedule statistics (approved/rejected)
   * @param stateId - Optional state ID for filtering
   * @param districtId - Optional district ID for filtering
   * @returns Observable with training schedule counts
   */
  getTrainingScheduleStats(stateId?: number, districtId?: number): Observable<any> {
    let params = new HttpParams();
    
    if (stateId) {
      params = params.set('stateId', stateId.toString());
    }
    if (districtId) {
      params = params.set('districtId', districtId.toString());
    }

    return this.http.get<any>(`${this.apiUrl}training/schedule-stats`, { params });
  }

  /**
   * Get trainee statistics (approved/rejected)
   * @param stateId - Optional state ID for filtering
   * @param districtId - Optional district ID for filtering
   * @returns Observable with trainee counts
   */
  getTraineeStats(stateId?: number, districtId?: number): Observable<any> {
    let params = new HttpParams();
    
    if (stateId) {
      params = params.set('stateId', stateId.toString());
    }
    if (districtId) {
      params = params.set('districtId', districtId.toString());
    }

    return this.http.get<any>(`${this.apiUrl}trainees/stats`, { params });
  }
}