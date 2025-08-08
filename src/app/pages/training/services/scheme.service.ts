import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SchemeService {
 private apiUrl = environment.apiUrl + 'api';
  private  url = environment.apiUrl;

  constructor(private http: HttpClient) {}
   getAllSchemes(){
       return this.http.get<any>(this.url + `scheme/getSchemes`).pipe(map((res: any) => {
        return res;
      }));
    }

    saveScheme(data:any) {
    return this.http.post<any>(this.url + `scheme/save`, data).pipe(map((res: any) => {
      return res;
    }));
  }



deleteScheme(id:any) {
    return this.http.delete<any>(this.url + `scheme/delete/`+id).pipe(map((res: any) => {
      return res;
    }));
  }

}
