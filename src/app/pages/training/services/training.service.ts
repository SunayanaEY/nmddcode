import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginResponse } from '../models/training.model';

@Injectable({
  providedIn: 'root',
})
export class TrainingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      credentials
    );
  }
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
}
