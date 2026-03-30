export interface DataEntryOperator {
  id: string;
  operatorName: string;
  username?: string;
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

export interface DataEntryOperatorResponse {
  success: boolean;
  message: string;
  data: DataEntryOperator[];
  statusCode: number;
}

export interface DataEntryOperatorRequest {
  trainingHeadId: string;
}
