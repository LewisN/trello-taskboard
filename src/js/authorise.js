import app from './app';

const Trello = window.Trello;
Trello.authorize({
  type: 'redirect',
  name: 'User Conversion Taskboards',
  scope: {
    read: 'true',
    write: 'true' 
  },
  expiration: 'never',
  success: function() {
    app.init();
  },
  error: function() {
    console.error('Trello authentication failed');
  }
});