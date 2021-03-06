<template>
<div>
  <NavBar :version="version" :links="navbar_links" :sticky="true" :home="home_url"></NavBar>
  <div class="jumbotron">
    <h1 class="display-4">The LearnASM Technical Reference Manual</h1>
    <p class="lead">The TRM is for experienced assembly programmers that would like to learn more about LearnASM.</p>
    <hr class="my-4">
    <p class="lead">
      <a class="btn btn-primary btn-lg" href="#intro" role="button">Intro</a>
      <a class="btn btn-primary btn-lg" href="#ins-format" role="button">Instruction Format</a>
      <a class="btn btn-primary btn-lg" href="#vm" role="button">The Virtual Machine</a>
      <a class="btn btn-primary btn-lg" href="#assembly-directives" role="button">Assembly & Directives</a>
      <a class="btn btn-danger btn-lg" href="#future-changes" role="button">Future Changes</a>
    </p>
  </div>

  <div class="container" id="intro">
    <h3>Welcome to LearnASM!</h3>
    <h4>Basics</h4>
    <p>LearnASM is a RISC load-store architecture. LearnASM is designed with the goal of being easy to learn and use relative to other assembly languages and for this reason it is not nearly as efficient as some other languages. LearnASM has 7 16-bit registers and a word size of 16 bits. The last three registers are reserved for special uses, but only the last register cannot be used as a general purpose register.</p>
    <div style="overflow: auto; width: 100%;"><table class="table table-hover">
      <thead>
        <tr>
          <th scope="col">Register Name</th>
          <th scope="col">Alternate Name</th>
          <th scope="col">General Purpose?</th>
          <th scope="col">Functions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">R0</th>
          <td></td>
          <td>Yes</td>
          <td>GP</td>
        </tr>
        <tr>
          <th scope="row">R1</th>
          <td></td>
          <td>Yes</td>
          <td>GP</td>
        </tr>
        <tr>
          <th scope="row">R2</th>
          <td></td>
          <td>Yes</td>
          <td>GP</td>
        </tr>
        <tr>
          <th scope="row">R3</th>
          <td></td>
          <td>Yes</td>
          <td>GP</td>
        </tr>
        <tr>
          <th scope="row">R4</th>
          <td></td>
          <td>Yes</td>
          <td>GP</td>
        </tr>
        <tr class="table-secondary">
          <th scope="row">R5</th>
          <td>LR</td>
          <td>Yes</td>
          <td>GP. Used by the BL pseudocode as a link register.</td>
        </tr>
        <tr class="table-secondary">
          <th scope="row">R6</th>
          <td>SP</td>
          <td>Yes</td>
          <td>GP. Used by the PUSH and POP pseudocodes, but not treated differently by hardware.</td>
        </tr>
        <tr class="table-info">
          <th scope="row">R7</th>
          <td>NI/PC</td>
          <td>No</td>
          <td>Stores the next address that will be executed.</td>
        </tr>
      </tbody>
    </table></div>
    
    <h4>CPU Setup</h4>
    <p>The CPU setup is very simple. The eight registers are placed along two input busses (SRC0 and SRC1) that feed into two inputs of the ALU. When the correct register is contained in the instruction, the value of a particular register is placed on the SRC0 bus, SRC1 bus, or both. The SRC1 bus is special: It also allows the input of an 8 bit immediate. The ALU interprets the opcode of the instruction and then determines what to do with the input data. During a MOV instruction, for example, it simply passes the SRC1 value along to the output. The output of the ALU then goes into the destination bus, which registers will accept as their value depending on the selected destination register in the instruction.</p>
    
    <!-- IMAGE BUG -->
    <!-- I spent well over an hour debugging this and searching for answers online, to which I have found none. -->
    <!--<center style="overflow: auto; width: 100%;"><image :src="CPUSVG" alt="The CPU block diagram"></image></center>-->
    <!-- The above code requires that you uncomment some stuff in the JavaScript below as well, but it will not work. -->
    <!-- The image will not even load, however, you can actually copy the "src" component out of it via inspect element, -->
    <!-- paste it into the browser bar, and it will load just fine. So this seems to be a problem with <img> tags... -->
    <!-- From my debugging, I have learned that NO <img> tag placed in a .vue file will work. -->
    <!-- Try placing the following in this file: -->
    <!-- <image src="https://www.kb1rd.net/test.svg" width="45" height="45" alt="TEST!"></image> -->
    <!-- You will find that this does not work. It's the same thing if you place it right in App.vue. -->
    <!-- However, if you place it in index.html, it works just fine. This looks like a Vue.JS bug -->
    
    <!-- Workaround: -->
    <center style="overflow: auto; width: 100%;"><CPUBlockDiagramSVG></CPUBlockDiagramSVG></center>
    
    
    <h5>LDR and STR</h5>
    <p>LDR (load) and STR (store) instructions are accomplished by placing values from SRC0 and SRC1 onto the central bus and values from the central bus onto the destination bus. During these instructions, the ALU does nothing and writes neither 1s nor 0s to it's output, allowing the central bus to control the target register during a LDR instruction. During a STR instruction, no registers are impacted.</p>
    <h5>Flags</h5>
    <p>Flags are updated by setting the update bit in the instruction and will be updated by the ALU. During a LDR instruction, the Z (zero) and N (negative) flags are updated and all others are cleared. During a STR instruction, flags are not modified even if the update bit is set. Reading the flags is done using condition codes. Depending upon the value of the condition code bits in an instruction and the flags, an instruction may or may not execute. The condition code values will be covered in the <a href="#ins-format">Instruction Format</a> section.</p>
  </div>
  
  <div class="container" id="ins-format">
    <h3>Instruction Format</h3>
    <p>The 32-bit instruction format is as follows:</p>
    <div style="overflow: auto; width: 100%;"><table class="table table-hover">
      <thead>
        <tr>
          <th scope="col" colspan="8" v-for="i in 4">Byte {{i-1}}</th>
        </tr>
      </thead>
      <tbody>
        <tr class="table-active">
          <th colspan="1" v-for="i in 32">{{(i-1)%8}}</th>
        </tr>
        <tr>
          <th class="table-primary" colspan="4">Cond. Code</th>
          <th class="table-success" colspan="4">Opcode</th>
          <th class="table-info" colspan="3">Dest</th>
          <th class="table-warning" colspan="1">U</th>
          <th class="table-danger" colspan="3">Src0</th>
          <th class="table-secondary" colspan="1">0</th>
          <th class="table-primary" colspan="3">Src1</th>
          <th class="table-secondary" colspan="5">RESERVED</th>
          <th class="table-secondary" colspan="1">0</th>
          <th class="table-info" colspan="2">Mode</th>
          <th class="table-secondary" colspan="5">RESERVED</th>
        </tr>
        <tr>
          <th class="table-primary" colspan="4">Cond. Code</th>
          <th class="table-success" colspan="4">Opcode</th>
          <th class="table-info" colspan="3">Dest</th>
          <th class="table-warning" colspan="1">U</th>
          <th class="table-danger" colspan="3">Src0</th>
          <th class="table-secondary" colspan="1">0</th>
          <th class="table-primary" colspan="8">Src1 8-bit Immediate</th>
          <th class="table-secondary" colspan="1">1</th>
          <th class="table-info" colspan="2">Mode</th>
          <th class="table-secondary" colspan="5">RESERVED</th>
        </tr>
        <tr>
          <th class="table-primary" colspan="4">Cond. Code</th>
          <th class="table-success" colspan="4">Opcode</th>
          <th class="table-info" colspan="3">Dest</th>
          <th class="table-warning" colspan="1">U</th>
          <th class="table-danger" colspan="3">Src0</th>
          <th class="table-secondary" colspan="1">1</th>
          <th class="table-primary" colspan="16">Src1 Immediate</th>
        </tr>
      </tbody>
    </table></div>
    
    <h4 id="ins-format-cond-code">Condition Code</h4>
    <p>The condition code specifies whether the instruction will be executed or not depending upon the flags. Based on the result of a subtraction operation, it is possible to compare values, and so they are named based upon the results of such an operation. They are as follows:</p>
    <div style="overflow: auto; width: 100%;"><table class="table table-hover">
      <thead>
        <tr>
          <th scope="col">Hex</th>
          <th scope="col">Name</th>
          <th scope="col">Condition</th>
          <th scope="col">Suffix(es)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">0</th>
          <td>Equal</td>
          <td>Z == 1</td>
          <td>EQ</td>
        </tr>
        <tr>
          <th scope="row">1</th>
          <td>Not Equal</td>
          <td>Z == 0</td>
          <td>NE</td>
        </tr>
        <tr>
          <th scope="row">2</th>
          <td>Greater than or equal to (unsigned)</td>
          <td>C == 1</td>
          <td>CS/HS</td>
        </tr>
        <tr>
          <th scope="row">3</th>
          <td>Less than (unsigned)</td>
          <td>C == 0</td>
          <td>CC/LO</td>
        </tr>
        <tr>
          <th scope="row">4</th>
          <td>Result is negative</td>
          <td>N == 1</td>
          <td>MI</td>
        </tr>
        <tr>
          <th scope="row">5</th>
          <td>Result is positive or zero</td>
          <td>N == 0</td>
          <td>PL</td>
        </tr>
        <tr>
          <th scope="row">6</th>
          <td>Overflow into sign bit</td>
          <td>V == 1</td>
          <td>VS</td>
        </tr>
        <tr>
          <th scope="row">7</th>
          <td>No sign overflow</td>
          <td>V == 0</td>
          <td>VC</td>
        </tr>
        <tr>
          <th scope="row">8</th>
          <td>Greater than (unsigned)</td>
          <td>(C == 1) && (Z == 0)</td>
          <td>HI</td>
        </tr>
        <tr>
          <th scope="row">9</th>
          <td>Less than or equal to (unsigned)</td>
          <td>(C == 0) || (Z == 1)</td>
          <td>LS</td>
        </tr>
        <tr>
          <th scope="row">A</th>
          <td>Greater than or equal to (signed)</td>
          <td>N == V</td>
          <td>GE</td>
        </tr>
        <tr>
          <th scope="row">B</th>
          <td>Less than (signed)</td>
          <td>N != V</td>
          <td>LT</td>
        </tr>
        <tr>
          <th scope="row">C</th>
          <td>Greater than (signed)</td>
          <td>(Z == 0) && (N == V)</td>
          <td>GT</td>
        </tr>
        <tr>
          <th scope="row">D</th>
          <td>Less than or equal to (signed)</td>
          <td>(Z == 1) || (N != V)</td>
          <td>LE</td>
        </tr>
        <tr>
          <th scope="row">E</th>
          <td>Always</td>
          <td>1</td>
          <td>AL/none</td>
        </tr>
        <tr>
          <th scope="row">F</th>
          <td>Never</td>
          <td>0</td>
          <td>NV</td>
        </tr>
      </tbody>
    </table></div>
    
    <h4 id="ins-format-opcode">Opcode</h4>
    <p>The available opcodes are as follows:</p>
    <div style="overflow: auto; width: 100%;"><table class="table table-hover">
      <thead>
        <tr>
          <th scope="col">Hex</th>
          <th scope="col">Name</th>
          <th scope="col">Format</th>
          <th scope="col">Flags when update bit set</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">0</th>
          <td>Move</td>
          <td>mov dest, src1</td>
          <td>Cleared</td>
        </tr>
        <tr>
          <th scope="row">1</th>
          <td>Bitwise AND</td>
          <td>and dest, src0, src1</td>
          <td>Z and N modified, others cleared</td>
        </tr>
        <tr>
          <th scope="row">2</th>
          <td>Bitwise OR</td>
          <td>or dest, src0, src1</td>
          <td>Z and N modified, others cleared</td>
        </tr>
        <tr>
          <th scope="row">3</th>
          <td>Bitwise XOR</td>
          <td>xor dest, src0, src1</td>
          <td>Z and N modified, others cleared</td>
        </tr>
        <tr>
          <th scope="row">4</th>
          <td>Add</td>
          <td>add dest, src0, src1</td>
          <td>C, V, Z, and N modified</td>
        </tr>
        <tr>
          <th scope="row">5</th>
          <td>Subtract</td>
          <td>sub dest, src0, src1</td>
          <td>C, V, Z, and N modified</td>
        </tr>
        <tr>
          <th scope="row">6</th>
          <td>Unsigned Multiply</td>
          <td>umul dest, src0, src1</td>
          <td>C, Z, and N modified</td>
        </tr>
        <tr>
          <th scope="row">7</th>
          <td>Signed Multiply</td>
          <td>smul dest, src0, src1</td>
          <td>C, V, Z, and N modified</td>
        </tr>
        <tr>
          <th scope="row">8</th>
          <td>Unsigned Divide</td>
          <td>udiv dest, src0, src1</td>
          <td>C, Z, and N modified</td>
        </tr>
        <tr>
          <th scope="row">9</th>
          <td>Signed Divide</td>
          <td>sdiv dest, src0, src1</td>
          <td>C, V, Z, and N modified</td>
        </tr>
        <tr>
          <th scope="row">A</th>
          <td>Logical Shift Left</td>
          <td>lsl dest, src0, src1</td>
          <td>C, Z, and N modified</td>
        </tr>
        <tr>
          <th scope="row">B</th>
          <td>Logical Shift Right</td>
          <td>lsr dest, src0, src1</td>
          <td>C, Z, and N modified</td>
        </tr>
        <tr>
          <th scope="row">C</th>
          <td>Arithmetic Shift Right</td>
          <td>asr dest, src0, src1</td>
          <td>C, Z, and N modified</td>
        </tr>
        <tr>
          <th scope="row">D</th>
          <td>Rotate Right</td>
          <td>ror dest, src0, src1</td>
          <td>Z and N modified, others cleared</td>
        </tr>
        <tr>
          <th scope="row">E</th>
          <td>Load</td>
          <td>ldr dest, src0</td>
          <td>Z and N modified, others cleared</td>
        </tr>
        <tr>
          <th scope="row">F</th>
          <td>Store</td>
          <td>str src1, src0</td>
          <td>Flags are unchanged</td>
        </tr>
      </tbody>
    </table></div>
    <p>For all instructions, (including LDR and STR) the first operand in the instruction is always the destination, or, in the case of STR, is the register that contains the address of the destination.</p>
    
    <h4 id="ins-format-mode">Mode</h4>
    <p>The mode bits determine which parts of registers are used and are as follows:</p>
    <div style="overflow: auto; width: 100%;"><table class="table table-hover">
      <thead>
        <tr>
          <th scope="col">Hex</th>
          <th scope="col">Name</th>
          <th scope="col">Source Register Usage</th>
          <th scope="col">Destination Register Usage</th>
          <th scope="col">Suffix</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">0</th>
          <td>None</td>
          <td>All 16 bits</td>
          <td>None</td>
          <td>N</td>
        </tr>
        <tr>
          <th scope="row">1</th>
          <td>Top</td>
          <td>Upper 8 bits</td>
          <td>Upper 8 bits</td>
          <td>T</td>
        </tr>
        <tr>
          <th scope="row">2</th>
          <td>Bottom</td>
          <td>Lower 8 bits</td>
          <td>Lower 8 bits</td>
          <td>B</td>
        </tr>
        <tr>
          <th scope="row">3</th>
          <td>Full</td>
          <td>All 16 bits</td>
          <td>All 16 bits</td>
          <td>F</td>
        </tr>
      </tbody>
    </table></div>
    <p>The use of the "None" mode is to allow compare instructions to be performed without impacting registers.</p>
    
    <h4 id="ins-format-update">Update (U) Bit</h4>
    <p>The update bit is very simple: If it is set, the ALU output will modify the flags.</p>
    
    <h4 id="ins-format-registers">Destination, Src0, and Src1</h4>
    <p>The destination and src0 registers both work the same: the register number is stored in the three bit space in the instruction. The src1 value may be from a register or it may be from an immediate stored in the instruction. The source of the src1 value is determined by the value of bits 15 and 24. If bit 15 and bit 24 are zero, the next three bits (16-18) will be used as a register ID just like a destination or src0 register. If bit 15 is zero and bit 24 is one, the next eight bits (16-23) will be used as an immediate. If bit 15 is one, the last 16 bits in the instruction will be used as an immediate value. This is easiest to understand by looking at the table at the start of this section.</p>
  </div>
  
  <div class="container" id="vm">
    <h3>The Virtual Machine</h3>
    <p>The LearnASM Virtual Machine currently has little functionality other than the CPU functionality mentioned above. There are only RAM and ROM banks in the system, however, there is space for memory-mapped IO registers in the future. The memory map is as follows:</p>
    <div style="overflow: auto; width: 100%;"><table class="table table-hover">
      <thead>
        <tr>
          <th scope="col">Start</th>
          <th scope="col">End</th>
          <th scope="col">Function</th>
          <th scope="col">Length</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">0x0000</th>
          <td>0x6FFF</td>
          <td>A general purpose RAM bank. No special functionality.</td>
          <td>28 kB</td>
        </tr>
        <tr>
          <th scope="row">0x7000</th>
          <td>0x7FFF</td>
          <td>Reserved for future memory-mapped IO. Writes are discarded and reads have undefined results.</td>
          <td>4 kB</td>
        </tr>
        <tr>
          <th scope="row">0x8000</th>
          <td>0xFFFF</td>
          <td>A general purpose ROM bank. Any assembled code is placed here.</td>
          <td>32 kB</td>
        </tr>
      </tbody>
    </table></div>
    
    <h4>Reset Vectors</h4>
    <p>Upon powerup, the first thing the CPU does is read the address 0xFFFE-0xFFFF for the reset vector. The CPU will immediately branch to this reset vector.</p>
  </div>
  
  <div class="container" id="assembly-directives">
    <h3>Assembly & Directives</h3>
    
    <h4>Opcode Interpretation</h4>
    <p>Instructions must be in a certain format for the assembler to understand what the user is attempting to write. Generally, the format is as follows:</p>
    <LearnInlineCode>
<span class="text-info">opcode</span> + <span class="text-warning">Mode Suffix</span> + <span class="text-danger">Update Suffix</span> + <span class="text-success">Condition Codes</span>  <span class="text-primary">destination</span>, <span class="text-primary">source</span>, <span class="text-primary">source</span>
    </LearnInlineCode><br/>
    
    <p>For example, if I wanted to write an "add lower bits on equal with update" instruction, I could write the following:</p>
    <LearnInlineCode>
<span class="text-info">add</span><span class="text-warning">b</span><span class="text-danger">u</span><span class="text-success">eq</span>  <span class="text-primary">r0</span>, <span class="text-primary">r1</span>, <span class="text-primary">#5</span>
    </LearnInlineCode><br/>
    
    <h4>Labels</h4>
    <p>Labels are currently only used as targets in branching. A label is created by placing a colon after text containing no white space like so:</p>
    <LearnInlineCode>
<span class="text-success">my_label:</span>
    </LearnInlineCode>
    <p>Labels always take the address of the next instruction or byte assembled, so a label at the very end of a program does nothing.</p>
    
    <h4>Immediates</h4>
    <p>Take my previous example:</p>
    <LearnInlineCode>
<span class="text-info">add</span><span class="text-warning">b</span><span class="text-danger">u</span><span class="text-success">eq</span>  <span class="text-primary">r0</span>, <span class="text-primary">r1</span>, <span class="text-primary">#5</span>
    </LearnInlineCode>
    <p>That <span class="text-primary">#5</span> was an immediate value. As mentioned before, immediates are only available for a src1 value, which is always at the end of an opcode and is used by every instruction except STR. An immediate value is indicated by placing a # symbol in front of a number. In addition, hexadecimal values can be used and are indicated by placing a 0x in front of a hexadecimal value. In addition, immediates are now 16 bits, which allows a whole register to be modified in on cycle. When using half-register modes, immediates are 8 bits. However, when using the no-update mode, immediates are still 8 bits, so it is difficult to compare whole registers with immediates.</p>
    
    <p>Immediates can also be a label. They are indicated by placing &lt and &gt signs around the label name like so:</p>
    
    <LearnInlineCode>
<span class="text-info">b</span> <span class="text-primary">&ltmy_label&gt</span>
    </LearnInlineCode>
    
    <h4>Pseudocodes</h4>
    <p>With the current instruction set, there are a number of "standard" features that aren't supported by hardware, so they are implemented by pseudocodes that code for other instructions.</p>
    <div style="overflow: auto; width: 100%;"><table class="table table-hover">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Function</th>
          <th scope="col" style="width: 15%; min-width: 150px;">Codes For</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">halt</th>
          <td>Halts the simulator. The simulator detects such a condition and displays a message confirming that the program has halted.</td>
          <td>sub ni, ni, #4</td>
        </tr>
        <tr>
          <th scope="row">push src1</th>
          <td>Pushes a value onto the stack.</td>
          <td>str sp, val<br/>add sp, sp, #2/#1</td>
        </tr>
        <tr>
          <th scope="row">pop dest</th>
          <td>Pops a value from the stack.</td>
          <td>sub sp, sp, #2/#1<br/>ldr dest, sp</td>
        </tr>
        <tr>
          <th scope="row">b address</th>
          <td>Branches to a different location.</td>
          <td>mov ni, address</td>
        </tr>
        <tr>
          <th scope="row">bl address</th>
          <td>Branches to a different location and links.</td>
          <td>add lr, ni, #4<br/>mov ni, address</td>
        </tr>
        <tr>
          <th scope="row">cmp a, b</th>
          <td>Compares two values. All flags will be updated.</td>
          <td>subnu n/a, a, b</td>
        </tr>
        <tr>
          <th scope="row">cmn a, b</th>
          <td>Compares two values. All flags will be updated, but will be inverted from "cmp."</td>
          <td>addnu n/a, a, b</td>
        </tr>
        <tr>
          <th scope="row">tst a, b</th>
          <td>Compares two values. Z and N will be updated only. C and V will be cleared.</td>
          <td>xornu n/a, a, b</td>
        </tr>
        <tr>
          <th scope="row">teq a, b</th>
          <td>Compares two values. Z and N will be updated only, but will be inverted from "tst." C and V will be cleared.</td>
          <td>andnu n/a, a, b</td>
        </tr>
        <tr>
          <th scope="row">cfl</th>
          <td>Clears flags.</td>
          <td>movn n/a, n/a</td>
        </tr>
      </tbody>
    </table></div>
    
    <h4>Directives</h4>
    <p>Directives are indicated by placing a . before the directive name. A list of directives is as follows:</p>
    <div style="overflow: auto; width: 100%;"><table class="table table-hover">
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Arguments</th>
          <th scope="col">Function</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">.origin</th>
          <td>Origin Address</td>
          <td>The origin directive tells the assembler where the start of the image is located in memory. This defaults to 0x8000, which is the location of the 32kB ROM block of memory. The origin directive should only be used once in a program.</td>
        </tr>
        <tr>
          <th scope="row">.seek</th>
          <td>Seek Address</td>
          <td>The seek directive tells the assembler to move to a particular address and place the following instructions and data there. The address is relative to the origin, so if the origin is set correctly, it should be the real location in memory.</td>
        </tr>
        <tr>
          <th scope="row">.location</th>
          <td>Seek Address</td>
          <td>The location directive is an alias for the seek directive.</td>
        </tr>
        <tr>
          <th scope="row">.byte</th>
          <td>value</td>
          <td>Places a single byte in the output image.</td>
        </tr>
        <tr>
          <th scope="row">.word</th>
          <td>value</td>
          <td>Places a single 16-bit word in the output image.</td>
        </tr>
      </tbody>
    </table></div>
    
    <h4>Comments</h4>
    <p>Comments are indicated by placing a semicolon at the end of a line. Anything on the line after the comment will not be treated as code. A comment is written like so:</p>
    <LearnInlineCode>
<span class="text-info">mov</span>  <span class="text-primary">r0</span>, <span class="text-primary">r0</span> <span class="text-muted">; Wastes time</span>
    </LearnInlineCode>
    
    <h4>Implicit Reset Vectors</h4>
    <p>By default, the origin is set to 0x8000 (you should never need to change this) and the reset vector is set at the same address. This way, a user can just start typing and forget about reset vectors. You really shouldn't ever need them, but they're there in case you'd like to see how they would work in a real machine. The equivalent of the defaults is as follows:</p>
    <LearnInlineCode>
start:
    ; my code here

.seek 0xFFFE
.word &ltstart&gt
    </LearnInlineCode>
  </div>
  
  <div class="container" id="future-changes">
    <h3>Future Changes</h3>
    <p>None currently planned</p>
  </div>
</div>
</template>

<script>
import NavBar from '@/components/UI/NavBar.vue'

import LearnInlineCode from '@/components/UI/LearnInlineCode.vue'

import CPUBlockDiagramSVG from '@/components/CPUBlockDiagramSVG.vue'

// Ctrl + F for "IMAGE BUG" to see the explanation
//import CPUSVG from '@/assets/cpu.svg'

export default {
  name: 'TRM',
  
  props: {
    alert_manager: { required: true },
    version: { required: true },
    navbar_links: { required: true },
    home_url: { required: true }
  },
  
  components: {
    NavBar, LearnInlineCode, CPUBlockDiagramSVG
  },
  
  data () { return { /*CPUSVG*/ } }
}
</script>

<style scoped>
</style>
