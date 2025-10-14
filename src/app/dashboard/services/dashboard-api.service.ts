import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface TrainingDetailItem {
  id: number;
  name: string;
  gender: string;
  age: number;
  contactNumber: string;
  email: string;
  status: string;
  createdBy: string;
  updatedBy: string | null;
  createDate: string;
  updateDate: string;
  trainingId: number;
  uin: string;
  uploadType: string;
  uploadedBy: string | null;
  trainingInstituteId: string;
  rejectionRemarks: string | null;
  isDeleted: boolean;
  fatherName: string;
  dob: string;
}

export interface TrainingDetailsApiResponse {
  success: boolean;
  message: string;
  data: TrainingDetailItem[];
  statusCode: number;
}

export interface KpiData {
  type: string;
  count: number;
  data: TrainingDetailItem[];
}

export interface TrainingInstitute {
  id: string;
  trainingInstituteName: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get training details by type with optional state, district, and training institute filtering
   * @param type - Training type
   * @param stateId - Optional state ID for filtering
   * @param districtId - Optional district ID for filtering
   * @param trainingInstituteId - Optional training institute ID for filtering
   * @returns Observable<TrainingDetailsApiResponse>
   */
  getTrainingDetailsByType(type: string, stateId?: number, districtId?: number, trainingInstituteId?: string): Observable<TrainingDetailsApiResponse> {
    let params = new HttpParams();
    
    if (stateId) {
      params = params.set('stateId', stateId.toString());
    }
    
    if (districtId) {
      params = params.set('districtId', districtId.toString());
    }
    
    if (trainingInstituteId) {
      params = params.set('trainingInstituteId', trainingInstituteId);
    }
    
    return this.http.get<TrainingDetailsApiResponse>(`${this.apiUrl}public/dashboard/trainingDetails/${type}`, { params });
  }

  /**
   * Get KPI data for all types
   * @returns Observable<KpiData[]>
   */
  getAllKpiData(): Observable<KpiData[]> {
    const types = [
      'totalTrainingsConducted',
      'totalFarmersTrained', 
      'totalCertificatesApproved',
      'totalCertificatesIssued'
    ];

    // Create an array of observables for all API calls
    const apiCalls = types.map(type => 
      this.getTrainingDetailsByType(type).pipe(
        map(response => ({
          type,
          count: response.data.length,
          data: response.data
        }))
      )
    );

    // Return all API calls as a combined observable
    return new Observable<KpiData[]>(observer => {
      Promise.all(apiCalls.map(call => call.toPromise()))
        .then(results => {
          observer.next(results as KpiData[]);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   * Get count for a specific KPI type
   * @param type - The type of KPI to get count for
   * @returns Observable<number>
   */
  getKpiCount(type: string): Observable<number> {
    return this.getTrainingDetailsByType(type).pipe(
      map(response => response.data.length)
    );
  }

  /**
   * Fetch training institutes list
   * @param stateId - Optional state ID for filtering institutes by state
   * @returns Observable<TrainingInstitute[]>
   */
  getTrainingInstitutes(stateId?: number): Observable<TrainingInstitute[]> {
    let params = new HttpParams();
    
    if (stateId) {
      params = params.set('stateId', stateId.toString());
    }
    
    return this.http.get<TrainingInstitute[]>(`${this.apiUrl}trainingInstitutes/getInstituteList`, { params });
  }
}