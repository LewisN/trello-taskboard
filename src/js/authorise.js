import app from './app';

const { Trello } = window;

Trello.authorize({
  type: 'redirect',
  name: 'Trello Taskboard',
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