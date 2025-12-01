import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginResponse,PhotoUploadResponse } from '../models/training.model';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  private apiUrl = environment.apiUrl + 'api';
  private url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  downloadExcelFile(): Observable<Blob> {
    const url = `${this.apiUrl}/trainees/download-trainee-template`;
    return this.http.get(url, {
      responseType: 'blob',
    });
  }
  uploadTraineeExcel(
    file: File,
    trainingId: number,
    trainingInstituteId: string
  ): Observable<any> {
    const url = `${this.apiUrl}/trainees/upload-trainees-excel`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('trainingId', trainingId.toString());
    formData.append('trainingInstituteId', trainingInstituteId);

    return this.http.post(url, formData);
  }

  saveTraining(payload: FormData): Observable<any> {
    return this.http.post(`${this.url}training/save`, payload);
  }
  updateTraining(payload: FormData): Observable<any> {
    return this.http.post(`${this.url}training/update`, payload);
  }
  submitTrainees(participants: any[]): Observable<string> {
    const url = `${this.apiUrl}/trainees/manual-upload`;
    return this.http.post(url, participants, { responseType: 'text' });
  }
  uploadTraineeImage(file: File, photoType?: string): Observable<PhotoUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    if (photoType) {
      formData.append('photoType', photoType);
    }

    const token = localStorage.getItem('token'); // or from AuthService

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.post<PhotoUploadResponse>(
      `${this.url}photos/upload`,
      formData,
      { headers }
    );
  }
  downloadTraineeImage(photoId: number) {
  return this.http.get(
    `${this.url}photos/download/${photoId}`,
    {
      responseType: 'blob'
    }
  );
}

  // getAllTraining() {
  //   return this.http.get<any>(this.url + `training/getAllTraining`).pipe(
  //     map((res: any) => {
  //       return res;
  //     })
  //   );
  // }
  getAllInstitutes() {
    return this.http.get<any>(this.url + `training/trainingInstitutes`).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  getInstituteDetails(trainingInstituteId: any) {
    return this.http
      .get<any>(this.url + `trainingInstitutes/getById/` + trainingInstituteId)
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }
  getTrainingTypes() {
    return this.http.get<any>(this.url + `trainingType/getTrainingType`).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  getTrainingDetails(trainingId: number) {
    return this.http
      .get<any>(this.url + `training/getTrainingById/` + trainingId)
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }
  getAllTraining() {
    return this.http.get<any>(this.url + `training/getAllTrainingByRole`).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  getAllTrainingOrganization(id: any) {
    return this.http
      .get<any>(
        this.url + `training/schedule/pendingOrganizationApproval/${id}`
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }
  getAllTrainings(trainingInstituteId: any) {
    return this.http
      .get<any>(
        this.url + `training/getTrainingByCenter/` + trainingInstituteId
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }
  getAllTrainees(
    status: string,
    trainingInstitueId: number,
    trainingId: number
  ): Observable<any> {
    const url = `${this.apiUrl}/trainees/traineesByStatus`;

    const formData = {
      status: status,
      trainingId: trainingId,
    };

    return this.http.post(url, formData);
  }

  getCertificateDetails(
    uin: string,
    email: string,
    contactNumber: string
  ): Observable<any> {
    const url = `${this.url}training/getTrainingCertificateDetails`;

    const formData = {
      uin: uin,
      email: email,
      contactNumber: contactNumber,
    };

    return this.http.post(url, formData);
  }
  // verifyCertificate(uin: string): Observable<any> {
  //   const url = `${this.url}training/sendEmail`; // base url
  //   return this.http.get(url, {
  //     params: { uin }, // sending query param as { ?uin=value }
  //   });
  // }
  verifyCertificate(uin: string): Observable<any> {
    const url = `${this.url}training/sendEmail`;
    return this.http.post(url, null, {
      params: { uin },
      responseType: 'text',
    }) as Observable<any>;
  }
  getTraineeList(id: any) {
    return this.http.get<any>(this.apiUrl + `/trainees/getTrainee/` + id).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getApprovedTrainings(): Observable<any> {
    return this.http.get<any>(this.url + `training/getAllApprovedTrainings`);
  }
  getAllInitialStageTrainings(): Observable<any> {
    return this.http.get<any>(this.url + `training/getAllInitialStageTrainings`);
  }

  getAllScheduledTrainings(): Observable<any> {
    return this.http.get<any>(this.url + `training/getAllScheduledTrainings`);
  }

  getRejectedTrainings(): Observable<any> {
    return this.http.get<any>(this.url + `training/getAllRejectedTrainings`);
  }
}
