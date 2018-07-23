module.exports = function(grunt) {
    var core_js = ['./node_modules/vue/dist/vue.js', './node_modules/jquery/dist/jquery.js', './node_modules/popper/dist/popper.js', './node_modules/bootstrap/dist/js/bootstrap.js', './node_modules/codemirror/lib/codemirror.js', './node_modules/vue-codemirror/dist/vue-codemirror.js', './src/js/common.js', './src/js/components.js'];

    var sim_js = ['./node_modules/split.js/split.js', './src/js/learn-asm/codemirror-mode.js','./src/js/learn-asm/lang.js'];

    var learn_js = ['./src/js/learn-asm/codemirror-mode.js','./src/js/learn-asm/lang.js'];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: '\n\n'
            },
            dist: {
                files: {
                    'assets/<%= pkg.name %>-core.js': core_js,
                    'assets/<%= pkg.name %>-sim.js': sim_js,
                    'assets/<%= pkg.name %>-learn.js': learn_js,
                    'assets/<%= pkg.name %>.css': ['./node_modules/codemirror/lib/codemirror.css', './node_modules/codemirror/theme/mdn-like.css','./src/css/theme.min.css', './src/css/split.css', './src/css/overlay.css', './src/css/utils.css']
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'assets/<%= pkg.name %>-core.min.js': ['assets/<%= pkg.name %>-core.js'],
                    'assets/<%= pkg.name %>-sim.min.js': ['assets/<%= pkg.name %>-sim.js'],
                    'assets/<%= pkg.name %>-learn.min.js': ['assets/<%= pkg.name %>-learn.js'],
                    'assets/<%= pkg.name %>.min.css': ['assets/<%= pkg.name %>.css']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/js/*.js', 'src/js/*/*.js'],
            options: {
                // options here to override JSHint defaults
                trailing: true,
                globals: {
                    browser: true,
                    console: true
                }
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'concat']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};
