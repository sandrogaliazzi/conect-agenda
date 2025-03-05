export const clickOutsideDirective = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = (event) => {
      // Verifica se o clique foi fora do elemento
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event); // Executa a função passada na directive
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};
