import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterInstituteRequest, RegisterInstituteResponse, RegisterDataEntryOperatorRequest, RegisterDataEntryOperatorResponse } from '../models/user-profile.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private apiUrl = environment.apiUrl;


  constructor(private http: HttpClient) { }

  registerInstitute(data: RegisterInstituteRequest): Observable<RegisterInstituteResponse> {
    return this.http.post<RegisterInstituteResponse>(`${this.apiUrl}training/registerInstitute`, data);
  }

  registerDataEntryOperator(data: RegisterDataEntryOperatorRequest): Observable<RegisterDataEntryOperatorResponse> {
    return this.http.post<RegisterDataEntryOperatorResponse>(`${this.apiUrl}api/auth/registerDataEntrySpecialist`, data);
  }
}