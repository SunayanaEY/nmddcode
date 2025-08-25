import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginResponse } from '../models/training.model';

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
  uploadTraineeExcel(file: File, trainingId: number): Observable<any> {
    const url = `${this.apiUrl}/trainees/upload-trainees-excel`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('trainingId', trainingId.toString());

    return this.http.post(url, formData);
  }

  saveTraining(payload: FormData): Observable<any> {
    return this.http.post(`${this.url}training/save`, payload);
  }
  submitTrainees(participants: any[]): Observable<any> {
    const url = `${this.apiUrl}/trainees/manual-upload`;
    return this.http.post(url, participants);
  }
  getAllTraining() {
    return this.http.get<any>(this.url + `training/getAllTraining`).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  getAllInstitutes() {
    return this.http.get<any>(this.url + `training/trainingInstitutes`).pipe(
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
      trainingCenter: trainingInstitueId,
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

  getRejectedTrainings(): Observable<any> {
    return this.http.get<any>(this.url + `training/getAllRejectedTrainings`);
  }
}
