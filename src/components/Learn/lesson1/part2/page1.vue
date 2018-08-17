<template>
<div>
  <h3>What is an operation?</h3>
  <p>It's easier to give examples of operations, such as addition, subtraction, multiplication, and division, than to actually define what an operation is. In LearnASM, operations just do something with data.</p>
  <h4>Operations in Programs</h4>
  <p>Remember that with <LearnInlineCode>mov</LearnInlineCode>, there were only two arguments: A destination to put the data and a source to copy that data from. But this won't work with operations like addition. When you add, you add two numbers, not one. To perform an operation, you actually give the computer a destination, a source 1, and a source 2. So now an operation looks like this:</p>
<LearnInlineCode>add <b>r0</b>, r1, r2</LearnInlineCode>
  <p>That code is essentially the same as writing <LearnInlineCode><b>r0</b> = r1 + r2</LearnInlineCode>. Notice that the <i>first</i> argument (<LearnInlineCode><b>r0</b></LearnInlineCode>) is still the destination. If you look at the "equation" form, it makes sense: The destination is the first argument since we usually write the variable we're "setting" first. In fact, it is really helpful to remember this equation when typing assembly code.</p>
  <h5>Immediates?</h5>
  <p>If you remember, <i>immediates</i> are basically numbers that you tell to the computer using a "<LearnInlineCode>#</LearnInlineCode>." These also always happen to be the <i>last</i> argument in assembly code. This is true when doing operations as well:</p>
<LearnInlineCode>add r0, r1, <b>#5</b></LearnInlineCode>
  <p>That code above is perfectly OK. However, <b>only</b> the last argument can be an immediate. In the previous little bit of code, that <LearnInlineCode>r1</LearnInlineCode> could not have been replaced with <LearnInlineCode>#3</LearnInlineCode>. This is because this allows computer designers to use fewer circuits since the only time you'd need two sources that are immediate numbers is when you're adding two numbers, which you can just add when you're writing the program and use <LearnInlineCode>mov</LearnInlineCode> instead. Computer designers generally make the assumption that you can actually add #3 and #5 before the program is run. What I mean is this:</p>
  <LearnInlineCode>x = ? + 5</LearnInlineCode>
  <p>If I ask you for the value of x, you'll always have to give me that "?" You can't avoid it because you don't know its value. But if I gave you this:</p>
  <LearnInlineCode>x = 3 + 5</LearnInlineCode>
  <p>You could easily see that x is 8. Computer designers assume that your programs aren't going to be working with fixed values all the time, otherwise there's little point to running a computer program since you could just use a calculator. However, if you want to add two numbers that you know when you're writing the program, you could write the following:</p>
  <LearnInlineCode>
mov r1, #3
add r0, r1, #5
  </LearnInlineCode>
  
  <h4>Operations changing their own values</h4>
  <p>Take a look at this code:</p>
  <LearnInlineCode>add r0, r0, #1</LearnInlineCode>
  <p>You'll see that both the first source and the destination are the same and they're both <LearnInlineCode>r0</LearnInlineCode>. Remember that computers only do one thing at once. When a computer sees this, it'll first add the <i>old</i> value of <LearnInlineCode>r0</LearnInlineCode> with 1. After that, it'll put the result back in <LearnInlineCode>r0</LearnInlineCode>, overwriting the old value. This way, that little bit of code changes the value of <LearnInlineCode>r0</LearnInlineCode> by one. Since this is a bit different from what you're taught in math class, it'll take some getting used to.</p>
</div>
</template>

<script>
import LearnUtils from '@/js/LearnUtils.js'
import LearnASM from '@/js/lang/LearnASM.js'

export default LearnUtils.createDefaultLearn(
  ['lesson1', 'part2', 'page1'],
  'Writing-Operations',
  {},
  {})
</script>

<style scoped>
</style>
