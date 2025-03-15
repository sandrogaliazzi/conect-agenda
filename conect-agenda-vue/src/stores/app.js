// Utilities
import { defineStore } from "pinia";
import { getFirestoreCollectionDocs } from "@/firebase/firestore";
import { useAuth } from "@/composables/auth";

export const useAppStore = defineStore("app", () => {
  const hasTagUpdate = ref(false);

  const { user } = useAuth();

  const selectedAgenda = ref({});

  function setAgenda(val) {
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
    return lastAgenda;
  }

  function setUpdate(val) {
    hasTagUpdate.value = val;
  }

  setAgendas().then((agenda) => setAgenda(agenda));

  return {
    hasTagUpdate,
    setUpdate,
    selectedAgenda,
    setAgenda,
    blueprints,
    setAgendas,
  };
});
