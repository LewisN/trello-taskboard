import { getCookie, setCookie } from './utils';
import teams from './data/teams';
import Loader from './components/Loader/Loader';
import Header from './components/Header/Header';
import List from './components/List/List';

const loader = new Loader();
const header = new Header();
const controller = {
  init: () => {
    const cookie = getCookie('taskboard_view');
    const value = cookie ? cookie : 'All';
    controller.updateView(value);
  },

  /**
   * @param {string} viewName
   */
  updateView: (viewName) => {
    // Empty container
    document.querySelector('#dev-lists').innerHTML = '';
    
    // Repopulate with new user group
    const usernames = teams[viewName];
    usernames.forEach((username) => {
      try {
        new List(username);
      } catch (e) {
        console.error(e);
      }
    });

    header.cache.component.querySelector('.header__select').value = viewName;
    setCookie('taskboard_view', viewName);
  }
};

export default controller;