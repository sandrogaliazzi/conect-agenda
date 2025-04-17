import { useAuth } from "@/composables/auth"; // Ajuste o caminho conforme necessário

export default {
  mounted(el, binding) {
    const { user } = useAuth();
    const allowedUsers = binding.value;

    // Se o usuário autenticado NÃO estiver na lista, remove o elemento
    if (!allowedUsers.includes(user.value.email.split("@")[0])) {
      el.remove();
    }
  },
};
