<template>
    <div v-if="username" class="w-screen h-screen bg-opacity-90 bg-slate-900 absolute z-50 overflow-hidden flex items-center justify-center flex-container-centered">
		<div class="w-96 h-fit p-2 m-2 bg-white rounded-xl text-center">
            <h2 class="text-2xl">You're already registered</h2>
            <p class="py-3">as {{ username }}</p>
            <div class="bg-slate-100 w-fit m-auto p-2 rounded-2xl mb-3 cursor-pointer" @click="deleteAccount">Delete this account</div>
            <div class="bg-cyan-300 w-fit m-auto p-2 rounded-2xl cursor-pointer" @click="$router.push('/chat')">Continue as {{ username }}</div>
        </div>
	</div>
	<div class="w-screen h-screen flex items-center justify-center flex-col gap-3 flex-container-centered py-10">
        <div class="text-5xl text-center">{{ APP_NAME }}</div>
        <div class="text-xl py-3">by {{ CREATOR_NAME }}</div>
        <div class="">How to Join:</div>
        <ul class="text-left list-item list-disc w-80">
            <li>Go to 
                <a :href="`https://${IP_ADDRESS}:${SERVER_PORT}`" target="_blank" class="text-blue-500 hover:text-blue-600">
                    https://{{ IP_ADDRESS }}:{{ SERVER_PORT }}
                </a>
            </li>
            <li>
                When prompted with "Your connection is not private", click "Advanced," and then "proceed to ..."
            </li>
            <li>Follow Instructions on that screen</li>
        </ul>
        <div class="text-lg">Pick a Username</div>
        <div class="border-2 border-black flex py-1">
            <input type="text" class="px-2" placeholder="Username" ref="input" @keydown.enter="moveTo">
            <div class="w-14 h-full flex items-center justify-center">
                <div class="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center cursor-pointer" @click="moveTo">
                    <img src="../assets/enter.svg" class="w-4 h-4">
                </div>
            </div>
        </div>
        <div v-if="badUsername" class="text-red-700 flex">
            <div class="bg-red-700 text-white rounded-full flex items-center justify-center w-6 h-6 mr-1">!</div>
            <p>Username already exists</p>
        </div>
    </div>
</template>

<script lang="ts">
    import { Vue } from 'vue-class-component';
	import { key } from '@/store/store';
    import { useStore } from 'vuex';
    import { IP_ADDRESS, SERVER_PORT, CREATOR_NAME, APP_NAME } from '@/data/data';

	export default class HomeView extends Vue {
		declare $refs: {
			input: HTMLInputElement
		}

        IP_ADDRESS = IP_ADDRESS
        SERVER_PORT = SERVER_PORT
        CREATOR_NAME = CREATOR_NAME
        APP_NAME = APP_NAME

        store = useStore(key);
        username: null | string = null;

        badUsername = false;

        mounted(): void {
            this.username = localStorage.getItem('username');
        }

        async deleteAccount() {
            localStorage.removeItem("username");
            const username = this.username;
            this.username = null;
            await fetch(`https://${IP_ADDRESS}:${SERVER_PORT}/delete/${username}`);
        }

        async moveTo() {
            const username = this.$refs.input.value.trim();
            const res = await fetch(`https://${IP_ADDRESS}:${SERVER_PORT}/usernameexists/${username}`);
            const data = await res.text();
            if (data == "true") {
                this.badUsername = true;
                return;
            }
            this.store.state.username = this.$refs.input.value.trim();
            localStorage.setItem("username", this.store.state.username);
            this.$router.push("/chat");
        }
	}
</script>
