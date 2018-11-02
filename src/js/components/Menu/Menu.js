import Slideout from 'slideout';

export default class Menu {
  constructor() {
    this.cache = {};
    this.create();
    this.render();

    const { component, button } = this.cache;
    const slideout = new Slideout({
      'panel': document.querySelector('main'),
      'menu': component,
      'padding': 0,
      'tolerance': 70,
      'side': 'right',
    });

    // Event handlers
    button.addEventListener('click', () => {
      button.classList.toggle('is-active');
      slideout.toggle();
    });
    const close = (e) => {
      e.preventDefault();
      slideout.close();
    };
    slideout
      .on('beforeopen', function() {
        this.panel.classList.add('slideout-panel-open');
        button.classList.add('is-active');
      })
      .on('open', function() {
        this.panel.addEventListener('click', close);
      })
      .on('beforeclose', function() {
        this.panel.classList.remove('slideout-panel-open');
        this.panel.removeEventListener('click', close);
        button.classList.remove('is-active');
      });
    

    return button;
  }

  create() {
    const element = document.createElement('nav');
    element.classList.add('menu');
    element.innerHTML = `
      <div class="nav__inner">
        Options to go here
      </div>
    `;

    const button = document.createElement('div');
    button.classList.add('hamburger');
    button.classList.add('hamburger--arrowturn-r');
    button.innerHTML = `
      <div class="hamburger-box">
        <div class="hamburger-inner"></div>
      </div>
    `;

    this.cache.component = element;
    this.cache.button = button;
  }

  render() {
    const { component, button } = this.cache;
    document.body.insertAdjacentElement('afterbegin', component);
  }
}