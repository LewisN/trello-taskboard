import { setCookie } from '../../utils';
import teams from '../../data/teams';
import controller from '../../app';

export default class Header {
  constructor() {
    this.cache = {};
    this.create();
    this.bindEvents();
    this.render();
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
      <h1 class="header__title">Development Taskboard</h1>
    `;
    const select = (() => {
      const element = document.createElement('select');
      element.classList.add('header__select');
      for (let team in teams) {
        const option = document.createElement('option');
        option.value = team;
        option.innerText = team;
        element.appendChild(option);
      }
      return element;
    })();
    component.appendChild(select);
    cache.component = component;
  }

  /** Event listeners */
  bindEvents() {
    const { component } = this.cache;
    component.addEventListener('change', (e) => {
      this.updateTitle(e.value);
      controller.updateView(e.value);
    });
  }

  /** Render component */
  render() {
    const { component } = this.cache;
    document.body.insertAdjacentElement('afterbegin', component);
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