import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Player',
    component: () => import('../views/PlayerView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory('/RadioEveryDay/'),
  routes,
})

export default router
