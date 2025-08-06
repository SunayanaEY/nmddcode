export interface RegisterInstituteRequest {
  operatorName: string;
  designation: string;
  contactNumber: string;
  emailId: string;
  password: string;
}

export interface RegisterInstituteData {
  id: string;
  trainingInstituteName: string;
  roleId: number;
  scheme: string;
  state: string;
  district: string;
  block: string;
  registrationId: string;
  contactPersonName: string;
  designation: string;
  contactNumber: string;
  emailId: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface RegisterInstituteResponse {
  success: boolean;
  message: string;
  data: RegisterInstituteData;
  statusCode: number;
}