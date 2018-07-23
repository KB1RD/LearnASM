<template>
  <div>
    <template v-if="type === 'sk-rotating-plane'">
      <div class="sk-rotating-plane"></div>  
    </template>

    <template v-else-if="type === 'sk-double-bounce'">
      <div class="sk-double-bounce">
        <div class="sk-child sk-double-bounce1"></div>
        <div class="sk-child sk-double-bounce2"></div>
      </div>
    </template>

    <template v-else-if="type === 'sk-double-bounce'">
      <div class="sk-wave">
        <div class="sk-rect sk-rect1"></div>
        <div class="sk-rect sk-rect2"></div>
        <div class="sk-rect sk-rect3"></div>
        <div class="sk-rect sk-rect4"></div>
        <div class="sk-rect sk-rect5"></div>
      </div>
    </template>

    <template v-else-if="type === 'sk-wandering-cubes'">
      <div class="sk-wandering-cubes">
        <div class="sk-cube sk-cube1"></div>
        <div class="sk-cube sk-cube2"></div>
      </div>
    </template>

    <template v-else-if="type === 'sk-pulse'">
      <div class="sk-spinner sk-spinner-pulse"></div>
    </template>

    <template v-else-if="type === 'sk-chasing-dots'">
      <div class="sk-chasing-dots">
        <div class="sk-child sk-dot1"></div>
        <div class="sk-child sk-dot2"></div>
      </div>
    </template>

    <template v-else-if="type === 'sk-three-bounce'">
      <div class="sk-three-bounce">
        <div class="sk-child sk-bounce1"></div>
        <div class="sk-child sk-bounce2"></div>
        <div class="sk-child sk-bounce3"></div>
      </div>
    </template>

    <template v-else-if="type === 'sk-circle'">
      <div class="sk-circle">
        <div class="sk-circle1 sk-child"></div>
        <div class="sk-circle2 sk-child"></div>
        <div class="sk-circle3 sk-child"></div>
        <div class="sk-circle4 sk-child"></div>
        <div class="sk-circle5 sk-child"></div>
        <div class="sk-circle6 sk-child"></div>
        <div class="sk-circle7 sk-child"></div>
        <div class="sk-circle8 sk-child"></div>
        <div class="sk-circle9 sk-child"></div>
        <div class="sk-circle10 sk-child"></div>
        <div class="sk-circle11 sk-child"></div>
        <div class="sk-circle12 sk-child"></div>
      </div>
    </template>

    <template v-else-if="type === 'sk-cube-grid'">
      <div class="sk-cube-grid">
        <div class="sk-cube sk-cube1"></div>
        <div class="sk-cube sk-cube2"></div>
        <div class="sk-cube sk-cube3"></div>
        <div class="sk-cube sk-cube4"></div>
        <div class="sk-cube sk-cube5"></div>
        <div class="sk-cube sk-cube6"></div>
        <div class="sk-cube sk-cube7"></div>
        <div class="sk-cube sk-cube8"></div>
        <div class="sk-cube sk-cube9"></div>
      </div>
    </template>

    <template v-else-if="type === 'sk-fading-circle'">
      <div class="sk-fading-circle">
        <div class="sk-circle1 sk-circle"></div>
        <div class="sk-circle2 sk-circle"></div>
        <div class="sk-circle3 sk-circle"></div>
        <div class="sk-circle4 sk-circle"></div>
        <div class="sk-circle5 sk-circle"></div>
        <div class="sk-circle6 sk-circle"></div>
        <div class="sk-circle7 sk-circle"></div>
        <div class="sk-circle8 sk-circle"></div>
        <div class="sk-circle9 sk-circle"></div>
        <div class="sk-circle10 sk-circle"></div>
        <div class="sk-circle11 sk-circle"></div>
        <div class="sk-circle12 sk-circle"></div>
      </div>
    </template>

    <template v-else>
      <div class="sk-folding-cube">
        <div class="sk-cube1 sk-cube"></div>
        <div class="sk-cube2 sk-cube"></div>
        <div class="sk-cube4 sk-cube"></div>
        <div class="sk-cube3 sk-cube"></div>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default() {
        return 'sk-rotating-plane';
      },
    },
  },
  mounted() {
    /* eslint-disable */
    console.log(this.type);
  },
};
</script>

<style lang="scss" scoped>
@import '~styles/settings';
@import '~spinkit/scss/spinners/1-rotating-plane',
        '~spinkit/scss/spinners/2-double-bounce',
        '~spinkit/scss/spinners/3-wave',
        '~spinkit/scss/spinners/4-wandering-cubes',
        '~spinkit/scss/spinners/5-pulse',
        '~spinkit/scss/spinners/6-chasing-dots',
        '~spinkit/scss/spinners/7-three-bounce',
        '~spinkit/scss/spinners/8-circle',
        '~spinkit/scss/spinners/9-cube-grid',
        '~spinkit/scss/spinners/10-fading-circle',
        '~spinkit/scss/spinners/11-folding-cube';
</style>
