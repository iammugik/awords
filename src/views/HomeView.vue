<script setup lang="ts">
import { words } from "@/stores/words_ru";
import { words as wordsLong } from "@/stores/words_long_ru";

const words5long = wordsLong.filter(word => word.length === 5).sort();

const words1 = words.filter(word => word.length === 1);
const words2 = words.filter(word => word.length === 2);
const words3 = words.filter(word => word.length === 3);
const words4 = words.filter(word => word.length === 4);
const words5 = words.filter(word => word.length === 5).sort();
const words6 = words.filter(word => word.length === 6);
const words7 = words.filter(word => word.length === 7);
const words8 = words.filter(word => word.length === 8);
const words9 = words.filter(word => word.length === 9);
const words10 = words.filter(word => word.length === 10);
const words11 = words.filter(word => word.length === 11);
const words12 = words.filter(word => word.length === 12);
const words13 = words.filter(word => word.length === 13);
const words14 = words.filter(word => word.length === 14);
const words15 = words.filter(word => word.length === 15);

//console.log(words1.length,
//words2.length,
//words3.length,
//words4.length,
//words7.length,
//words9.length,
//words5.length,
//words6.length,
//words10.length,
//words11.length,
//words12.length,
//words13.length,
//words14.length,
//words15.length);
//words8.length,

console.log(words5, words5long);
</script>

<template>
  <main>привет</main>
</template>
