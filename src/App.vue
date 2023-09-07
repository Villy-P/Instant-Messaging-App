<template>
    <router-view/>
    <FlexContainers/>
    <title>{{ $router.currentRoute.value.meta.title }}</title>
</template>

<script lang="ts">
    import { Vue, Options } from 'vue-class-component';
    import FlexContainers from './component/FlexContainers.vue';

    @Options({
        components: {
            FlexContainers
        }
    })
    export default class App extends Vue {}
</script>

<style lang="scss">
    * {
        font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
    }
</style>
