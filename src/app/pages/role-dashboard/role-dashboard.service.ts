import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RoleDashboardStats {
  totalTrainingsApproved: number;
  totalTrainingsRejected: number;
  totalTraineesApproved: number;
  totalTraineesRejected: number;
  recommendedTrainees: number;
}

export interface TrainingScheduleStats {
  approved: number;
  rejected: number;
}

export interface TraineeStats {
  approved: number;
  rejected: number;
}

export interface TrainerCountResponse {
  success: boolean;
  message: string;
  data: {
    "trainer Count": number;
  };
  statusCode: number;
}

export interface TrainingData {
  id: number;
  trainingTitle: string;
  schemeId: number;
  trainingInstituteName: string;
  trainingInstituteId: string;
  trainingManagerId: string;
  trainerId: number;
  venueStateId: number;
  venueDistrictId: number;
  venueBlock: string;
  startDate: string;
  endDate: string;
  duration: number;
  durationType: string;
  trainingDescription: string;
  modeOfTraining: string;
  createDate: string;
  status: string;
  logoPath1: string;
  logoPath2: string | null;
  logoPath3: string | null;
  trainingTypeId: number;
  updatedBy: string;
  updateDate: string;
  scheme: string;
  trainingType: string;
  venueState: string;
  venueDistrict: string;
  trainerName: string;
  signatures: any;
}

export interface TrainingDataResponse {
  success: boolean;
  message: string;
  data: TrainingData[];
  statusCode: number;
}

export interface TraineeData {
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
  trainingName: string;
  trainingInstituteName: string;
}

export interface TraineeDataResponse {
  success: boolean;
  message: string;
  data: TraineeData[];
  statusCode: number;
}

export interface TrainerData {
  id: number;
  trainerName: string;
  mobile: number;
  email: string;
  expertiseIn: string;
  trainingHeadId: string;
}

export interface TrainerDataResponse {
  success: boolean;
  message: string;
  data: TrainerData[];
  statusCode: number;
}

export interface TrainingTypeData {
  trainingTypeId: number;
  trainingTypeName: string;
  percentage: number;
  totalTrainings: number;
}

export interface TrainingTypeResponse {
  success: boolean;
  message: string;
  data: TrainingTypeData[];
  statusCode: number;
}

@Injectable({
  providedIn: 'root'
})
export class RoleDashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get role-specific dashboard statistics
   */
  getRoleDashboardStats(stateId?: string, districtId?: string): Observable<RoleDashboardStats> {
    let params = new HttpParams();
    
    if (stateId) {
      params = params.set('stateId', stateId);
    }
    
    if (districtId) {
      params = params.set('districtId', districtId);
    }

    return this.http.get<RoleDashboardStats>(`${this.apiUrl}/dashboard/role-stats`, { params });
  }

  /**
   * Get training schedule statistics (approved/rejected)
   */
  getTrainingScheduleStats(stateId?: string, districtId?: string): Observable<TrainingScheduleStats> {
    let params = new HttpParams();
    
    if (stateId) {
      params = params.set('stateId', stateId);
    }
    
    if (districtId) {
      params = params.set('districtId', districtId);
    }

    return this.http.get<TrainingScheduleStats>(`${this.apiUrl}/training-schedules/stats`, { params });
  }

  /**
   * Get trainee statistics (approved/rejected)
   */
  getTraineeStats(stateId?: string, districtId?: string): Observable<TraineeStats> {
    let params = new HttpParams();
    
    if (stateId) {
      params = params.set('stateId', stateId);
    }
    
    if (districtId) {
      params = params.set('districtId', districtId);
    }

    return this.http.get<TraineeStats>(`${this.apiUrl}/trainees/stats`, { params });
  }

  /**
   * Get approved training schedules count
   */
  getApprovedTrainingSchedulesCount(stateId?: string, districtId?: string): Observable<{ count: number }> {
    let params = new HttpParams();
    
    if (stateId) {
      params = params.set('stateId', stateId);
    }
    
    if (districtId) {
      params = params.set('districtId', districtId);
    }

    return this.http.get<{ count: number }>(`${this.apiUrl}/training-schedules/approved/count`, { params });
  }

  /**
   * Get rejected training schedules count
   */
  getRejectedTrainingSchedulesCount(stateId?: string, districtId?: string): Observable<{ count: number }> {
    let params = new HttpParams();
    
    if (stateId) {
      params = params.set('stateId', stateId);
    }
    
    if (districtId) {
      params = params.set('districtId', districtId);
    }

    return this.http.get<{ count: number }>(`${this.apiUrl}/training-schedules/rejected/count`, { params });
  }

  /**
   * Get approved trainees count
   */
  getApprovedTraineesCount(stateId?: string, districtId?: string): Observable<{ count: number }> {
    let params = new HttpParams();
    
    if (stateId) {
      params = params.set('stateId', stateId);
    }
    
    if (districtId) {
      params = params.set('districtId', districtId);
    }

    return this.http.get<{ count: number }>(`${this.apiUrl}/trainees/approved/count`, { params });
  }

  /**
   * Get rejected trainees count
   */
  getRejectedTraineesCount(stateId?: string, districtId?: string): Observable<{ count: number }> {
    let params = new HttpParams();
    
    if (stateId) {
      params = params.set('stateId', stateId);
    }
    
    if (districtId) {
      params = params.set('districtId', districtId);
    }

    return this.http.get<{ count: number }>(`${this.apiUrl}/trainees/rejected/count`, { params });
  }

  /**
   * Get training and trainee counts from the new API endpoint
   */
  getTrainingTraineeCounts(stateId?: string, districtId?: string): Observable<{success: boolean, message: string, data: RoleDashboardStats, statusCode: number}> {
    let params = new HttpParams();
    
    if (stateId) {
      params = params.set('stateId', stateId);
    }
    
    if (districtId) {
      params = params.set('districtId', districtId);
    }

    return this.http.get<{success: boolean, message: string, data: RoleDashboardStats, statusCode: number}>(`${this.apiUrl}public/dashboard/training-trainee-counts`, { params });
  }

  /**
   * Get trainer count by training institute ID
   */
  getTrainerCount(trainingInstituteId: string): Observable<TrainerCountResponse> {
    const url = `${this.apiUrl}public/dashboard/count/trainer/${trainingInstituteId}`;
    return this.http.get<TrainerCountResponse>(url);
  }

  /**
   * Get approved training data for Excel export
   */
  getApprovedTrainingData(): Observable<TrainingDataResponse> {
    return this.http.get<TrainingDataResponse>(`${this.apiUrl}public/dashboard/training-trainee-list/totalTrainingsApproved`);
  }

  /**
   * Get rejected training data for Excel export
   */
  getRejectedTrainingData(): Observable<TrainingDataResponse> {
    return this.http.get<TrainingDataResponse>(`${this.apiUrl}public/dashboard/training-trainee-list/totalTrainingsRejected`);
  }

  /**
   * Get approved trainee data for Excel export
   */
  getApprovedTraineeData(): Observable<TraineeDataResponse> {
    return this.http.get<TraineeDataResponse>(`${this.apiUrl}public/dashboard/training-trainee-list/totalTraineesApproved`);
  }

  /**
   * Get rejected trainee data for Excel export
   */
  getRejectedTraineeData(): Observable<TraineeDataResponse> {
    return this.http.get<TraineeDataResponse>(`${this.apiUrl}public/dashboard/training-trainee-list/totalTraineesRejected`);
  }

  /**
   * Get recommended trainees data for Excel export
   */
  getRecommendedTraineesData(): Observable<TraineeDataResponse> {
    return this.http.get<TraineeDataResponse>(`${this.apiUrl}public/dashboard/training-trainee-list/recommendedTrainees`);
  }

  /**
   * Get trainer data by training head ID for Excel export
   */
  getTrainerDataByTrainingHead(trainingHeadId: string): Observable<TrainerDataResponse> {
    return this.http.get<TrainerDataResponse>(`${this.apiUrl}trainers/getByTrainingHead/${trainingHeadId}`);
  }

  /**
   * Get training types by institute for pie chart
   */
  getTrainingTypesByInstitute(trainingInstituteId: string): Observable<TrainingTypeResponse> {
    return this.http.get<TrainingTypeResponse>(`${this.apiUrl}public/dashboard/trainingTypeByInstitue/${trainingInstituteId}`);
  }
}