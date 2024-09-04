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
        redirect: '/webgl/basis/triangle',
        children: [
            {
                path: 'triangle',
                name: 'webgl-basis-triangle',
                component: () => import('../views/webgl/webgl-basis/triangle.vue'),
            },
            {
                path: 'polygon',
                name: 'webgl-basis-polygon',
                component: () => import('../views/webgl/webgl-basis/polygon.vue'),
            }
        ],
        meta: {
            title: '基础',
        }
    },
    {
        path: '/webgl/transform',
        name: 'webgl-transform',
        component: () => import('../views/webgl/transform/view-index.vue'),
        redirect: '/webgl/transform/particle-animation',
        children: [
            {
                path: 'particle-animation',
                name: 'particle-animation',
                component: () => import('../views/webgl/transform/particle-animation.vue'),
            }
        ],
        meta: {
            title: '仿射变换',
        }
    },
    {
        path: '/webgl/grids',
        name: 'webgl-grids',
        component: () => import('../views/webgl/grids.vue'),
        meta: {
            title: '网格',
        }
    }
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

export default router;