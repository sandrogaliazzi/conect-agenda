<script setup>
import { ref } from "vue";

const emit = defineEmits(["closeForm"]);

const formData = ref(null);

const rules = [
  (value) => {
    if (value) return true;
    return "Este campo é obrigatório";
  },
];

const handleSubmit = () => {
  console.log(formData.value);
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
