**NOTE:** Development on this project is *painfully* slow because I am so busy with high school. If you'd like to help out, (if anyone actually knows this exists) feel free to submit a pull request, but it may be a little while before I see it. The issues section is a good place to start.

# LearnASM

> An educational assembly code simulator in your web browser

## Getting Started
Play with the simulator: https://learnasm.kb1rd.net/

Read the TRM: https://learnasm.kb1rd.net/trm/

Learn how to code: https://learnasm.kb1rd.net/learn

Building: See below ([Build Setup](#build-setup))

## Goals
In the Spring of 2017 I undertook a project that I initially thought required assembly, so I learned ARM assembly. While I did not end up needing assembly code to complete this project, I discovered that learning assembly code had actually made me a better programmer. Now I can actually understand *why* pointer variables work, for example.

In the spring of the same year, my school required that I use the programming language Scratch for a school project. My initial idea was to create a tile-based game, however I found this to be nearly impossible. I found that Scratch was very effective at teaching people *how to use Scratch,* but did not necessarily make good programmers. I believe the reason for this is because Scratch *does* teach people how to use if and else statements, but it does not teach people how to break down their ideas into really tiny chunks. Yes, they have blocks to, say, "move a sprite," but those are still fairly large chunks.

Long story short, I came up with a crazy idea: Teach novice programmers assembly.

Ok, so I might be insane, but hear me out. With a user interface that allows people to actually *see* what is going on inside a computer, for the first time this might actually be practical. Users can understand how a computer is actually put together and understand that its not just magic.

Of course, if this all doesn't work, I have written a fairly cool assembly code simulator, so win-win either way.

## Credits
This project uses a massive number of libraries, without which this simply wouldn't work.
- [Vue.JS](https://vuejs.org/)
- [Bootstrap](https://getbootstrap.com/)
- [jQuery](https://jquery.com/)
- [CodeMirror](https://codemirror.net/)
- [Bootswatch Themes](https://bootswatch.com/)
- [Vue-Codemirror](https://surmon-china.github.io/vue-codemirror/)
- [Split.JS](http://nathancahill.github.io/Split.js/)
- [Popper.JS](https://popper.js.org/)
- Of course, all the people at New England Sci-Tech and the STARS amateur radio club for all the great conversations about assembly code!

### Modifications to Libraries
- I modified the Bootswatch Themes to remove Google fonts

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests (currently not implemented)
npm run unit

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
