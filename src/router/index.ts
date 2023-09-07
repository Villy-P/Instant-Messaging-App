import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserName from '../views/UserName.vue';
import { APP_NAME } from '@/data/data';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: UserName,
        meta: {
            title: `Join ${APP_NAME}`
        }
    },
    {
        path: '/chat',
        name: 'chat',
        component: HomeView,
        meta: {
            title: `${APP_NAME}`
        }
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
