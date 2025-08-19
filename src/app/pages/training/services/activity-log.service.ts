import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface ActivityLogApiItem {
  id: number;
  userId: number;
  action: string;
  description: string;
  createdAt: string;
}

export interface ActivityLogApiResponse {
  success: boolean;
  message: string;
  data: ActivityLogApiItem[];
  statusCode: number;
}

export interface ActivityLogItem {
  id: string;
  type: string;
  title: string;
  description: string;
  user: string;
  timestamp: Date;
  status: string;
  details?: { [key: string]: string | undefined };
}

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Fetch activity logs from API with date range filter
   * @param fromDate - Start date in YYYY-MM-DD format
   * @param toDate - End date in YYYY-MM-DD format
   * @returns Observable<ActivityLogItem[]>
   */
  getActivityLogs(fromDate?: string, toDate?: string): Observable<ActivityLogItem[]> {
    let params = new HttpParams();
    
    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    
    if (toDate) {
      params = params.set('toDate', toDate);
    }

    return this.http.get<ActivityLogApiResponse>(`${this.baseUrl}activity/logsList`, { params })
      .pipe(
        map(response => this.transformApiDataToActivityLogs(response.data))
      );
  }

  /**
   * Transform API response data to component-friendly format
   * @param apiData - Raw API response data
   * @returns ActivityLogItem[]
   */
  private transformApiDataToActivityLogs(apiData: ActivityLogApiItem[]): ActivityLogItem[] {
    return apiData.map(item => ({
      id: item.id.toString(),
      type: this.getTypeFromAction(item.action),
      title: this.getTitleFromAction(item.action),
      description: item.description,
      user: `User ${item.userId}`, // You might want to fetch user details separately
      timestamp: new Date(item.createdAt),
      status: this.getStatusFromAction(item.action),
      details: {
        action: item.action,
        userId: item.userId.toString()
      }
    }));
  }

  /**
   * Get activity type based on action
   * @param action - API action string
   * @returns string
   */
  private getTypeFromAction(action: string): string {
    switch (action) {
      case 'APPROVE_TRAINEES':
        return 'approval';
      case 'REJECT_TRAINEES':
        return 'rejection';
      case 'UPLOAD_TRAINING':
        return 'upload';
      case 'UPDATE_TRAINING':
        return 'update';
      case 'DELETE_TRAINING':
        return 'delete';
      default:
        return 'other';
    }
  }

  /**
   * Get activity title based on action
   * @param action - API action string
   * @returns string
   */
  private getTitleFromAction(action: string): string {
    switch (action) {
      case 'APPROVE_TRAINEES':
        return 'Trainee Approved';
      case 'REJECT_TRAINEES':
        return 'Trainee Rejected';
      case 'UPLOAD_TRAINING':
        return 'Training Uploaded';
      case 'UPDATE_TRAINING':
        return 'Training Updated';
      case 'DELETE_TRAINING':
        return 'Training Deleted';
      default:
        return 'Activity Logged';
    }
  }

  /**
   * Get activity status based on action
   * @param action - API action string
   * @returns string
   */
  private getStatusFromAction(action: string): string {
    switch (action) {
      case 'APPROVE_TRAINEES':
        return 'approved';
      case 'REJECT_TRAINEES':
        return 'rejected';
      default:
        return 'others';
    }
  }
}