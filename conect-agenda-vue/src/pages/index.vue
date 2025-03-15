<script setup>
definePage({
  meta: {
    requiresAuth: true,
  },
});

import Agenda from "@/components/Agenda.vue";
</script>

<template>
  <Agenda />
</template>
