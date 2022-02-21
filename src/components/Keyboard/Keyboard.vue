<script setup lang="ts">
import {
  KEYBOARD_KEYS,
  KEYBOARD_ROWS,
} from "@/components/Keyboard/keyboards/ru-RU";
import { onBeforeUnmount, onMounted, computed } from "vue";
import type { State } from "@/stores/store";
import { LetterStatus } from "@/stores/store";
import type { Letter } from "@/stores/store";

const props = defineProps<{
  guesses: State["guesses"];
  onKeyClick: (key: string) => void;
}>();

const getLettersByStatus = (st: LetterStatus): Letter[] =>
  props.guesses
    .flat()
    .filter((i) => i.status === st)
    .map((i) => i.letter);

const usedLetters = computed(() => getLettersByStatus(LetterStatus.USED));
const presentLetters = computed(() => getLettersByStatus(LetterStatus.PRESENT));
const trulyLetters = computed(() => getLettersByStatus(LetterStatus.TRULY));

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
          { 'keyboard__key--used': usedLetters.includes(key) },
          { 'keyboard__key--present': presentLetters.includes(key) },
          { 'keyboard__key--truly': trulyLetters.includes(key) },
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
