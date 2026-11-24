<script setup lang="ts">
import type { InlineToken } from '@/domain/inline'

defineProps<{ tokens: readonly InlineToken[] }>()
</script>

<template>
  <!--
    Paragraph text from the data. Each token is rendered as a text node, so no markup from the
    data reaches the page (D7). Only two formats exist: bold, and a link to an http or https address.
  -->
  <template v-for="(token, index) in tokens" :key="index">
    <a v-if="token.href" :href="token.href" rel="noopener noreferrer">
      <strong v-if="token.bold">{{ token.text }}</strong>
      <template v-else>{{ token.text }}</template>
    </a>
    <strong v-else-if="token.bold">{{ token.text }}</strong>
    <template v-else>{{ token.text }}</template>
  </template>
</template>
