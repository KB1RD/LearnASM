<template>
<div>
  <h3>The Second Argument of "<LearnInlineCode>mov</LearnInlineCode>"</h3>
  <p>Note: Each of the comma seperated inputs to the "<LearnInlineCode>mov</LearnInlineCode>" instruction are refered to as "<i>arguments.</i>" For example, the instruction "<LearnInlineCode>mov r0, #5</LearnInlineCode>" has the arguments of "r0" and "#5". So by saying the "second argument of mov," I'm refering to the same location where the "#5" was in the previous example.</p>
  <p>In all of my examples so far, I have used immediates for the second argument of mov. In case you don't remember, immediates are numbers that are <i>immediate</i>ly available to the computer and are stored right in the instruction, like "#5". However, you don't <i>have</i> to put an immediate in as the second argument for mov. You can also put an ordinary register in, too. For example, if I wanted to "<LearnInlineCode>mov</LearnInlineCode>" a number from r5 to r3, I could write:</p>
  <LearnInlineCode>mov r3, r5</LearnInlineCode>
  <p>Remember that the destination always comes first! Now, try that practice again, but with some register-to-register "<LearnInlineCode>mov</LearnInlineCode>"s thrown in:</p>
  <LearnPractice :question_count="5" :question_controllers="[qna.PracticeMovIMM, qna.PracticeMovR2R, qna.PracticeMovR2R]"></LearnPractice>

  <h3>Chains of "<LearnInlineCode>mov</LearnInlineCode>"s</h3>
  <p>Remember that the value of a register will always be the value from the last instruction that wrote to it. However, with instructions that reference registers that have already <LearnInlineCode>mov</LearnInlineCode>-ed to, the new register value will be the value of the instruction <i>at that particular time.</i> This may seem confusing, but look at the example below:</p>
  <LearnInlineCode>
mov r0, #5
mov r1, r0
mov r0, #4
halt
  </LearnInlineCode>
  <p>The value of r1 at the end of that program will be 5, not 4. An easy way to figure out the value of a particular register is this: Look for the first instruction before halt that has a destination of your register, which is r1 in this case. Then, look for its source. Now, look for the first instruction before that which writes to the new destination register. Just keep going until you find the source. If you can't find a source, then you've found a bug in the program, since this value may be anything! Here's an example of this method:</p>
  <LearnInlineCode>
mov r0, #5
mov r1, r0
mov r0, #4
<span class="text-success">halt</span> <span class="text-muted">We're starting here, at the end of the program.</span>
  </LearnInlineCode>
  <br/>
  
  <LearnInlineCode>
mov r0, #5
mov <span class="text-success">r1</span>, <span class="text-success">r0</span> <span class="text-muted">We notice that this instruction is the first one that writes to our register and it gets its value from r0.</span>
mov r0, #4
halt
  </LearnInlineCode>
  <br/>
  
  <LearnInlineCode>mov <span class="text-success">r0</span>, <span class="text-success">#5</span> <span class="text-muted">We go up from the last instruction to find this one, which sets r0 to 5.</span>
mov r1, r0
mov r0, #4
<span class="text-danger">halt</span> We do not go back to the end of the program.
  </LearnInlineCode>
  
  <p>This means that r1 at the end of the program must be 5. If we had gotten to the top of the program and still not found that last instruction, then this would mean that the program is using an unknown value, possibly from another program, which is a bug.</p>
</div>
</template>

<script>
import LearnUtils from '@/js/LearnUtils.js'
import LearnASM from '@/js/lang/LearnASM.js'

import PracticeMovIMM from '@/components/Practice/PracticeMovIMM'
import PracticeMovR2R from '@/components/Practice/PracticeMovR2R'

export default LearnUtils.createDefaultLearn(
  ['lesson1', 'part1', 'page4'],
  'MOVing-MOVs',
  {},
  { PracticeMovIMM, PracticeMovR2R })
</script>

<style scoped>
</style>
