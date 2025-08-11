export interface RegisterInstituteRequest {
  operatorName: string;
  designation: string;
  contactNumber: string;
  emailId: string;
  password: string;
}

export interface RegisterDataEntryOperatorRequest {
  operatorName: string;
  designation: string;
  contactNumber: string;
  emailId: string;
  password: string;
  trainingHeadId: string;
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

export interface RegisterDataEntryOperatorData {
  id: string;
  operatorName: string;
  designation: string;
  contactNumber: string;
  emailId: string;
  userId: number;
  createdBy: string;
  trainingHeadId: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface RegisterDataEntryOperatorResponse {
  success: boolean;
  message: string;
  data: RegisterDataEntryOperatorData;
  statusCode: number;
}