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
      console.log('Successful authentication');
      app.init();
  },
  error: function() {
      console.log('Error authenticating user');
  }
});