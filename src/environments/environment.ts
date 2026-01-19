export const environment = {
  production: false,
  // Direct backend URL (for reference): 'http://localhost:8080/ndlm_prod/'
  // Using nginx proxy - all API calls will go through /api/ and be forwarded to backend
  // apiUrl: '/api/', //for prod
  apiUrl: 'http://10.0.0.5:8090/ndlm_preprod/', //for preprod
  // apiUrl:'https://dahdtraining.ndlm.co.in/'
  certificateUrl: 'https://dahdvidyapeeth.ndlm.co.in/',
};
