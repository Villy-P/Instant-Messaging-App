import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store, key } from './store/store'

import './style.scss'

createApp(App).use(router).use(store, key).mount('#app')
