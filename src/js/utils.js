/**
 * Set cookie helper
 * @param {string} name
 * @param {string} value
 * @param {number} expiryDays Number of days for the cookie to expire
 * @param {string} domain
 */
export const setCookie = (name, value, expiryDays, domain) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  const cookieValue = escape(value) + (expiryDays == null ? '' : `; expires=${expiryDate.toUTCString()}`);
  domain = (typeof domain === 'undefined') ? '' : `domain=${domain};`;
  document.cookie=name + '=' + cookieValue + ';' + domain + 'path=/';
};

/**
 * Get cookie helper
 * @param {string} name 
 */
export const getCookie = (name) => {
  const match = document.cookie.match(name+'=([^;]*)');
  return match ? match[1] : undefined;
};

/**
 * Allows parallel requests to the Trello API using promises
 * @param {Array} endpoints Array of API endpoints
 */
export const makeTrelloAPIRequests = (endpoints) => {
  let requests = [];

  /*
    If there are multiple endpoints (MAX: 10), make a batch
    request to reduce number of API requests
   */
  if (endpoints.length > 1 && endpoints.length <= 10) {    
    requests.push(
      new Promise((resolve, reject) => {
        Trello.get(`/batch/?urls=${endpoints.toString()}`, resolve, reject);    
      })
    );
  } else {
    endpoints.forEach((endpoint) => {
      requests.push(
        new Promise((resolve, reject) => {
          Trello.get(endpoint, resolve, reject);
        })
      );
    });
  }

  return Promise.all(requests);
}

/**
 * Loads and caches all users in an organisation in a single request
 * workaround for API limits
 */
export const loadOrganisation = () => {
  const ORGANISATION_ID = '561f8df260eaa1feec3afba2';
  makeTrelloAPIRequests(['/organizations/userconversion?fields=all'])
    .then((result) => {
    });
};