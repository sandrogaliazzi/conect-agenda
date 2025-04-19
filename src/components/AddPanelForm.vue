<script setup>
import { ref, computed } from "vue";
import { useAppStore } from "@/stores/app";
import { storeToRefs } from "pinia";
import { rules } from "./inputRules";
import {
  createFirestoreDoc,
  getDocumentsByAgendaId,
  randomServicesId,
} from "@/firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { generateKeyBetween } from "fractional-indexing";

const store = useAppStore();
const { blueprints, selectedAgenda } = storeToRefs(store);

const dialog = defineModel();
const number = ref(0);
const blueprint = ref({ title: "Modelo Suporte", id: "12345" });
const isRoundRobin = ref(false);
const techs = ref([]);

const items = computed(() => {
  return blueprints.value.map((blueprint) => {
    return {
      title: blueprint.title,
      id: blueprint.id,
    };
  });
});

const close = () => {
  number.value = 0;
  isRoundRobin.value = false;
  techs.value = [];
  blueprint.value = { title: "Modelo Suporte", id: "12345" };
  dialog.value = false;
};

function generateSequentialKeys(count) {
  const keys = [];
  let lastKey = null;

  for (let i = 0; i < count; i++) {
    const newKey = generateKeyBetween(lastKey, null);
    keys.push(newKey);
    lastKey = newKey;
  }

  return keys;
}

const handleSubmit = async () => {
  console.log(blueprint.value);

  const { id } = blueprints.value.find((b) => b.title == blueprint.value);

  const panelsRef = await getDocumentsByAgendaId(id);

  const orders = generateSequentialKeys(number.value);

  let tech = "";
  let title = "";

  for (let i = 0; i < number.value; i++) {
    tech = techs.value[i % techs.value.length];

    if ((i + 1) % techs.value.length === 0) {
      techs.value.unshift(techs.value.pop());
    }

    if (isRoundRobin.value) {
      title = panelsRef[i % panelsRef.length].title.replace("{tecnico}", tech);
    } else title = panelsRef[i % panelsRef.length].title;

    await createFirestoreDoc(
      {
        agenda_id: selectedAgenda.value.id,
        date: serverTimestamp(),
        panel_id: randomServicesId(),
        title: title,
        cards: panelsRef[i % panelsRef.length].cards,
        history_logs: [],
        order: orders[i],
      },
      "services"
    );
  }
  close();
};
</script>

<template>
  <v-dialog v-model="dialog" max-width="400px">
    <v-card title="configurar adição em massa" rounded="xl">
      <v-card-text>
        <v-container>
          <v-form @submit.prevent="handleSubmit">
            <v-row>
              <v-col>
                <v-text-field
                  type="number"
                  variant="underlined"
                  label="número de quadros"
                  v-model="number"
                  :rules="rules"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  label="modelo base"
                  :items="items"
                  variant="underlined"
                  v-model="blueprint"
                  :rules="rules"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-select
                  :items="['Wellington', 'Elvis', 'Ismael', 'Cristian']"
                  v-model="techs"
                  variant="underlined"
                  multiple
                  v-if="isRoundRobin"
                  label="selecionar Técnicos"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <div class="d-flex flex-column">
                  <v-checkbox
                    label="com rodizio de técnico"
                    v-model="isRoundRobin"
                  ></v-checkbox>
                </div>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-col>
                  <v-btn
                    block
                    color="primary"
                    text="salvar"
                    type="submit"
                    rounded
                  ></v-btn>
                  <v-btn
                    block
                    variant="plain"
                    text="cancelar"
                    class="mt-4"
                    @click="close"
                    rounded
                  ></v-btn>
                </v-col>
              </v-col>
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
