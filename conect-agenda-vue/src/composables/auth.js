// src/composables/useAuth.js
import { ref, computed } from "vue";
import { auth, onAuthStateChanged } from "@/firebase";

const user = ref(JSON.parse(localStorage.getItem("user")) || null);

const userName = computed(() => user.value.email.split("@")[0]);

export function useAuth(router) {
  const setUser = (newUser) => {
    user.value = newUser;
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const clearUser = () => {
    user.value = null;
    localStorage.removeItem("user");
  };

  const listenAuthState = () => {
    onAuthStateChanged(auth, (newUser) => {
      if (newUser) {
        setUser(newUser);
        if (router.currentRoute.value.path !== "/") {
          router.push("/");
        }
      } else {
        clearUser();
        if (router.currentRoute.value.path !== "/login") {
          router.push("/login");
        }
      }
    });
  };

  return { user, setUser, clearUser, listenAuthState, userName };
}
