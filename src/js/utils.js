/**
 * Set cookie helper
 * @param {string} name
 * @param {string} value
 * @param {number} expiryDays Number of days for the cookie to expire
 * @param {string} domain
 */
const setCookie = (name, value, expiryDays, domain) => {
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
const getCookie = (name) => {
  const match = document.cookie.match(name+'=([^;]*)');
  return match ? match[1] : undefined;
};

/**
 * Allows parallel requests to the Trello API using promises
 * @param {Array} endpoints Array of API endpoints
 */
const makeTrelloAPIRequests = (endpoints) => {
  let requests = [];

  // Create a new promise for each request and return the results when all
  // requests have been successful
  endpoints.forEach((endpoint) => {
    requests.push(
      new Promise((resolve, reject) => {
        Trello.get(
          endpoint,
          (data) => {
            resolve(data); 
          },
          (err) => {
            // Errors are often caused by too many requests
            reject('Error with Trello response'); 
          }
        );
      })
    );
  });

  return Promise.all(requests);
}

export { setCookie, getCookie, makeTrelloAPIRequests };