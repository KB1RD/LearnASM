import GetStarted from '@/components/Learn/GetStarted'

import CtrlFileMenu from '@/components/UI/CtrlFileMenu.vue'
import CtrlButtons from '@/components/UI/CtrlButtons.vue'
import CorePaneEditor from '@/components/UI/CorePaneEditor.vue'
import CorePaneMem from '@/components/UI/CorePaneMem.vue'
import CorePaneIO from '@/components/UI/CorePaneIO.vue'

import LearnPractice from '@/components/Practice/LearnPractice.vue'
import LearnInlineCode from '@/components/UI/LearnInlineCode.vue'

import {options} from '@/js/io.js'
import {system_init, speed_vars} from '@/js/core.js'

export default {
  alert_manager: undefined,
  
  createDefaultLearn (path, name, systems_names, qna) {
    var opt_speed_name = options.speed_name
    
    // The speed controller will fall back to the original value (1 Hz) if
    // setting the speed from options fails.
    speed_vars.speed.speed_hz = 1
    speed_vars.speed.speed_name = opt_speed_name
    
    var has_systems = false
    
    var systems = {}
    if(systems_names && Object.keys(systems_names).length) {
      has_systems = true
      var systems_keys = Object.keys(systems_names)
      for(var i = 0; i<systems_keys.length; i++) {
        var system = system_init(systems_keys[i], systems_names[systems_keys[i]], window.alert_manager);
        if(!system) {
          window.alert_manager.error("Load Error", "Language not found or is corrupt. This is a massive bug.");
        }
        
        system.asm_text = ""
        systems[systems_keys[i]] = system
      }
    }
    
    return {
      name,
      path,
      
      data () { return {
        systems,
        speed_vars,
        qna
      } },
      
      components: { CtrlButtons, CorePaneEditor, CorePaneMem, 
        CorePaneIO, LearnPractice, LearnInlineCode }
    }
  },
  
  // A list of all pages (not including "Getting Started")
  // See router/index.js for usage
  pages: [],
  applyPageProps (page) {
    if(!page.name && page.component) {
      page.name = page.component.name
    }
    if(!page.title) {
      page.title = page.name.replace('-', ' ')
    }
    if(page.component) {
      page.path = page.component.path.join('/')
    }
    
    if(page.children) {
      for(var i = 0; i<page.children.length; i++) {
        this.applyPageProps(page.children[i])
      }
    }
  },
  addPage (page) {
    this.applyPageProps(page)
    this.pages.push(page)
  },
  
  // Allows me to pass data along with routes. I could use "props," but this
  // passes data to the component, which is useless.
  routePathLookup: {},
  getRouteDataPtr (path) {
    if(!this.routePathLookup[path]) {
      this.routePathLookup[path] = {}
    }
    
    return this.routePathLookup[path]
  },
  
  // Internal usage only
  pushPagesToRoutes(routes, pages, titles) {
    if(!titles) {
      titles = []
    }
    
    for(var i = 0; i<pages.length; i++) {
      var newTitles = make_copy(titles)
      newTitles.push(pages[i].title)
      
      if(pages[i].component) {
        // Push the route to the route list
        routes.push({
          path: pages[i].path,
          name: pages[i].name,
          component: pages[i].component
        })
        
        var path = '/learn/' + pages[i].path
        
        // Add the path, path array (relative to Learn), and the title to our data
        this.getRouteDataPtr(path).path = path
        this.getRouteDataPtr(path).path_array = pages[i].component.path
        this.getRouteDataPtr(path).titles = newTitles
      } else if(pages[i].children) {
        // Recursively add children
        this.pushPagesToRoutes(routes, pages[i].children, newTitles)
      } else {
        throw 'A page must have either a component or children; The component "'+pages[i].title+'" has neither'
      }
    }
  },
  // Creates the routes for the router
  createLearnRoutes () {
    var routes = []
    routes.push({
      path: '',
      name: 'Get Started',
      component: GetStarted
    })
    
    this.pushPagesToRoutes(routes, this.pages)
    
    for(var i = 0; i<routes.length; i++) {
      var back = routes[i-1]
      if(back) {
        back = back.path
        back = '/learn/'+back
      }
      
      var next = routes[i+1]
      if(next) {
        next = next.path
        next = '/learn/'+next
      }
      
      var path = routes[i].path
      path = '/learn/'+path
      
      // Add the correct next/back links
      this.getRouteDataPtr(path).back = back
      this.getRouteDataPtr(path).next = next
    }
    
    return routes
  }
}
