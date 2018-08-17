<template>
<div>
  <h3>Your First Operations</h3>
  
  <h4>Add</h4>
  <p>You've already seen that our first operation is <LearnInlineCode>add</LearnInlineCode>, which, of course, adds values. Here's an example of <LearnInlineCode>add</LearnInlineCode> in action:</p>
  <LearnInlineCode>add r2, r0, r1
  </LearnInlineCode>
  <p>...which means...</p>
  <p><i>Set r2 to the value of r0 + r1</i></p>
  <p>Again remember that the destination always comes first. If you ever get confused, think back to formulas from math class. You were first taught to put the variable that you're modifying first.</p>
  
  <LearnPractice :question_count="5" :question_controllers="[qna.PracticeAddSyntaxIMM, qna.PracticeAddSyntaxR2R]"></LearnPractice>
  
  <h5>The Maximum</h5>
  <p>The minimum and maximum does also apply to addition. When you're first taught to add, you are sometimes taught to add on a number line. You start up at your first number and then count up the number of spaces you have for your second number. Then, you arrive at your solution. So, if you added 65535 to 2, you'd get 65537:</p>
  
  <center style="overflow: auto; width: 100%;"><svg width="600" height="150">
    <defs>
      <marker orient="auto" id="arrow" overflow="visible">
        <path d="M4 0 L-4 -2 L-4 2 Z"/>
      </marker>
      <marker orient="auto" id="arrow-backwards" overflow="visible">
        <path d="M-8 0 L0 -2 L0 2 Z"/>
      </marker>
    </defs>
    <g transform="translate(25 100)">
      <text x="-5" y="-6">0</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <g transform="translate(50 100)">
      <text x="-5" y="-6">1</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <g transform="translate(75 100)">
      <text x="-5" y="-6">2</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <g transform="translate(450 100)">
      <text x="-40" y="-6">65535</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <g transform="translate(475 100)">
      <text x="-20" y="-6">65536</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <g transform="translate(500 100)">
      <text x="0" y="-6">65537</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <path transform="translate(75 100)" d="M0 -20 C 0 -20 212 -50 425 -20" style="stroke:rgb(0,0,0); fill: none; stroke-width:2; marker-end: url(#arrow);"></path>
    <text x="225" y="60">+65535</text>
    <line x1="20" y1="100" x2="580" y2="100" style="stroke:rgb(0,0,0); stroke-width:2; marker-start: url(#arrow-backwards); marker-end: url(#arrow);"/>
  </svg></center>
  
  <p>But the LearnASM computer doesn't think this way: Remember that it has a limit of 65535, so the computer can't actually understand the number 65537. To continue the addition operation, the computer does what's called <i>wrapping around</i> at 65536. This means that instead of counting "2, 3, ... 65534, 65535, 65536, 65537" the computer counts "2, 3, ... 65534, 65535, 0, 1." You can think of this like a playlist on repeat: If there are only 50 songs in the playlist, after song #50, song #1 will play. Remember that the computer starts counting at zero, so even though there are 65536 numbers, the maximum number you can have is 65535. So, if you added 65535 to 2, you'd get 1:</p>
  
  <center style="overflow: auto; width: 100%;"><svg width="600" height="150">
    <defs>
      <marker orient="auto" id="arrow" overflow="visible">
        <path d="M4 0 L-4 -2 L-4 2 Z"/>
      </marker>
      <marker orient="auto" id="arrow-backwards" overflow="visible">
        <path d="M-8 0 L0 -2 L0 2 Z"/>
      </marker>
    </defs>
    <g transform="translate(25 100)">
      <text x="-5" y="-6">0</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <g transform="translate(50 100)">
      <text x="-5" y="-6">1</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <g transform="translate(75 100)">
      <text x="-5" y="-6">2</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <g transform="translate(450 100)">
      <text x="-30" y="-6">65535</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <g transform="translate(475 100)">
      <text x="-5" y="-6">0</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <g transform="translate(500 100)">
      <text x="0" y="-6">1</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <path transform="translate(75 100)" d="M0 -20 C 0 -20 212 -50 415 -20" style="stroke:rgb(0,0,0); fill: none; stroke-width:2; marker-end: url(#arrow);"></path>
    <text x="225" y="60">+65535</text>
    <line x1="20" y1="100" x2="580" y2="100" style="stroke:rgb(0,0,0); stroke-width:2; marker-start: url(#arrow-backwards); marker-end: url(#arrow);"/>
  </svg></center>
  
  <LearnPractice :question_count="5" :question_controllers="[qna.PracticeAddNormal, qna.PracticeAddCarry]"></LearnPractice>
  
  <h4>Sub</h4>
  <p>You've also probably guessed that our second operation is subtraction, which you write as <LearnInlineCode>sub</LearnInlineCode>. Just like last time, here's an example of <LearnInlineCode>sub</LearnInlineCode> in action:</p>
  <LearnInlineCode>sub r2, r0, r1
  </LearnInlineCode>
  <p>...which means...</p>
  <p><i>Set r2 to the value of r0 - r1</i></p>
  <h5>The Maximum</h5>
  <p>The maximum when subtracting is the same as the maximum in addition, but in the opposite direction. Instead of wrapping around after the number is at 65535, subtraction wraps around to 65535 after the number is at 0. For example, if you wanted to subtract 65535 from 1...</p>
  
  <center style="overflow: auto; width: 100%;"><svg width="600" height="150">
    <defs>
      <marker orient="auto" id="arrow" overflow="visible">
        <path d="M4 0 L-4 -2 L-4 2 Z"/>
      </marker>
      <marker orient="auto" id="arrow-backwards" overflow="visible">
        <path d="M-8 0 L0 -2 L0 2 Z"/>
      </marker>
    </defs>
    <g transform="translate(25 100)">
      <text x="-5" y="-6">0</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <g transform="translate(50 100)">
      <text x="-5" y="-6">1</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <g transform="translate(75 100)">
      <text x="-5" y="-6">2</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <g transform="translate(450 100)">
      <text x="-30" y="-6">65535</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <g transform="translate(475 100)">
      <text x="-5" y="-6">0</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <g transform="translate(500 100)">
      <text x="-5" y="-6">1</text>
      <line x1="0" y1="-5" x2="0" y2="5" style="stroke:rgb(0,0,0); stroke-width:2;"></line>
    </g>
    <path transform="translate(75 100)" d="M20 -20 C 20 -20 212 -50 415 -20" style="stroke:rgb(0,0,0); fill: none; stroke-width:2; marker-start: url(#arrow-backwards);"></path>
    <text x="225" y="60">- 65535</text>
    <line x1="20" y1="100" x2="580" y2="100" style="stroke:rgb(0,0,0); stroke-width:2; marker-start: url(#arrow-backwards); marker-end: url(#arrow);"/>
  </svg></center>
  <p>Finally, if you subtracted 1 from 0, you'd normally get -1, but LearnASM would give you 65535. It's as if zero was replaced with 65536. Remember that this is very difficult, so you're doing well to get this far.</p>
  <LearnPractice :question_count="5" :question_controllers="[qna.PracticeSubNormal]"></LearnPractice>
</div>
</template>

<script>
import LearnUtils from '@/js/LearnUtils.js'

import PracticeAddSyntaxIMM from '@/components/Practice/PracticeAddSyntaxIMM'
import PracticeAddSyntaxR2R from '@/components/Practice/PracticeAddSyntaxR2R'
import PracticeAddNormal from '@/components/Practice/PracticeAddNormal'
import PracticeAddCarry from '@/components/Practice/PracticeAddCarry'
import PracticeSubNormal from '@/components/Practice/PracticeSubNormal'

export default LearnUtils.createDefaultLearn(
  ['lesson1', 'part2', 'page2'],
  'Addition-and-Subtraction',
  { },
  { PracticeAddSyntaxIMM, PracticeAddSyntaxR2R, PracticeAddNormal, PracticeAddCarry, PracticeSubNormal })
</script>

<style scoped>
#vis-arrow-active > path {
  fill-rule: evenodd;
  stroke: #000;
  fill: #000;
  stroke-width: .4pt;
}
</style>
