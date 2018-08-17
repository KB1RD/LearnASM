<template>
<div>
  <h3>Multiplication and Division</h3>
  
  <h4>Multiply</h4>
  <p>The instruction you'll be using for multiplication is <LearnInlineCode>umul</LearnInlineCode>. The "u" in <LearnInlineCode>umul</LearnInlineCode> does have a meaning, but that will be covered later. I will explain, I promise! The <LearnInlineCode>umul</LearnInlineCode> instruction works the same way as <LearnInlineCode>add</LearnInlineCode> and <LearnInlineCode>sub</LearnInlineCode>: The destination is always first, followed by two sources, the last one of which can be an immediate. For future reference, this is the way all operations work and I won't be mentioning it in future operations. Anyway, here's an example program using <LearnInlineCode>umul</LearnInlineCode>:</p>
  <LearnInlineCode>
mov r0, #5
umul r0, r0, #4
halt
  </LearnInlineCode>
  <p>After it's run, r0 will be 20.</p>
  <h5>The Maximum</h5>
  <p>The maximum of 65535 still does apply, but I'm not going to go into detail about how it works like I did with addition and subtraction because it requires some skills that you're going to learn in the next lesson.</p>
  
  <h4>Divide</h4>
  <p>As you've probably guessed, the next instruction I'll cover is <LearnInlineCode>udiv</LearnInlineCode> which performs division.</p>
  <LearnInlineCode>
mov r0, #20
udiv r0, r0, #4
halt
  </LearnInlineCode>
  <p>After it's run, r0 will be 5.</p>
  <h5>The Maximum</h5>
  <p>My comment from before applies to division too. The limit is still 65536, but explaining why will require what you're about to learn next.</p>
</div>
</template>

<script>
import LearnUtils from '@/js/LearnUtils.js'

export default LearnUtils.createDefaultLearn(
  ['lesson1', 'part2', 'page3'],
  'Multiplication-and-Division',
  { },
  { })
</script>

<style scoped>
</style>
