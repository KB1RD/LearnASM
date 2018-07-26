<template>
<div>
  <NavBar :version="version" :links="navbar_links" :sticky="false" :home="home_url"></NavBar>
  
  <div class="container">
    <ul class="breadcrumb" v-if="routeData.path_array">
      <li class="breadcrumb-item"><router-link to="/learn/">Home</router-link></li>
      <li class="breadcrumb-item active" v-for="(path, i) in routeData.path_array" :key="path">{{routeData.titles[i]}}</li>
    </ul>

    <router-view></router-view>
    
    <center><div style="max-width: 500px; display: block; height: 50px;" v-if="routeData.next || routeData.back">
      <div class="float-left" style="display: inline;">
        <router-link class="btn btn-primary" v-bind:class="routeData.back ? '' : 'disabled'" :to="routeData.back ? routeData.back : $route.path">&laquo; Back</router-link>
      </div>
      <div class="float-right" style="display: inline;">
        <router-link class="btn btn-primary" v-bind:class="routeData.next ? '' : 'disabled'" :to="routeData.next ? routeData.next : $route.path">Next &raquo;</router-link>
      </div>
    </div></center>
    
    <LearnTOC :pages="LearnUtils.pages" :active_path="routeData.path"></LearnTOC>
  </div>
</div>
</template>

<script>
import NavBar from '@/components/UI/NavBar.vue'
import LearnUtils from '@/js/LearnUtils.js'
import LearnTOC from '@/components/UI/LearnTOC.vue'

export default {
  name: 'HomeEditor',
  
  props: {
    alert_manager: { required: true },
    version: { required: true },
    navbar_links: { required: true },
    home_url: { required: true }
  },
  
  components: {
    NavBar, LearnTOC
  },
  
  watch: {
    '$route' (to, from) {
      this.updateRouteData ()
    }
  },
  
  data () { return {
    routeData: {},
    updateRouteData() {
      window.scrollTo(0, 0)
      
      this.routeData = LearnUtils.getRouteDataPtr(this.$route.path)
      // Triggering an update will notify listeners of a deep property change
      this.$emit('update:routeData', LearnUtils.getRouteDataPtr(this.$route.path))
    },
    LearnUtils
  } },
  
  mounted () {
    this.updateRouteData ()
  }
}
</script>

<style>
@import '../css/vis.css'
</style>

<style scoped>
.container {
  max-width: 1100px;
  margins: 100px;
}

.breadcrumb {
  border: none;
}
</style>
