export const environment = {
  production: false,
  // Direct backend URL (for reference): 'http://localhost:8080/ndlm_prod/'
  // Using nginx proxy - all API calls will go through /api/ and be forwarded to backend
  apiUrl: '/api/', //for prod
  // apiUrl: 'https://vidyapeethuat.ndlm.co.in/api/',//for uat
  certificateUrl: 'https://dahdvidyapeeth.ndlm.co.in/',
  // certificateUrl: 'https://vidyapeethuat.ndlm.co.in/',
};