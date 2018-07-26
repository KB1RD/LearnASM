<template>
<nav class="navbar navbar-expand-lg navbar-dark bg-primary" v-bind:class="sticky ? 'fixed-top' : ''">
  <router-link class="navbar-brand" :to="home">Learn<b>ASM</b> <span class="badge badge-danger" v-if="version.endsWith('a')">ALPHA</span><span class="badge badge-warning" v-if="version.endsWith('b')">BETA</span></router-link>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#master_navbar" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="master_navbar">
    <ul class="navbar-nav mr-auto">
      <!-- NAVBAR BUTTON GROUP -->
      <li class="nav-item" v-for="(link) in links">
        <router-link class="nav-link" :to="link.url">{{link.name}}</router-link>
      </li>
      <li class="nav-item" style="margin-left: 10px;">
        <slot></slot>
      </li>
    </ul>

    <!-- WEBSITE LINK -->
    <a target="_blank" href="https://kb1rd.net/" style="text-decoration:none"><b>KB1RD</b>.net</a>
  </div>
</nav>
</template>

<script>
export default {
  name: 'NavBar',
  props: ['version', 'links', 'sticky', 'home'],
  data () { return {} }
}
</script>

<style scoped>
</style>
