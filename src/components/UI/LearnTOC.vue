<template>
<div class="toc">
    <h3>Table of Contents</h3>
    <ol>
      <LearnTOCElem v-for="page in pages" :key="page.name" :page="page" :active_path="active_path"></LearnTOCElem>
    </ol>
</div>
</template>

<script>
import LearnTOCElem from '@/components/UI/LearnTOCElem.vue'

export default {
  name: 'LearnTOC',
  props: [ 'pages', 'active_path' ],
  components: { LearnTOCElem }
}
</script>

<style scoped>
.toc {
  width: 100%;
  overflow: auto;
  white-space: nowrap;
  
  margin-bottom: 20px;
}

.toc ol {
  list-style-type: decimal;
  padding-left: 30px;
  margin: 5px;
}
</style>
