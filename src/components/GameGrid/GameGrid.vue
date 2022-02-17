<script setup lang="ts">
const props = defineProps<{
  letters?: [];
}>();
</script>

<template>
  <div class="gameGrid">
    <div class="gameGrid__cell" v-for="row in 30" :key="row"></div>
  </div>
</template>

<style src="./Keyboard.scss" lang="scss"></style>
