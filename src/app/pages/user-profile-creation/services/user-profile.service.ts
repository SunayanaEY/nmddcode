import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RegisterInstituteRequest,
  RegisterInstituteResponse,
  RegisterDataEntryOperatorRequest,
  RegisterDataEntryOperatorResponse,
} from '../models/user-profile.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  registerInstitute(
    data: RegisterInstituteRequest
  ): Observable<RegisterInstituteResponse> {
    return this.http.post<RegisterInstituteResponse>(
      `${this.apiUrl}training/registerInstitute`,
      data
    );
  }

  registerDataEntryOperator(
    data: RegisterDataEntryOperatorRequest
  ): Observable<RegisterDataEntryOperatorResponse> {
    return this.http.post<RegisterDataEntryOperatorResponse>(
      `${this.apiUrl}api/auth/registerDataEntrySpecialist`,
      data
    );
  }
  updateDataEntryOperator(
    editRowId: string,
    data: RegisterDataEntryOperatorRequest
  ): Observable<HttpResponse<RegisterDataEntryOperatorResponse>> {
    return this.http.put<RegisterDataEntryOperatorResponse>(
      `${this.apiUrl}dataEntryUser/update/${editRowId}`,
      data,
      { observe: 'response' }
    );
  }

  deleteDataEntryOperator(editRowId: string): Observable<HttpResponse<any>> {
    return this.http.get<any>(
      `${this.apiUrl}dataEntryUser/delete/${editRowId}`,
      { observe: 'response' }
    );
  }

  checkUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}api/auth/check-username`, {
      params: { username },
    });
  }
}
