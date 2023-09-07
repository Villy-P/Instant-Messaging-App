<template>
    <div></div>
</template>

<!-- eslint-disable no-undef -->
<script lang="ts">
    import { Vue } from 'vue-class-component';

    export default class FlexContainers extends Vue {
        mounted() {
            window.addEventListener("resize", this.resizeContainers);
            this.resizeContainers();
        }

        resizeContainers() {
            const containers: NodeListOf<HTMLDivElement> = document.querySelectorAll(".flex-container-centered");
            const horContainers: NodeListOf<HTMLDivElement> = document.querySelectorAll(".flex-container-center-hor");
            containers.forEach((e: HTMLDivElement) => {
                e.style.justifyContent = e.scrollHeight > e.clientHeight ? "start" : "center";
            });

            horContainers.forEach((e: HTMLDivElement) => {
                e.style.alignItems = e.scrollWidth > e.clientWidth ? "start" : "center";
            });
        }
    }
</script>