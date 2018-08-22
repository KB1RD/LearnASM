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
  <p>After it's run, r0 will be 20. The program above is equivalent to this:</p>
  <i>Put the number 5 in r0. Then, multiply the value in r0 by 4 and store the result in r0. Finally, stop.</i>
  <p>Since the value in r0 is 5, this will multiply 5x4, which will give us 20. This is then placed in r0 which is why r0 is 20.</p>
  
  <h4>Divide</h4>
  <p>As you've probably guessed, the next instruction I'll cover is <LearnInlineCode>udiv</LearnInlineCode> which performs division. Here's an example:</p>
  <LearnInlineCode>
mov r0, #20
udiv r0, r0, #4
halt
  </LearnInlineCode>
  <p>After it's run, r0 will be 5. Similar to the above program, the program is equivalent to this:</p>
  <i>Put the number 20 in r0. Then, divide the value in r0 by 4 and store the result in r0. Finally, stop.</i>
  <p>This, of course, results in 5 being stored in r0.</p>
  
  <h4>The Maximum for both multiplication and division</h4>
  <p>The maximum of 65535 still does apply, but I'm not going to go into detail about how it works like I did with addition and subtraction because it requires some skills that you're going to learn next.</p>
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
