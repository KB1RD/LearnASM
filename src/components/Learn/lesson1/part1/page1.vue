<template>
<div>
  <h3>Please: Forget everything you know about computers</h3>
  <p>Since the invention of computers, people have been making them more and more complicated. This makes is harder to learn how they work. To really understand computers, we have to peel back all the layers and start with the basics. In other words, we're going to travel back in time.</p>

  <h4>The Virtual Computer</h4>
  <p>To help you learn how computers work, we've created a virtual computer for you to use. It's not powerful though: It's roughly equivalent in power to a late 70s or early 80s computer. Don't worry! This computer is built right in to this webpage and is much easier to use than a computer from that time. Plus, you can experiment around without actually breaking anything: One push of a button and everything is back to normal!</p>

  <h4>Computer basics</h4>
  <p>The first and <i>most important</i> thing that you need to remember is this: Contrary to common belief, computers, on their own, only do one <i>tiny</i> operation at once. When I say tiny, I mean <i>really</i> tiny. Think of buttons on your calculator. A computer really is just like a person holding a set of instructions and a calculator. The person reads off the list of instructions in order (the order is critical!) and presses buttons on the calculator. Your program is that list. Your job as a programmer is to write that list.</p>
</div>
</template>

<script>
import LearnUtils from '@/js/LearnUtils.js'

export default LearnUtils.createDefaultLearn(['lesson1', 'part1', 'page1'], 'Computers-in-a-Nutshell')
</script>

<style scoped>
</style>
