import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/insurance-plan',
      name: 'insurance-plan-list',
      component: () => import('../views/InsurancePlanView.vue'),
    },
    {
      path: '/insurance-plan/create',
      name: 'insurance-plan-create',
      component: () => import('../views/InsurancePlan/CreateInsurancePlan.vue'),
    },
    {
      path: '/insurance-plan/edit/:id',
      name: 'insurance-plan-edit',
      component: () => import('../views/InsurancePlan/EditInsurancePlan.vue'),
    },
    {
      path: '/insurance-plan/:id',
      name: 'insurance-plan-detail',
      component: () => import('../views/InsurancePlan/DetailInsurancePlan.vue'),
    },
    {
      path: '/policy',
      name: 'policy-list',
      component: () => import('../views/PolicyView.vue'),
    },
    {
      path: '/policy/create',
      name: 'policy-create',
      component: () => import('../views/Policy/CreatePolicy.vue'),
    },
    {
      path: '/policy/:id',
      name: 'policy-detail',
      component: () => import('../views/Policy/DetailPolicy.vue'),
    },
    {
      path: '/claim',
      name: 'claim-list',
      component: () => import('../views/ClaimView.vue'),
    },
    {
      path: '/claim/create/:orderedPlanId',
      name: 'claim-create',
      component: () => import('../views/Claim/CreateClaim.vue'),
    },
    {
      path: '/claim/process/:id',
      name: 'claim-process',
      component: () => import('../views/Claim/ProcessClaim.vue'),
    },
    {
      path: '/ordered-plan/:id',
      name: 'ordered-plan-detail',
      component: () => import('../views/OrderedPlan/DetailOrderedPlan.vue'),
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/StatisticsView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
