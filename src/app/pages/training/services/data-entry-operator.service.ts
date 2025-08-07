import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataEntryOperatorResponse } from '../models/data-entry-operator.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataEntryOperatorService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllByTrainingHead(trainingHeadId: string): Observable<DataEntryOperatorResponse> {
    return this.http.get<DataEntryOperatorResponse>(
      `${this.apiUrl}dataEntryUser/getAllByTrainingHead/${trainingHeadId}`
    );
  }

  updateOperatorStatus(operatorId: string, status: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}dataEntryUser/updateStatus/${operatorId}`, {
      active: status
    });
  }

  getOperatorById(operatorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/dataEntryUser/${operatorId}`);
  }

  updateOperator(operatorId: string, operatorData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/dataEntryUser/${operatorId}`, operatorData);
  }

  deleteOperator(operatorId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/dataEntryUser/${operatorId}`);
  }
}