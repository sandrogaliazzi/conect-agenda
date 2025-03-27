// Utilities
import { defineStore } from "pinia";
import { getFirestoreCollectionDocs } from "@/firebase/firestore";
import { useAuth } from "@/composables/auth";

export const useAppStore = defineStore("app", () => {
  const hasTagUpdate = ref(false);

  const lastIndex = ref(null);

  function setLastIndex(val) {
    lastIndex.value = val;
  }

  const { user } = useAuth();

  const selectedAgenda = ref(
    JSON.parse(localStorage.getItem("agenda")) || null
  );

  function setAgenda(val) {
    localStorage.setItem("agenda", JSON.stringify(val));
    selectedAgenda.value = val;
  }

  const blueprints = ref([]);

  function setBluePrints(agendas) {
    blueprints.value = agendas.filter((agenda) => agenda.is_blue_print);
  }

  async function setAgendas() {
    const agendas = await getFirestoreCollectionDocs("agendas");

    const userAgendas = agendas.filter((agenda) => {
      const userName = user.value.email.split("@")[0];
      return !agenda.is_blue_print && agenda.users.includes(userName);
    });

    const lastAgenda = userAgendas[0];
    setBluePrints(agendas);
    if (!selectedAgenda.value) setAgenda(lastAgenda);
  }

  function setUpdate(val) {
    hasTagUpdate.value = val;
  }

  setAgendas().then();

  return {
    hasTagUpdate,
    setUpdate,
    selectedAgenda,
    setAgenda,
    blueprints,
    setAgendas,
    lastIndex,
    setLastIndex,
  };
});
