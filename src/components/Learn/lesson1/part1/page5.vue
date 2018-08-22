<template>
<div>
  <h3>Try this...</h3>
  <p>Try <LearnInlineCode>mov</LearnInlineCode>-ing the number 100000 into r0. That's 100,000 or a one with five zeroes. But don't forget to <LearnInlineCode>halt</LearnInlineCode>!</p>
  
  <center><div class="card border-primary mb-3" style="max-width: 40rem; text-align: left;">
    <div class="card-header">
      <CtrlButtons :system="systems.mov" :speed_vars="speed_vars"></CtrlButtons>
    </div>
    <div class="card-body" style="padding: 0px; margin-right: 5px;">
      <div class="row">
        <div class="col-sm-6 col-md-3" v-for="i in [0,1,2,3]"><table class="table table-hover">
          <thead>
            <tr>
              <th scope="col">Register</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">R{{0+i*2}}</th>
              <td>{{systems.mov.cpu.registers[0+i*2]}}</td>
            </tr>
            <tr>
              <th scope="row">R{{1+i*2}}</th>
              <td>{{i == 3 ? "Line" : systems.mov.cpu.registers[1+i*2]}}</td>
            </tr>
          </tbody>
        </table></div>
      </div>
    </div>
    <div class="card-body" style="padding: 0px;">
      <CorePaneEditor :system="systems.mov" :activelines="systems.mov.active_lines"></CorePaneEditor>
    </div>
  </div></center>
  <p>See that error message? You'll find that you'll get the same thing when you try to <LearnInlineCode>mov</LearnInlineCode> the number 65536, but not when you try to <LearnInlineCode>mov</LearnInlineCode> the number 65535.</p>
  
  <h4>Why?</h4>
  <p>It's actually really simple: If registers are just like pieces of paper on a desk, then, like a piece of paper, they don't have unlimited space. Eventually, they'll run out of room. 65535 is just the upper limit: One more than that and you don't have enough room. When that error message popped up, that was the computer panicking because it found a number that it literally does not have enough room to remember. So if you ever see "Invalid number," you know that your number is probably too big. You'll learn why it's 65535 exactly soon. In short, even though 65535 seems like a random number to us, if we convert it to binary, it makes perfect sense.</p>
  
  <h4>Other invalid numbers</h4>
  <h5>Negative Numbers</h5>
  <p>Negative numbers can be represented and used in a computer, but not this way. Running <LearnInlineCode>mov r0, #-1</LearnInlineCode> does not create a negative number. We'll cover this later.</p>
  <h5>Decimals</h5>
  <p>Like with negative numbers, simply putting the decimal in the instruction, such as writing <LearnInlineCode>mov r0, #1.2</LearnInlineCode>, doesn't work. We'll cover an easy way to work with decimals relatively soon.</p>
  <h4>So, which numbers <i>can</i> I use?</h4>
  <p>Any numbers from 0 to 65535 are fair game to use in an immediate (number with a "<LearnInlineCode>#</LearnInlineCode>" in front of it) not including any decimals.</p>
  <LearnInlineCode>
mov r0, #0<span class="text text-muted"> ; <span class="text text-success">Ok</span></span>
mov r1, #5<span class="text text-muted"> ; <span class="text text-success">Ok</span></span>
mov r2, #98765<span class="text text-muted"> ; <span class="text text-danger">Incorrect (bigger than 65535)</span></span>
mov r3, #-1<span class="text text-muted"> ; <span class="text text-danger">Incorrect (less than 0)</span></span>
mov r4, #0.5<span class="text text-muted"> ; <span class="text text-danger">Incorrect (it's a decimal)</span></span>
  </LearnInlineCode><br/><br/>
</div>
</template>

<script>
import LearnUtils from '@/js/LearnUtils.js'
import LearnASM from '@/js/lang/LearnASM.js'

export default LearnUtils.createDefaultLearn(
  ['lesson1', 'part1', 'page5'],
  'Size-of-Registers',
  { 'mov': LearnASM },
  {})
</script>

<style scoped>
</style>
