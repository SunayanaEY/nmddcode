import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainingTypeService {
private apiUrl = environment.apiUrl + 'api';
  private  url = environment.apiUrl;

  constructor(private http: HttpClient) {}
  // private getHttpOptions() {
  //   return {
  //     headers: new HttpHeaders({
  //       'Content-Type': 'text/plain',
  //       // Add authorization header if needed
  //       // 'Authorization': `Bearer ${this.getToken()}`
  //     })
  //   };
  // }
   getAllTrainingTypes():Observable<any>{
      return this.http.get<any>(this.url + `trainingType/getTrainingType`);
      //.pipe(map((res: any) => {
      //   return res;
      // }));
    }

    saveTrainingType(data:any):Observable<any> {
    return this.http.post<any>(this.url + `trainingType/saveOrUpdate`, data);
    // .pipe(map((res: any) => {
    //   return res;
    // }));
  }



deleteTrainingType(id:any) {
    return this.http.delete<any>(this.url + `trainingType/delete/`+id);
    // .subscribe(map((res: any) => {
    //   return res;
    // }));
  }
}
