<script setup>
import { ref } from "vue";
import { rules } from "./inputRules";
import { randomId } from "@/firebase/firestore";
import { useAuth } from "@/composables/auth";

const { userName } = useAuth();

const emit = defineEmits(["closeForm", "submitForm"]);
const { panel } = defineProps(["panel"]);

const formData = ref(null);
const handleSubmit = () => {
  emit("submitForm", {
    card_content: formData.value,
    id: randomId(),
    created_by: userName.value,
    is_complete: false,
  });
};
</script>
<template>
  <v-sheet>
    <v-form @submit.prevent="handleSubmit">
      <v-text-field
        autofocus
        v-model="formData"
        variant="outlined"
        :rules="rules"
        label="Insira um título para o card"
      ></v-text-field>
      <v-btn type="submit" color="primary">Adicionar</v-btn>
      <v-btn
        color="error"
        icon="mdi-close"
        size="x-small"
        class="ml-3"
        @click="emit('closeForm')"
      ></v-btn>
    </v-form>
  </v-sheet>
</template>
