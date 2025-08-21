export interface LoginResponse {
  data: {
    role: number;
    authData: string;
    id: number;
    email: string;
    username: string;
  };
  message: string;
  status: number;
}

export interface TrainingsList{
  id: number;
  trainingTitle: string;
  scheme: string;
  trainingInstituteName:string;
  trainerName: string;
  venueState: string;
  venueDistrict: string;
  venueBlock: string;
  trainingDate: string;
  duration: string;
  trainingDescription: string;
  modeOfTraining: string;
  status: string;
  location: string;

}

export interface TraineeDetails{
  id: number;
  name: string;
  gender: string;
  age:string;
  contactNumber: string;
  aadharMasked: string;
  email: string;
  status: string;
  trainingId: string;
  uin: string;
  trainingInstituteId:string;
}

