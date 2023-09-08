<template>
	<div class="w-screen h-screen flex">
		<div class="grow h-screen flex flex-col">
			<div class="navbar w-full h-14 border-b-2 border-b-black z-10">
				<div class="float-left h-14 w-fit flex  text-2xl pl-2 flex-col text-left">
					<p>{{ APP_NAME }}</p>
					<p class="text-xs">by {{ CREATOR_NAME }}</p>
				</div>
				<div class="float-right h-14 w-14 flex items-center justify-center cursor-pointer" title="Users">
					<img src="../assets/user.svg" class="w-10 h-10" @click="showUsersMenu = !showUsersMenu">
				</div>
			</div>
			<div class="border-b-2 border-b-black overflow-y-auto overflow-x-hidden grow" ref="messageBody">
				<div v-for="i in messages" class="flex flex-col m-2" :key="i.message">
					<div v-if="i.type == 0">
						<div class="flex items-center gap-2">
							<div class="font-semibold">{{ i.sender }}</div>
							<div class="text-xs text-gray-500">{{ getDate(i.timestamp) }}</div>
						</div>
						<div class="pb-1 border-b-2 border-b-black font-thin">{{ i.message }}</div>
					</div>
					<div v-else class="flex items-center">
						<div class="grow bg-gray-500 h-0.5"></div>
						<div class="text-sm px-3">{{ i.message }} on {{ getDate(i.timestamp) }}</div>
						<div class=" grow bg-gray-500 h-0.5"></div>
					</div>
				</div>
			</div>
			<div class="h-16 flex w-full shrink-0">
				<input type="text" class="px-2 grow" placeholder="Your Message" ref="input" @keydown.enter="sendMessage">
				<div class="w-14 h-full flex items-center justify-center">
					<div class="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center cursor-pointer" @click="sendMessage">
						<img src="../assets/enter.svg" class="w-4 h-4">
					</div>
				</div>
			</div>
		</div>
		<div class="w-56 border-l-2 border-l-black shrink-0" v-if="showUsersMenu">
			<div class="w-full text-center text-lg font-medium py-2">Users</div>
			<div v-for="u in users" :key="u.id" class="py-1 text-center">
				<div>{{ u.username }}</div>
			</div>
		</div>
	</div>
</template>

<!-- eslint-disable @typescript-eslint/no-non-null-assertion -->
<script lang="ts">
	import { Vue } from 'vue-class-component';
	import { key } from '@/store/store';
    import { useStore } from 'vuex';
	import { CREATOR_NAME, IP_ADDRESS, SERVER_PORT, APP_NAME } from '../data/data';

	import io from 'socket.io-client'

	enum MESSAGE_TYPE {
		NORMAL,
		JOINED
	}

	interface Message {
		sender: string;
		message: string;
		timestamp: number;
		type: MESSAGE_TYPE;
	}

	interface User {
		id: string;
		username: string;
		status: number;
	}

	export default class HomeView extends Vue {
		declare $refs: {
			input: HTMLInputElement,
			messageBody: HTMLDivElement
		}

		showUsersMenu = true;

		CREATOR_NAME = CREATOR_NAME
		APP_NAME = APP_NAME

		socket = io(`https://${IP_ADDRESS}:${SERVER_PORT}/`, {
			withCredentials: true,
			extraHeaders: {
				"my-custom-header": "abcd"
			}
		});

		store = useStore(key);

		messages: Message[] = [];
		users: User[] = [];

		mounted(): void {
			const username = localStorage.getItem("username");
			if (username == null)
				this.$router.push("/");
			this.store.state.username = username!;

			this.socket.on('sent', (message: string) => {
				this.messages.push(JSON.parse(message));
				setTimeout(() => {
					this.$refs.messageBody.scrollTop = this.$refs.messageBody.scrollHeight;
				}, 100); 
			});
			this.socket.on('joined', (message: string) => {
				const msg = JSON.parse(message);
				this.users = msg.users;
				if (msg.isNew)
					this.messages.push({
						message: `${msg.user.username} joined`,
						sender: msg.user.username,
						timestamp: Date.now(),
						type: MESSAGE_TYPE.JOINED,
					});
			});
			this.socket.on('disconnected', (message: string) => {
				console.log(this.users)
				this.users = JSON.parse(message).users;
			});

			this.socket.emit('joined', username!);
		}

		sendMessage() {
			if (!this.$refs.input.value.trim())
				return;
			this.socket.emit('sent', JSON.stringify({
				sender: this.store.state.username,
				message: this.$refs.input.value,
				timestamp: Date.now(),
				type: MESSAGE_TYPE.NORMAL
			}));
			this.$refs.input.value = "";
		}

		getDate(i: number) {
			const today = new Date(i);
			const dd = today.getDay();
			const mm = today.getMonth() + 1;
			const yyyy = today.getFullYear();
			const hour = today.getHours();
			const minutes = today.getMinutes();

			return `${dd}/${mm}/${yyyy} at ${hour}:${minutes}`;
		}
	}
</script>
