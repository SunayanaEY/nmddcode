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
  private  url = environment.apiUrl;

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
  submitTrainees(participants: any[]): Observable<any> {
    const url = `${this.apiUrl}/trainees/manual-upload`;
    return this.http.post(url, participants);
  }
 getAllTrainings(){
     return this.http.get<any>(this.url + `training/getAllTraining`).pipe(map((res: any) => {
      return res;
    }));
  }

  getTraineeList(id:any){
    return this.http.get<any>(this.apiUrl + `/trainees/getTrainee/`+id).pipe(map((res: any) => {
      return res;
    }));
  }
}
