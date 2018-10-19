const setCookie = (name, value, expiryDays, domain) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  const cookieValue = escape(value) + (expiryDays == null ? '' : `; expires=${expiryDate.toUTCString()}`);
  domain = (typeof domain === 'undefined') ? '' : `domain=${domain};`;
  document.cookie=name + '=' + cookieValue + ';' + domain + 'path=/';
};

const getCookie = (name) => {
  const match = document.cookie.match(name+'=([^;]*)');
  return match ? match[1] : undefined;
};

export { setCookie, getCookie };