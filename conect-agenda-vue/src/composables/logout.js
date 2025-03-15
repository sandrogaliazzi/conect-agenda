import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "@/composables/auth";
import { useRouter } from "vue-router";

export function useLogout() {
  const auth = getAuth();
  const { clearUser } = useAuth();
  const router = useRouter();

  const logout = async () => {
    try {
      await signOut(auth); // Firebase desloga o usuário
      clearUser(); // Remove usuário do estado/localStorage
      router.push("/login"); // Redireciona para login
    } catch (error) {
      console.error("Erro ao deslogar:", error.message);
    }
  };

  return { logout };
}
