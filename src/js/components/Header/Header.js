import teams from '../../data/teams';
import controller from '../../app';
import Menu from '../Menu/Menu';

export default class Header {
  constructor() {
    this.cache = {};
    this.create();
    this.bindEvents();
    this.render();

    const value = this.cache.component.querySelector('.header__select').value;

    return {
      updateTitle: this.updateTitle,
      cache: this.cache,
    }
  }

  /** Create elements */
  create() {
    const { cache } = this;
    const component = document.createElement('header');
    component.classList.add('header');
    component.innerHTML = `
      <div class="header__logo"></div>
      <h1 class="header__title">Taskboard</h1>
      <select class="header__select">
        ${Object.keys(teams).map((team) => `<option value="${team}">${team}</option>`)}
      </select>
      <div class="header__menu"></div>
    `;
    component.querySelector('.header__menu').appendChild(new Menu());
    cache.component = component;
  }

  /** Event listeners */
  bindEvents() {
    const { component } = this.cache;
    component.addEventListener('change', (e) => {
      this.updateTitle(e.target.value);
      controller.updateView(e.target.value);
    });
  }

  /** Render component */
  render() {
    const { component } = this.cache;
    document.querySelector('main').insertAdjacentElement('afterbegin', component);
  }

  /**
   * Update the page title and header
   * @param {string} newTitle
   */
  updateTitle(newTitle) {
    const { component } = this.cache;
    component.querySelector('.header__title').innerText = `${newTitle} Taskboard`;
    document.querySelector('title').innerText = `${newTitle} Taskboard - User Conversion`;
  }
}