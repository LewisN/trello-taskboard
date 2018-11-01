import controller from '../../app';

export default class Error {
  /**
   * @param {string} message Error message
   */
  constructor(message) {
    this.cache = { message };
    this.create();
    this.bindEvents();
    this.removeAll();
    this.render();
  }

  create() {
    const { cache } = this;
    const element = document.createElement('div');
    element.classList.add('error');
    element.innerHTML = `
      <div class="error__message">
        <div class="error__message__text">Error: ${cache.message}</div>
        <button class="error__message__retry" disabled>Try again</button>
        <div class="error__message__countdown">Wait <span class="error__message__countdown__num">15s</span> before trying again</div>
      </div>
    `;
    cache.component = element;
  }

  bindEvents() {
    const { component } = this.cache;
    component.querySelector('.error__message__retry').addEventListener('click', () => {
      this.remove();
      controller.init();
    });
    
    // Countdown from buffer
    let buffer = 15;
    const button = component.querySelector('.error__message__retry');
    const countdownEl = component.querySelector('.error__message__countdown');
    const bufferEl = countdownEl.querySelector('.error__message__countdown__num');
    const countdown = () => {
      setTimeout(() => {
        if (buffer !== 0) {
          buffer = buffer - 1;
          bufferEl.innerText = `${buffer}s`;
          countdown();
        } else {
          countdownEl.parentElement.removeChild(countdownEl);
          button.removeAttribute('disabled');
        }
      }, 1000);
    }
    countdown();
    
  }

  removeAll() {
    const errors = document.querySelectorAll('.error');
    Array.from(errors).forEach((node) => {
      node.parentElement.removeChild(node);
    })
  }

  remove() {
    const { component } = this.cache;
    component.parentElement.removeChild(component);
  }

  render() {
    const { component } = this.cache;
    document.body.appendChild(component);
  }
}