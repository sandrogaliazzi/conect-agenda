<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { rules } from "./inputRules";
import Tag from "./Tag.vue";
import { collection, onSnapshot } from "firebase/firestore";
import firestore from "@/firebase";
import { getFirestoreCollectionDocs } from "@/firebase/firestore";

const { data, panel } = defineProps(["data", "panel"]);
const emit = defineEmits([
  "updateCard",
  "deleteCard",
  "updateTags",
  "finishCard",
]);

const showForm = ref(false);
const formData = ref(data.card_content);
const hoveringOn = ref(null);
const tags = ref([]);
const reactiveTags = ref(data.tags);
const cardComplete = ref(data.is_complete ?? false);

const fetchTags = async () => {
  tags.value = await getFirestoreCollectionDocs("tags");
};

onMounted(async () => {
  await fetchTags();
});

const tagsCollection = collection(firestore, "tags");

const unsub = onSnapshot(tagsCollection, (querySnapshot) => {
  querySnapshot.docChanges().forEach((_) => {
    fetchTags();
  });
});

watch(
  () => data,
  (newVal) => {
    formData.value = newVal.card_content;
    reactiveTags.value = newVal.tags;
    cardComplete.value = newVal.is_complete;
  },
  { deep: true }
);

const cardTags = computed(() => {
  return tags.value.filter((tag) =>
    reactiveTags.value.find((t) => t.id === tag.id)
  );
});

watch(cardComplete, (val, oldVal) => {
  if (val !== oldVal) {
    emit("finishCard", {
      panelId: panel,
      id: data.id,
      is_complete: val,
    });
  }
});

const handleSubmit = () => {
  emit("updateCard", {
    panelId: panel,
    id: data.id,
    content: formData,
    is_complete: cardComplete.value,
  });

  showForm.value = false;
};

const handleDelete = () => {
  if (confirm("Deseja realmente deletar esse cartão?")) {
    emit("deleteCard", { panelId: panel, id: data.id });
  }
};

const upperCaseTags = computed(() => {
  if (!data.tags) return [];
  return data.tags.map((tag) => {
    return {
      ...tag,
      label: tag.label.toUpperCase(),
    };
  });
});

const setTags = async (tags) => {
  emit("updateTags", {
    panelId: panel,
    id: data.id,
    content: tags,
  });
};
</script>

<template>
  <v-card
    color="grey-darken-3 mt-3"
    rounded="xl"
    @mouseenter="hoveringOn = data.id"
    @mouseleave="hoveringOn = null"
    link
    max-width="300"
  >
    <v-card-title class="d-flex justify-space-between align-center pb-0">
      <template class="d-flex align-center flex-wrap">
        <div v-if="data.tags" class="d-flex align-center flex-wrap ga-2">
          <v-chip
            v-for="tag in cardTags"
            :key="tag.firestore_id"
            :color="tag.color"
            size="x-small"
            variant="flat"
            class="pa-2"
          >
            <span class="font-weight-bold">
              {{ tag.label.toUpperCase() }}
            </span>
          </v-chip>
        </div>
        <Tag
          @tag-selection="(tags) => setTags(tags)"
          :card-id="data.id"
          :card-tags="upperCaseTags"
        />
        <v-btn
          v-show="hoveringOn === data.id"
          icon="mdi-delete"
          variant="plain"
          class="align-self-end"
          size="x-small"
          @click="handleDelete"
        />
      </template>
    </v-card-title>
    <v-card-text>
      <div v-if="!showForm">
        <v-checkbox-btn color="success" v-model="cardComplete">
          <template #label>
            <span
              @click="showForm = true"
              :style="{ textDecoration: cardComplete ? 'line-through' : '' }"
            >
              {{ data.card_content.toUpperCase() }}
            </span>
          </template>
        </v-checkbox-btn>
        <span v-if="data.created_by">
          <v-badge
            :content="data.created_by"
            offset-x="-12"
            size="x-small"
          ></v-badge>
        </span>
      </div>
      <template v-else>
        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            autofocus
            v-model="formData"
            variant="underlined"
            :rules="rules"
            @blur="showForm = false"
          ></v-text-field>
        </v-form>
      </template>
    </v-card-text>
  </v-card>
</template>
