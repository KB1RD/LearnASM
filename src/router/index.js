import Vue from 'vue'
import Router from 'vue-router'
import HomeEditor from '@/components/HomeEditor'
import TRM from '@/components/TRM'
import Learn from '@/components/Learn'

Vue.use(Router)

import LearnUtils from '@/js/LearnUtils.js'

import LearnL1P1P1 from '@/components/Learn/lesson1/part1/page1'
import LearnL1P1P2 from '@/components/Learn/lesson1/part1/page2'
import LearnL1P1P3 from '@/components/Learn/lesson1/part1/page3'
import LearnL1P1P4 from '@/components/Learn/lesson1/part1/page4'

import LearnComingSoon from '@/components/Learn/ComingSoon'

LearnUtils.addPage({title: "Step by Step", children: [
  {title: "Understanding Computers", children: [
    {title: "Computers in a Nutshell", component: LearnL1P1P1},
    {title: "Your First Program", component: LearnL1P1P2},
    {title: "MOVing Data", component: LearnL1P1P3},
    {title: "MOVing MOVs", component: LearnL1P1P4}
  ]}
]});

LearnUtils.addPage({title: "Coming Soon!", component: LearnComingSoon});

var learn_routes = LearnUtils.createLearnRoutes()

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HomeEditor',
      component: HomeEditor
    },
    {
      path: '/trm',
      name: 'TRM',
      component: TRM
    },
    {
      path: '/learn',
      /*name: 'Learn',*/
      component: Learn,
      children: learn_routes
    }
  ]
})
