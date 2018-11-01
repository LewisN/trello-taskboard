export default class Loader {
  constructor() {
    this.cache = {};
    this.create();
    this.render();

    return {
      show: this.show,
      hide: this.hide,
      cache: this.cache,
    }
  }

  create() {
    const { cache } = this;
    const component = document.createElement('div');
    component.classList.add('loader--bg');
    component.classList.add('hidden');
    component.innerHTML = '<div class="loader"></div>';
    cache.component = component;
  }

  render() {
    const { cache } = this;
    document.body.append(cache.component);
  }

  show() {
    const { cache } = this;
    cache.component.classList.remove('hidden');
  }

  hide() {
    const { cache } = this;
    cache.component.classList.add('hidden');
  }
}