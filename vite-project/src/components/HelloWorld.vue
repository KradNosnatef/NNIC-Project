<template>
  <div class="chat-app">
    <div class="chat-container">
      <div v-for="message in messages" :key="message.id" :class="{'received-message': !message.isMyMessage, 'sent-message': message.isMyMessage}" class="message-container">
        <div class="message">{{ message.content }}</div>
      </div>
    </div>
    <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

interface Message {
  id: number;
  content: string;
  isMyMessage: boolean;
}

export default defineComponent({
  name: 'ChatApp',
  setup() {
    const messages = ref<Message[]>([
      { id: 1, content: "Hello! How can I help you?", isMyMessage: false },
      { id: 2, content: "Hi there!", isMyMessage: true }
    ]);

    const newMessage = ref('');

    const sendMessage = () => {
      if (!newMessage.value.trim()) return;

      messages.value.push({ id: messages.value.length + 1, content: newMessage.value, isMyMessage: true });
      newMessage.value = ''; // Clear input after sending message
    };

    return {
      messages,
      newMessage,
      sendMessage
    };
  },
});
</script>

<style>
.chat-app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
}

.chat-container {
  display: flex;
  flex-direction: column;
}

.message {
  padding: 8px 15px;
  margin: 5px;
  border-radius: 10px;
  max-width: 70%;
  text-align: left;
}

.sent-message {
  align-self: flex-end;
  background-color: #66bb6a;
  color: white;
  margin: 10px;
}

.received-message {
  align-self: flex-start;
  background-color: #f0f0f0;
  color: black;
  margin: 10px;
}

input {
  padding: 8px;
  margin-top: 10px;
  width: 100%;
}
</style>