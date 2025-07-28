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