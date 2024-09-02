/**
 * @description 路由配置
 */
import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        path: '/',
        name: 'index',
        component: () => import('@/views/view-index.vue'),
        meta: {
            title: '首页',
            isAdmin: false,
            needAuth: false
        }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from) => {
    
    // 路由发送变化时，更改页面 title
    if (to.meta.title) {
        document.title = '3d | ' + to.meta.title
    }
});

export { router };