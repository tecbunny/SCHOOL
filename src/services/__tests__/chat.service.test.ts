import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { UnauthorizedError } from '@/lib/errors';
import { chatRepository } from '@/repositories/chat.repository';
import { chatService } from '@/services/chat.service';

// Mock repository methods
jest.spyOn(chatRepository, 'getMyRooms').mockImplementation(jest.fn() as any);
jest.spyOn(chatRepository, 'getMessagesByRoomId').mockImplementation(jest.fn() as any);
jest.spyOn(chatRepository, 'sendMessage').mockImplementation(jest.fn() as any);

describe('chatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyRooms', () => {
    it('returns empty array if user is not authenticated', async () => {
      (chatRepository.getMyRooms as jest.Mock<any>).mockResolvedValue([]);

      const rooms = await chatService.getMyRooms();
      expect(rooms).toEqual([]);
      expect(chatRepository.getMyRooms).toHaveBeenCalled();
    });

    it('returns rooms if user is authenticated', async () => {
      const mockRooms = [{ id: 'room-1', room_name: 'General' }];
      (chatRepository.getMyRooms as jest.Mock<any>).mockResolvedValue(mockRooms);

      const rooms = await chatService.getMyRooms();
      expect(rooms).toEqual(mockRooms);
      expect(chatRepository.getMyRooms).toHaveBeenCalled();
    });
  });

  describe('getMessages', () => {
    it('throws error if roomId is missing', async () => {
      await expect(chatService.getMessages('')).rejects.toThrow('roomId is required');
    });

    it('calls repository to get messages', async () => {
      const mockMessages = [{ id: 'msg-1', message_text: 'Hello' }];
      (chatRepository.getMessagesByRoomId as jest.Mock<any>).mockResolvedValue(mockMessages);

      const messages = await chatService.getMessages('room-123', 20);
      expect(messages).toEqual(mockMessages);
      expect(chatRepository.getMessagesByRoomId).toHaveBeenCalledWith('room-123', 20);
    });
  });

  describe('sendMessage', () => {
    it('throws error if roomId or content is missing', async () => {
      await expect(chatService.sendMessage('', 'Hello')).rejects.toThrow('roomId and content are required');
      await expect(chatService.sendMessage('room-1', '')).rejects.toThrow('roomId and content are required');
    });

    it('calls repository to insert message', async () => {
      const mockMessage = { id: 'msg-1', message_text: 'Hello' };
      (chatRepository.sendMessage as jest.Mock<any>).mockResolvedValue(mockMessage);

      const result = await chatService.sendMessage('room-1', 'Hello');
      expect(result).toEqual(mockMessage);
      expect(chatRepository.sendMessage).toHaveBeenCalledWith('room-1', 'Hello');
    });

    it('propagates errors from repository', async () => {
      (chatRepository.sendMessage as jest.Mock<any>).mockRejectedValue(new UnauthorizedError('Not authenticated'));
      await expect(chatService.sendMessage('room-1', 'Hello')).rejects.toThrow(UnauthorizedError);
    });
  });
});
