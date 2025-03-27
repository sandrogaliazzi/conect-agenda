<script setup>
import { ref, watch } from "vue";
import { rules } from "./inputRules";
const { tag } = defineProps(["tag"]);

const emit = defineEmits(["newTagAdded"]);
const dialog = defineModel();

const myForm = ref(null);
const valid = ref(false);
const label = ref(tag.label);
const color = ref(tag.color);
const id = ref(null);

function resetData() {
  label.value = null;
  color.value = null;
  id.value = null;
  dialog.value = false;
}

const handleSubmit = () => {
  if (valid.value) {
    emit("newTagAdded", {
      label: label.value.toUpperCase(),
      color: color.value,
      id: id.value,
      suporte: true,
    });
  }
  resetData();
};

watch(
  () => tag,
  (newTag) => {
    label.value = newTag.label;
    color.value = newTag.color;
    id.value = newTag.id;
  },
  { deep: true }
);
</script>

<template>
  <v-dialog v-model="dialog" width="auto" persistent>
    <template v-slot:default="{ isActive }">
      <v-form @submit.prevent="handleSubmit" v-model="valid" ref="myForm">
        <v-card min-width="300" rounded="lg">
          <v-card-title>
            <v-text-field
              variant="underlined"
              placeholder="titúlo da tag"
              class="mx-2"
              :rules="rules"
              v-model="label"
              prepend-icon="mdi-label"
              required
            >
            </v-text-field>
            <v-sheet
              v-if="label"
              :height="30"
              :width="300"
              rounded="lg"
              :color="color"
              class="my-2 d-flex justify-start align-center ga-2"
            >
              <v-icon size="x-small" class="ml-2">mdi-label</v-icon>
              <p class="text-body-2">{{ label.toUpperCase() }}</p>
            </v-sheet>
          </v-card-title>
          <v-card-text>
            <v-color-picker
              swatches-max-height="200px"
              show-swatches
              v-model="color"
              mode="hexa"
              :modes="['hexa']"
            ></v-color-picker>
          </v-card-text>
          <v-card-actions>
            <v-btn
              text="fechar"
              color="grey"
              variant="flat"
              @click="resetData()"
            ></v-btn>
            <v-spacer></v-spacer>
            <v-btn
              text="salvar"
              color="primary"
              type="submit"
              variant="flat"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </template>
  </v-dialog>
</template>
