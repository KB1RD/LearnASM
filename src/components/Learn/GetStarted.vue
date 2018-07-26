<template>
<center><div class="jumbotron">
  <h1 class="display-3">Learn&#8203;ASM Now!</h1>
  <hr class="my-4"/>
  <h5>What is assembly?</h5>
  <p>In short, assembly is the most basic programming language in a computer and is closest to the computer's hardware.</p>
  <h5>Why learn assembly?</h5>
  <p>Many argue that there is no point in learning assembly since it's mostly obsolete, with the exception of a few rare cases. However, this is based on an approach where students learn by starting with a language as far away from the hardware (the physical computer) as possible. As a result, they don't really know how a computer <i>actually</i> works at the most basic level. LearnASM is based upon a different philosophy. LearnASM starts at the ground at the most basic levels of a computer and works it's way up. This way, you will understand the basics before moving on to more complicated stuff!</p>
  <hr class="my-4"/>
  <h5>Just a quick note...</h5>
  <p>LearnASM is experimental software. Not only may you encounter bugs, but LearnASM may not end up being practical as a teaching tool. Don't be too stressed out if you don't understand something.</p>
  <hr class="my-4"/>
  <router-link class="btn btn-success btn-lg" to="lesson1/part1/page1">Get Started!</router-link>
</div></center>
</template>

<script>
export default {
  name: 'GetStarted',
  
  data () { return {} }
}
</script>

<style scoped>
.jumbotron {
  padding: 50px;
  word-wrap: break-word;
}
</style>
