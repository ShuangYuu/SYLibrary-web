import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import UsersView from '@/views/UsersView.vue'
import LayoutView from '@/views/LayoutView.vue'
import LoginView from '@/views/login/LoginView.vue'
import AdminView from '@/views/AdminView.vue'
import NotFound from '@/views/NotFound.vue'
import BookView from '@/views/BookView.vue'
import BookImportView from '@/views/BookImportView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'LoginView',
      component: LoginView
    },

    {
      path: '/',
      name: 'LayoutView',
      component: LayoutView,
      redirect: '/home',
      children: [
        {
          path: 'home',
          name: 'Home',
          component: HomeView,
        },
        {
          path: 'users',
          name: 'Users',
          component: UsersView,
        },
        {
          path: 'admin',
          name: 'Admin',
          component: AdminView,
        },
        {
          path: 'books',
          name: 'Books',
          component: BookView,
        },
        {
          path: 'book-import',
          name: 'BookImport',
          component: BookImportView,
        },
      ]
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFound,
    },

  ],
})

router.beforeEach((to, from, next) => {
  const accessToken = localStorage.getItem('accessToken')

  if(!accessToken && to.path !== '/login') {
    next({ path: '/login' });
  }
  else if (accessToken && to.path === '/login') {
    next({path: '/'});
  }
  else {
    next();
  }
})

export default router
