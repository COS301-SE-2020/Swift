/* eslint-disable no-undef */
function facebookLogin() {
  const url = window.location.href;
  const noFragmentURL = url.substring(url.indexOf('#') + 1);
  const urlObj = JSON.parse(`{"${noFragmentURL.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"')}"}`);

  const loginForm = document.createElement('form');
  const token = document.createElement('input');

  const loginButton = document.createElement('input');
  const buttonHint = document.createElement('label');

  loginButton.type = 'button';
  loginButton.id = 'loginBtn';
  loginButton.value = 'Login';
  loginButton.onclick = () => { document.getElementById('loginForm').submit(); };

  buttonHint.for = loginButton;
  buttonHint.innerHTML = 'Please click here if you are not automatically redirected in <b>5 seconds</b>.<br>';

  loginForm.id = 'loginForm';
  loginForm.method = 'POST';
  loginForm.action = '/auth/facebook';

  token.name = 'token';
  token.value = urlObj.access_token;
  token.hidden = true;

  loginForm.appendChild(token);

  document.body.appendChild(loginForm);
  document.body.appendChild(buttonHint);
  document.body.appendChild(loginButton);

  loginForm.submit();
}

window.onload = facebookLogin;
