import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface InstituteDetailItem {
  state: string;
  district: string;
  address: string;
  instituteName: string;
  instituteType: string;
  uin: string;
  instituteId: string;
  registrationValidity: Date;
  status: string;
}
export interface TrainingDetailItem {
  venueState: string;
  venueDistrict: string;
  trainingInstituteName: string;
  trainingTitle: string;
  trainingId: number;
  scheme: string;
  trainerName: string;
  numberOfTrainees: number;
  fromDate: Date;
  toDate: Date;
  duration: number;
  modeOfTraining: string;
}
export interface TraineesDetailItem {
  trainingId: number;
  trainingInstituteId: number;
  id: number;
  name: string;
  gender: string;
  age: number;
  contactNumber: number;
  email: string;
  uin: string;
  fatherName: string;
  dob: Date;
  uploadType: string;
  createDate: Date;
  approvedDate: Date;
  approvedBy: string;
  status: string;
}
export interface TraineesCertificateItem {
  trainingId: number;
  trainingInstituteId: number;
  id: number;
  name: string;
  gender: string;
  age: number;
  contactNumber: number;
  email: string;
  uin: string;
  fatherName: string;
  dob: Date;
  uploadType: string;
  createDate: Date;
  approvedDate: Date;
  approvedBy: string;
}

export interface TrainingDetailsApiResponse {
  success: boolean;
  message: string;
  data: any[];
  statusCode: number;
}

// export interface KpiData {
//   type: string;
//   count: number;
//   data: any[];
// }

export interface TrainingInstitute {
  id: string;
  trainingInstituteName: string;
}

@Injectable({
  providedIn: 'root',
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
  getTrainingDetailsByType(
    type: string,
    stateId?: number,
    districtId?: number,
    trainingInstituteId?: string,
    organizationId?: number,
    instituteType?: string
  ): Observable<TrainingDetailsApiResponse> {
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

    if (organizationId) {
      params = params.set('organizationId', organizationId.toString());
    }

    if (instituteType) {
      params = params.set('trainingInstituteType', instituteType);
    }

    return this.http.get<TrainingDetailsApiResponse>(
      `${this.apiUrl}public/dashboard/trainingDetails/${type}`,
      { params }
    );
  }

  /**
   * Get KPI data for all types
   * @param stateId - Optional state ID for filtering
   * @param districtId - Optional district ID for filtering
   * @param trainingInstituteId - Optional training institute ID for filtering
   * @param organizationId - Optional organization ID for filtering
   * @param instituteType - Optional institute type for filtering
   * @returns Observable<KpiData[]>
   */
  getAllKpiData(
    stateId?: number,
    districtId?: number,
    trainingInstituteId?: string,
    organizationId?: number,
    instituteType?: string
  ): Observable<any[]> {
    const types = [
      'totalTrainingsConducted',
      'totalFarmersTrained',
      'totalCertificatesApproved',
      // 'totalCertificatesIssued',
    ];

    // Create an array of observables for all API calls
    const apiCalls = types.map((type) =>
      this.getTrainingDetailsByType(
        type,
        stateId,
        districtId,
        trainingInstituteId,
        organizationId,
        instituteType
      ).pipe(
        map((response) => ({
          type,
          count: response.data.length,
          data: response.data,
        }))
      )
    );

    // Return all API calls as a combined observable
    return new Observable<any[]>((observer) => {
      Promise.all(apiCalls.map((call) => call.toPromise()))
        .then((results) => {
          observer.next(results as any[]);
          observer.complete();
        })
        .catch((error) => {
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
      map((response) => response.data.length)
    );
  }

  /**
   * Fetch training institutes list
   * @param stateId - Optional state ID for filtering institutes by state
   * @returns Observable<TrainingInstitute[]>
   */
  getTrainingInstitutes(
    stateId?: number,
    organizationId?: number
  ): Observable<TrainingInstitute[]> {
    let params = new HttpParams();

    if (stateId) {
      params = params.set('stateId', stateId.toString());
    }

    if (organizationId) {
      params = params.set('organizationId', organizationId.toString());
    }

    return this.http.get<TrainingInstitute[]>(
      `${this.apiUrl}trainingInstitutes/getInstituteList`,
      { params }
    );
  }
}
