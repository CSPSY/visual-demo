/**
 * @description 路由配置
 */
import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        path: '/',
        name: 'index',
        component: () => import('../views/view-index.vue'),
        meta: {
            title: '首页',
        }
    },
    {
        path: '/webgl/basis',
        name: 'webgl-basis',
        component: () => import('../views/webgl/webgl-basis/view-index.vue'),
        meta: {
            title: '基础',
        }
    },
    {
        path: '/webgl/transform',
        name: 'webgl-transform',
        component: () => import('../views/webgl/transform/view-index.vue'),
        meta: {
            title: '仿射变换',
        }
    },
    {
        path: '/webgl/pattern',
        name: 'webgl-pattern',
        component: () => import('../views/webgl/pattern/view-index.vue'),
        meta: {
            title: '图案生成',
        }
    },
    {
        path: '/webgl/beauty',
        name: 'webgl-beauty',
        component: () => import('../views/webgl/beauty/view-index.vue'),
        meta: {
            title: '图案美化',
        }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to) => {
    // 路由发送变化时，更改页面 title
    if (to.meta.title) {
        document.title = '3d | ' + to.meta.title
    }
});

export default router;