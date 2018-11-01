import { getCookie, setCookie, loadOrganisation } from './utils';
import teams from './data/teams';
import Loader from './components/Loader/Loader';
import Header from './components/Header/Header';
import List from './components/List/List';

const { Trello, $ } = window;
const loader = new Loader();
const header = new Header();
const controller = {
  init: () => {
    //  loadOrganisation();
    const cookie = getCookie('taskboard_view');
    const value = cookie ? cookie : 'All';
    $('#change-board').val(value);
    controller.updateView(value);
  },

  /**
   * @param {string} viewName
   */
  updateView: (viewName) => {
    $('#dev-lists').empty();
    
    // Repopulate with new user group
    const usernames = teams[viewName];
    usernames.forEach((username) => {
      new List(username);
    });

    header.cache.component.querySelector('.header__select').value = viewName;
    setCookie('taskboard_view', viewName);
  }
};

export default controller;