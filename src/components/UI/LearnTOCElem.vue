<template>
<li>
  <b v-if="active_path == '/learn/'+page.path && !page.children"><router-link :to="'/learn/'+page.path">{{page.title}}</router-link></b>
  <router-link v-if="active_path != '/learn/'+page.path && !page.children" :to="'/learn/'+page.path">{{page.title}}</router-link>
  <h5 v-if="page.children">{{page.title}}</h5>
  <ol v-if="page.children">
    <LearnTOCElem v-for="page in page.children" :key="page.name" :page="page" :active_path="active_path"></LearnTOCElem>
  </ol>
</li>
</template>

<script>
var LearnTOCElem = {
  name: 'LearnTOCElem',
  props: [ 'page', 'active_path' ]
}

LearnTOCElem.components = { LearnTOCElem }

export default LearnTOCElem
</script>

<style scoped>
.toc ol {
  list-style-type: decimal;
  padding-left: 30px;
  margin: 5px;
}
</style>
