<template>
<div>
  <h3>Data in Computers</h3>
  <p>As you probably already know, data in a computer is stored in ones and zeroes, but have you ever stopped to think about just <i>how many</i> ones and zeroes your computer stores? Well, your phone alone stores tens of billions of ones and zeroes. Your computer stores hundreds of billions of not trillions of ones and zeroes! It would be seemingly impossible for a computer to pick out a <i>single</i> one or zero out of all of those ones and zeroes to change, right?</p>
  <p>It seems impossible to do because it is. Generally, with computers, simpler is better. Computer designers figured out that by reducing the number of ones and zeroes the computer has to focus on at one time, a computer will speed up. Think of it this way: You keep papers out on your desk so that you can quickly glance at them or write on them if you need to. Imagine how difficult it would be to do work if every single time you wanted to write something on a homework assignment, you had to dig it out of your bag only to put it back when you were done writing that single letter. Not only would that be incredibly stupid, it would take nearly forever to do homework, right? That's why we have a desk: You can put your work on your desk while you're still working on it. Then, to save desk space when you're done, you can put it back.</p>
  <p>Modern computers work exactly like this. When they need to do something with data, they place it in their <i>registers.</i> The word "registers" is somewhat hard to remember, so if you need to remember it, just think that registers are like exactly like desk space: You have a limited amount of it, but it's really easy to do work on it.</p>
  <p>

  <h4>Registers</h4>
  <p>Unlike a piece of paper on a desk, a register holds a single number and that's it. In addition, you have only seven registers available to use for whatever you would like. The eighth register is how the computer remembers where to find the next instruction, so you can't use it for your own uses, but it will become useful later on.</p>
  <p>The registers have names, but they're a bit different from names most of us are used to. The names are the letter "r" with a number from 0 to 7 stuck on the end. This means that you have to start counting from zero. If you are not used to it, it's really important to remember because nearly everything in a computer is counted from zero, not one. In short, you call each of the registers <LearnInlineCode>r0</LearnInlineCode>, <LearnInlineCode>r1</LearnInlineCode>, <LearnInlineCode>r2</LearnInlineCode>, <LearnInlineCode>r3</LearnInlineCode>, <LearnInlineCode>r4</LearnInlineCode>, <LearnInlineCode>r5</LearnInlineCode>, <LearnInlineCode>r6</LearnInlineCode> and <LearnInlineCode>r7</LearnInlineCode>.</p>

  <h3>New Instructions</h3>
  <p>Now, you need to know how to put data in these registers. This is done with an instruction called "<LearnInlineCode>mov</LearnInlineCode>," which is short for "move." Why save the extra letter? Well, there isn't really a reason, but it dates back to the original Intel chips.</p>
  <p>However, "<LearnInlineCode>mov</LearnInlineCode>" needs both a destination and a source to "<LearnInlineCode>mov</LearnInlineCode>" to and from. To give the "<LearnInlineCode>mov</LearnInlineCode>" instruction data to operate with, we seperate the "<LearnInlineCode>mov</LearnInlineCode>" with a space, then we put our data after that seperated by a comma. But first, there's one oddity to assembly LearnInlineCode: You always put the destination first. For example, if you wanted to put the number five into the first register (<LearnInlineCode>r0</LearnInlineCode>), you could write:</p>
  <LearnInlineCode>mov r0, #5</LearnInlineCode>
  <p>So what is the #5, then? Simple: It's what's called an <i>immediate.</i> In other words, it's a value that's available to the computer <i>immediate</i>ly after it reads the instruction. We give the computer an immediate by placing a "#" symbol in front of our number. However, do not place commas in between digits of the numbers: Some people like to write "1,000" instead of "1000." Do not do this! The computer can't tell the difference between that comma and a comma giving it more data.</p>

  <h4>Practice</h4>
  <p>This new concept can be confusing, so don't be worried if it doesn't really make too much sense yet. You need a bit of practice! Try the problems below, but remember: The destination ALWAYS goes first and you give the computer an immediate number with the "#" symbol. If you're still stuck, feel free to click the "Next" button and the practice problem will show you the correct answer.</p>
  <LearnPractice :question_count="5" :question_controllers="[qna.PracticeMovIMM]"></LearnPractice>

  <p>Feel free to complete the practice as many times as you want until you feel confident.</p>

  <h4>MOV in programs</h4>
  <p>Notice that below you now can see all eight registers. Note that R7 says "Line" to mean the current line location.</p>
  <p>Here you can try out some "<LearnInlineCode>mov</LearnInlineCode>" instructions! I've given you a view of all eight registers so you can see what's going on, except that since r7 is used to store the location where the computer is looking instructions, it says "Line." You don't need to worry about it right now. Anyway, have fun and remember to put "<LearnInlineCode>halt</LearnInlineCode>" at the end of your program!</p>

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

  <p>You may have noticed that the registers save their values even when you run the program a second time. When programming, you cannot expect <i>anything.</i> These registers may be zero at the start, they may be the value you last set them to, or they may be the value that another program put in there. If you want the registers to default to anything, you must set them first.</p>

  <p>Another thing you may or may not have noticed is that a register is always the value is was <i>last</i> assigned. This is because each "<LearnInlineCode>mov</LearnInlineCode>" instruction sets the value of a register, overwriting any previous changes. You can always look to the last instruction that modified a register to figure out it's value</p>
</div>
</template>

<script>
import LearnUtils from '@/js/LearnUtils.js'
import LearnASM from '@/js/lang/LearnASM.js'

import PracticeMovIMM from '@/components/Practice/PracticeMovIMM'

export default LearnUtils.createDefaultLearn(
  ['lesson1', 'part1', 'page3'],
  'MOVing-Data',
  { mov: LearnASM },
  { PracticeMovIMM })
</script>

<style scoped>
</style>
