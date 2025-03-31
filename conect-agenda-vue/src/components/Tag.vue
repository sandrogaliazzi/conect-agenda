<script setup>
import { ref, watch, computed, onMounted } from "vue";
import {
  getFirestoreCollectionDocs,
  createFirestoreDoc,
  updateFirestoreDoc,
} from "@/firebase/firestore";
import { collection, onSnapshot, writeBatch, doc } from "firebase/firestore";
import firestore from "@/firebase";
import TagCreator from "./TagCreator.vue";
import { useAppStore } from "@/stores/app";

const { cardId, cardTags } = defineProps(["cardId", "cardTags"]);

const store = useAppStore();

onMounted(async () => {
  await getFirestoreTags();
});

const dialog = ref(false);
const tags = ref([]);
const tagSelection = ref(cardTags ? cardTags : []);
const selectedTag = ref({
  label: "",
  color: "",
});
const query = ref("");

const tagFilter = ref(true);

watch(tagFilter, (val) => {
  if (val) {
    tags.value = tags.value.filter((tag) => tag.suporte);
  } else getFirestoreTags();
});

const filterResults = computed(() => {
  return tags.value.filter((t) => t.label.includes(query.value));
});

const emit = defineEmits(["tagSelection"]);

const myBtn = ref(null);

const tagsCollection = collection(firestore, "tags");

const getFirestoreTags = async () => {
  tags.value = await getFirestoreCollectionDocs("tags");
};

const unsub = onSnapshot(tagsCollection, (_) => {
  getFirestoreTags();
});

watch(selectedTag, () => {
  if (myBtn.value) {
    myBtn.value.$el.click();
  }
});

const setExpireTimeToTags = (tags) => {
  console.log(tags);
  const filterTagByLabel = tags.filter((tag) => tag.label == "RESERVADO");

  if (!filterTagByLabel.length) return tags;

  const data = new Date();

  const expireTime = data.setHours(data.getHours() + 1);

  return filterTagByLabel.map((tag) => {
    return {
      ...tag,
      expireTime,
    };
  });
};

async function updateMultipleDocuments(documents) {
  // Crie um batch de operações
  const batch = writeBatch(firestore);

  // Itere sobre os documentos que você deseja atualizar
  documents.forEach((document) => {
    const docRef = doc(firestore, "services", document.id); // Referência do documento
    batch.update(docRef, {
      order: document.order,
    });
  });

  // Execute o batch
  try {
    await batch.commit(); // Executa todas as operações atômicas
    console.log("Atualizações em massa feitas com sucesso.");
  } catch (error) {
    console.error("Erro ao atualizar documentos em massa:", error);
  }
}

async function modifyOrder() {
  const services = await getFirestoreCollectionDocs("services");
  const data = services.filter((s) => s.order);

  const updateBatch = data.map((d) => {
    let newOrder;

    if (d.order === 0) newOrder = 1000;
    else newOrder = d.order * 1000;

    return {
      ...d,
      order: newOrder,
    };
  });

  updateMultipleDocuments(updateBatch);
}

watch(tagSelection, () => {
  emit("tagSelection", setExpireTimeToTags(tagSelection.value));
});

const saveNewTag = async (tag) => {
  if (tag.id) {
    await updateFirestoreDoc(tag.id, tag, "tags");
    store.setUpdate(true);
  } else await createFirestoreDoc(tag, "tags");
};
</script>

<template>
  <v-dialog width="auto" scrollable>
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn
        icon="mdi-plus"
        variant="plain"
        size="x-small"
        v-bind="activatorProps"
      ></v-btn>
    </template>

    <template v-slot:default="{ isActive }">
      <v-card prepend-icon="mdi-label" title="Adicionar Tag" rounded="xl">
        <v-divider class="mt-3"></v-divider>

        <v-card-text class="px-4" style="height: 400px" v-if="tags.length > 0">
          <div class="d-flex ga-2">
            <v-switch
              v-model="tagFilter"
              color="primary"
              label="suporte"
              hide-details
            ></v-switch>
          </div>
          <v-text-field
            variant="underlined"
            append-icon="mdi-magnify"
            placeholder="procurar"
            v-model="query"
          ></v-text-field>
          <div
            class="d-flex align-center ga-1"
            v-for="tag in filterResults || tags"
            :key="tag.label"
          >
            <v-checkbox-btn :value="tag" v-model="tagSelection">
              <template #label>
                <v-sheet
                  :height="30"
                  :width="300"
                  rounded="lg"
                  :color="tag.color"
                  class="my-2 d-flex justify-start align-center ga-2"
                >
                  <v-icon size="x-small" class="ml-2">mdi-label</v-icon>
                  <p class="text-body-2">{{ tag.label.toUpperCase() }}</p>
                </v-sheet>
              </template>
            </v-checkbox-btn>

            <v-btn
              icon="mdi-pencil"
              variant="plain"
              size="x-small"
              @click="selectedTag = tag"
            ></v-btn>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-btn text="Fechar" @click="isActive.value = false"></v-btn>

          <v-spacer></v-spacer>

          <v-btn
            color="surface-variant"
            text="Criar Nova"
            @click="dialog = true"
            variant="flat"
            ref="myBtn"
          >
          </v-btn>

          <v-btn
            color="primary"
            text="Salvar"
            @click="isActive.value = false"
            variant="flat"
          >
          </v-btn>

          <TagCreator
            :tag="selectedTag"
            v-model="dialog"
            @new-tag-added="(tag) => saveNewTag(tag)"
          />
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>
