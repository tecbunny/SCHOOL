import { chatRepository } from "@/repositories/chat.repository";

export const chatService = {
  async getMyRooms() {
    return chatRepository.getMyRooms();
  },

  async getMessages(roomId: string, limit = 50) {
    if (!roomId) {
      throw new Error("roomId is required");
    }
    return chatRepository.getMessagesByRoomId(roomId, limit);
  },

  async sendMessage(roomId: string, content: string) {
    if (!roomId || !content) {
      throw new Error("roomId and content are required");
    }
    return chatRepository.sendMessage(roomId, content);
  }
};
