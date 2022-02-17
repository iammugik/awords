<script setup lang="ts">
import {
  KEYBOARD_KEYS,
  KEYBOARD_ROWS,
} from "@/components/Keyboard/keyboards/ru-RU";
import { onBeforeUnmount, onMounted } from "vue";

const props = defineProps<{
  onKeyClick: (key: string) => void;
}>();

const handleHardKeyClick = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  if (!KEYBOARD_KEYS.includes(key)) return;
  props.onKeyClick(key);
};

onMounted(() => {
  document.documentElement.addEventListener("keydown", handleHardKeyClick);
});

onBeforeUnmount(() => {
  document.documentElement.removeEventListener("keydown", handleHardKeyClick);
});
</script>

<template>
  <div class="keyboard">
    <div
      class="keyboard__row"
      v-for="(row, index) in KEYBOARD_ROWS"
      :key="index"
    >
      <button
        type="button"
        :class="[
          'keyboard__key',
          { 'keyboard__key--backspace': key === 'backspace' },
        ]"
        v-for="key in row"
        :key="key"
        @click="onKeyClick(key)"
      >
        {{ key === "backspace" ? "⌫" : key }}
      </button>
    </div>
  </div>
</template>

<style src="./Keyboard.scss" lang="scss"></style>
