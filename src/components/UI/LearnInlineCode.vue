<template>
<code><slot></slot></code>
</template>

<script>
export default {
  name: 'LearnInlineCode'
}
</script>

<style scoped>
code {
  color: #3c3c3f;
  font-family: "Lucida Console", Monaco, monospace;
  white-space: pre;
  overflow: auto;
  max-width: 100%;
}

code > .text-muted {
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select:none;
  user-select:none;
  -o-user-select:none;
}
</style>
