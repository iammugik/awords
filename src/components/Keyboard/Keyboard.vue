<script setup lang="ts">
import {
  KEYBOARD_KEYS,
  KEYBOARD_ROWS,
} from "@/components/Keyboard/keyboards/ru-RU";
import { onBeforeUnmount, onMounted, computed } from "vue";
import type { Letter } from "@/stores/store";
import { LetterStatus, useStore } from "@/stores/store";

const { state, dispatch } = useStore();

const getLettersByStatus = (st: LetterStatus): Letter[] =>
  state.guesses
    .flat()
    .filter((i) => i.status === st)
    .map((i) => i.letter);

const usedLetters = computed(() => getLettersByStatus(LetterStatus.USED));
const presentLetters = computed(() => getLettersByStatus(LetterStatus.PRESENT));
const trulyLetters = computed(() => getLettersByStatus(LetterStatus.TRULY));

const handleKeyClick = async (key: string) => {
  if (key === "backspace") {
    await dispatch("deleteLetter");
    return;
  }
  await dispatch("addLetter", key);
};

const handleHardKeyClick = (event: KeyboardEvent) => {
  const key = event.key.toLowerCase();
  if (!KEYBOARD_KEYS.includes(key)) return;
  handleKeyClick(key);
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
        @click="handleKeyClick(key)"
      >
        {{ key === "backspace" ? "⌫" : key }}
      </button>
    </div>
  </div>
</template>

<style src="./Keyboard.scss" lang="scss"></style>
