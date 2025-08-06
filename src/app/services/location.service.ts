import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface State {
  id: number;
  stateName: string;
}

export interface District {
  id: number;
  districtName: string;
  stateId: number;
}

export interface StateApiResponse {
  success: boolean;
  message: string;
  data: State[];
  statusCode: number;
}

export interface DistrictApiResponse {
  success: boolean;
  message: string;
  data: District[];
  statusCode: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Fetch all states from the API
   * @returns Observable<State[]>
   */
  getStates(): Observable<State[]> {
    return this.http.get<StateApiResponse>(`${this.apiUrl}states`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Fetch districts by state ID
   * @param stateId - The ID of the selected state
   * @returns Observable<District[]>
   */
  getDistrictsByState(stateId: number): Observable<District[]> {
    return this.http.get<DistrictApiResponse>(`${this.apiUrl}districts/list/${stateId}`)
      .pipe(
        map(response => response.data)
      );
  }
}