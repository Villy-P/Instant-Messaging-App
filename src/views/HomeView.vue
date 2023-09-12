<template>
	<div v-if="focusedImage" class="w-screen h-screen bg-opacity-90 bg-slate-900 absolute z-50 overflow-hidden">
		<div class="w-full h-full flex items-center justify-center">
			<img :src="focusedImage" class="max-w-full max-h-full m-auto overflow-auto fixed object-contain">
		</div>
		<div class="absolute w-5 h-5 top-6 right-6 cursor-pointer" @click="focusedImage = null">
			<img src="../assets/x.svg">
		</div>
	</div>
	<input type="file" ref="fileInput" class="hidden" @change="uploadImage">
	<div class="w-screen h-screen flex overflow-hidden">
		<div class="grow h-screen flex flex-col">
			<div class="navbar w-full h-14 border-b-2 border-b-black z-10">
				<div class="float-left h-14 w-fit flex  text-2xl pl-2 flex-col text-left">
					<p>{{ APP_NAME }}</p>
					<p class="text-xs">by {{ CREATOR_NAME }}</p>
				</div>
				<div class="float-right h-14 w-14 flex items-center justify-center cursor-pointer tooltip-container">
					<img src="../assets/user.svg" class="w-10 h-10" @click="showUsersMenu = !showUsersMenu">
					<div class="tooltip-text tooltip-bottom">Users</div>
				</div>
			</div>
			<div class="border-b-2 border-b-black overflow-y-auto overflow-x-hidden grow" ref="messageBody">
				<div v-for="i in messages" class="flex flex-col m-2" :key="i.message">
					<div v-if="i.type == 0">
						<div class="flex items-center gap-2">
							<div class="font-semibold">{{ i.sender }}</div>
							<div class="text-xs text-gray-500">{{ getDate(i.timestamp) }}</div>
						</div>
						<img v-if="i.image" :src="i.image" class="w-1/4 cursor-pointer" @click="focusedImage = i.image">
						<div class="pb-1 border-b-2 border-b-black font-thin break-all">{{ i.message }}</div>
					</div>
					<div v-else class="flex items-center">
						<div class="grow bg-gray-500 h-0.5"></div>
						<div class="text-sm px-3">{{ i.message }} on {{ getDate(i.timestamp) }}</div>
						<div class=" grow bg-gray-500 h-0.5"></div>
					</div>
				</div>
			</div>
			<div class="h-fit flex flex-col w-full shrink-1">
				<img v-if="currentFileURL" :src="currentFileURL" class="w-1/3 pl-5 py-3 h-fit overflow-auto object-cover" :style="`height: ${getImageContainerHeight()}px;`">
				<div class="flex h-16 w-full border-t-2" :class="currentFileURL ? 'border-t-gray-400' : ''">
					<input type="text" class="px-2 grow" placeholder="Your Message" ref="input" @keydown.enter="sendMessage" @input="checkImage" @paste="paste">
					<div class="w-fit h-full flex items-center justify-center px-5 gap-3">
						<div class="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center cursor-pointer tooltip-container" @click="sendMessage">
							<img src="../assets/enter.svg" class="w-4 h-4">
							<div class="tooltip-text tooltip-top">Send Message</div>
						</div>
						<div class="w-8 h-8  rounded-lg flex items-center justify-center cursor-pointer tooltip-container" @click="$refs.fileInput.click()">
							<img src="../assets/upload.svg" class="w-4 h-4">
							<div class="tooltip-text tooltip-top">Upload Image</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="w-56 border-l-2 border-l-black shrink-0" v-if="showUsersMenu">
			<div class="w-full text-center text-lg font-medium py-2">Users</div>
			<div v-for="u in users" :key="u.id" class="py-1 text-center flex justify-center items-center gap-2">
				<div :class="u.status === 0 ? 'bg-green-500' : 'bg-red-500'" class="w-3 h-3 rounded-full tooltip-container">
					<div class="tooltip-text tooltip-left">{{ u.status === 0 ? "Online" : "Offline" }}</div>
				</div>
				<div>{{ u.username }}</div>
			</div>
		</div>
	</div>
</template>

<!-- eslint-disable @typescript-eslint/no-empty-function -->
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<!-- eslint-disable @typescript-eslint/no-non-null-assertion -->
<!-- eslint-disable no-empty -->
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
		image?: string;
	}

	interface User {
		id: string;
		username: string;
		status: number;
	}

	export default class HomeView extends Vue {
		declare $refs: {
			input: HTMLInputElement,
			messageBody: HTMLDivElement,
			fileInput: HTMLInputElement
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

		currentFileURL: string | null = null;

		focusedImage: string | null = null;

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
				this.users = JSON.parse(message).users;
			});
			this.socket.on('getmessagehistory', (message: string) => {
				this.messages = JSON.parse(message).msgs;
			})

			this.socket.emit('joined', username!);
			this.socket.emit('getmessagehistory');
		}

		sendMessage() {
			if (!this.$refs.input.value.trim() && !this.currentFileURL)
				return;
			this.socket.emit('sent', JSON.stringify({
				sender: this.store.state.username,
				message: this.$refs.input.value,
				timestamp: Date.now(),
				type: MESSAGE_TYPE.NORMAL,
				image: this.currentFileURL
			}));
			this.$refs.input.value = "";
			this.currentFileURL = null;
		}

		getDate(i: number) {
			const today = new Date(i);
			const dd = today.getDate().toString().padStart(2, '0');
			const mm = (today.getMonth() + 1).toString().padStart(2, '0');
			const yyyy = today.getFullYear().toString().padStart(2, '0');
			const hour = today.getHours().toString().padStart(2, '0');
			const minutes = today.getMinutes().toString().padStart(2, '0');

			return `${mm}/${dd}/${yyyy} at ${hour}:${minutes}`;
		}

		uploadImage(evt: Event) {
			//@ts-ignore
			const file: File = evt.target?.files[0];
			const reader = new FileReader();
			reader.onload = this.handleFileLoad;

			reader.readAsDataURL(file);
		}

		handleFileLoad(evt: ProgressEvent<FileReader>) {
			this.currentFileURL = evt.target!.result! as string;
		}

		async checkImage(evt: Event) {
			const input = (evt.target as HTMLInputElement).value;
			fetch(input).then(async (r) => {
				if (!r.ok || r.status !== 200)
					return;
				const blob = await r.blob();
				if (blob.type.startsWith('image/')) {
					this.currentFileURL = input;
					(evt.target as HTMLInputElement).value = '';
				}
			}).catch(() => {});
		}

		paste(evt: ClipboardEvent) {
			const files = evt.clipboardData?.files;
			if (!files)
				return;
			for (const file of files) {
				if (file.type.indexOf('image') === -1) 
					continue;
				const reader = new FileReader();
				reader.onload = this.handleFileLoad;

				reader.readAsDataURL(file);
			}
		}
		
		getImageContainerHeight() {
			return this.$refs.messageBody.clientHeight / 2;
		}
	}
</script>

<style lang="scss" src="../styles/tooltip.scss"></style>