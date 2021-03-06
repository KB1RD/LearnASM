<template>
<div>
  <p>My previous analogy, the one where a computer is a person holding a calculator, is somewhat inaccurate. The problem is that you can assume that a person has some general intelligence and can figure out how to use a calculator. That's just not true of computers. Computers are some of the dumbest machines on Earth that can add, if not <i>the</i> dumbest. Your set of instructions must have incredible detail. In my analogy, you would have to tell the person <i>exactly</i> which buttons to push. You can't get away with saying "Add one plus one." You would have to say: "Push one then push plus then push 1 then push equals then read the result."</p>

  <h3>Instructions</h3>
  <p>The way computers know which operation to do is through instructions. When we read and write instructions, they're made up of letters. By reading particular sequences of letters, we know what to do. Instructions in a computer are pretty similar. They're made up of particular sequences of 1s and 0s that the computer can understand. By reading these 1s and 0s, the computer knows what operations to perform on what data. Any slightly different sequence means that the computer may run a completely different operation.</p>

  <h4>The Assembler</h4>
  <p>Of course, I'm not expecting anyone to program in 1s and 0s. It may sound cool, but I speak from experience: It's just really annoying. So instead of going through that, we give a special program called the "assembler" text that it then turns into 1s and 0s for the computer. Don't worry! All of this is build right into LearnASM, so you don't need to worry about it.</p>

  <h4>Instructions vs. Programs</h4>
  <p>So... is my program an instruction?</p>
  <p>Nope. With the exception of one small case, your program is not just <i>one</i> instruction, it's many instructions put together to do something useful. On its own, an instruction does virtually nothing. It's only when that instruction is put in context of the rest of the program that it makes any real sense. It's like asking if a word is a book. You could make a one word book, it'd just be a really boring book.</p>

  <h3>Your First Instruction</h3>
  <p>Speaking of instructions, it's time you learn your first instruction. Your first instruction is the following:</p>
  <table class="table table-hover" style="max-width: 20rem;">
    <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Function</th>
      </tr>
    </thead>
    <tbody>
      <tr class="table-default">
        <th scope="row"><LearnInlineCode>halt</LearnInlineCode></th>
        <td>Halts the program.</td>
      </tr>
    </tbody>
  </table>
  <p>I suppose it's a bit of a disappointment, but still, it's a start.</p>

  <h4>Writing your first program</h4>
  <p>In theory, it seems easy to come up with a program, but when you sit in front of an actual text prompt it can be a bit scary. However, one you break it down it's easy: There's one instruction per line. That's it! Knowing which instructions to type is the hard part, but you don't have to worry about that yet.</p>

  <!-- Note: I'm using incorrect grammar with the quotes on purpose, so users know to type "halt," but not the comma -->
  <h5>Go ahead and write your first instruction, "<LearnInlineCode>halt</LearnInlineCode>", in the text prompt below:</h5>
  <p>Once you're done, click run!</p>
  
  <center><div class="card border-primary mb-3" style="max-width: 40rem; text-align: left;">
    <div class="card-header">
      <CtrlButtons :system="systems.first_program" :speed_vars="speed_vars"></CtrlButtons>
    </div>
    <div class="card-body" style="padding: 0px;">
      <CorePaneEditor :system="systems.first_program" :activelines="systems.first_program.active_lines"></CorePaneEditor>
    </div>
  </div></center>

  <h4>You should see a "Halt condition detected" alert</h4>
  <p>Congradulations! You just wrote your first program! While it may not seem like a very complicated program, the "<LearnInlineCode>halt</LearnInlineCode>" instruction is critical. Try removing all the text and click run again. You should see an "Undefined Instruction" error. What this means is that the computer tried to read a section of memory with nothing in it. A normal computer wouldn't warn you about this. Instead, it could crash, do something completely random, or worse: it could run, say, a virus that just happens to be stored right after your program.</p>

  <h4>Why does this happen?</h4>
  <p>So your program is like a list. If the computer goes down this list that is your program and you haven't told it to stop, it doesn't know where the end is. So it'll just keep going. LearnASM will give you the "Undefined Instruction" error when the computer reaches the end of the list, but in future programs you may have some data stored at the end of the list like so:</p>
  <ol>
    <li>Code</li>
    <li>...</li>
    <li>Code</li>
    <li>Data</li>
  </ol>
  <p>But the computer, being really stupid, will interpret this data as an instruction and will end up doing something completely random. That's why you need <LearnInlineCode>halt</LearnInlineCode>: to tell the computer where the end is. The code above should become this:</p>
  <ol>
    <li>Code</li>
    <li>...</li>
    <li>Code</li>
    <li><LearnInlineCode>halt</LearnInlineCode></li>
    <li>Data</li>
  </ol>
  <p>Moral of the story: Put "<LearnInlineCode>halt</LearnInlineCode>" at the end of all your programs! Your program isn't done until <i>you</i> say so!</p>

  <p class="text-muted"><b><u>Note:</u></b> I have been and will be talking about "computers" in general. However, not all computers work the same way. There is no "correct" way to set up a computer. You will find many computers that are completely different from LearnASM and in those cases my statements don't apply!</p>
</div>
</template>

<script>
import LearnUtils from '@/js/LearnUtils.js'
import LearnASM from '@/js/lang/LearnASM.js'

export default LearnUtils.createDefaultLearn(['lesson1', 'part1', 'page2'], 'Your-First-Program', {first_program: LearnASM})
</script>

<style scoped>
</style>
