import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from './storage.service';
import { SupabaseClient } from '@supabase/supabase-js';

const mockSupabaseClient = {
  storage: {
    from: jest.fn().mockReturnThis(),
    upload: jest.fn(),
    getPublicUrl: jest.fn(),
    remove: jest.fn(),
    list: jest.fn(),
    createSignedUrl: jest.fn(),
    move: jest.fn(),
  },
};

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: SupabaseClient, useValue: mockSupabaseClient },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadObject', () => {
    it('should upload a file and return the public URL', async () => {
      const mockBuffer = Buffer.from('file data');
      const category = 'profiles';
      const userId = 'user1';
      const mimetype = 'image/jpeg';

      mockSupabaseClient.storage.upload.mockResolvedValue({
        data: {},
        error: null,
      });
      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://mock-url' },
      });

      const result = await service.uploadObject(
        userId,
        category,
        mockBuffer,
        mimetype,
      );

      expect(mockSupabaseClient.storage.upload).toHaveBeenCalledWith(
        'profiles/user1',
        expect.any(Buffer),
        { contentType: 'image/jpeg', upsert: false },
      );

      expect(result).toBe('https://mock-url');
    });
  });

  describe('getObject', () => {
    it('should return the public URL of a file', async () => {
      mockSupabaseClient.storage.getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.com/file.jpg' },
      });

      const result = await service.getObject('profiles', 'file.jpg');

      expect(result).toBe('https://example.com/file.jpg');
    });
  });

  describe('deleteObject', () => {
    it('should delete a file and return true', async () => {
      mockSupabaseClient.storage.remove.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await service.deleteObject('profiles', 'file.jpg');

      expect(result).toBe(true);
    });
  });

  describe('listObjects', () => {
    it('should return a list of files', async () => {
      mockSupabaseClient.storage.list.mockResolvedValue({
        data: [{ name: 'file1.jpg' }, { name: 'file2.jpg' }],
        error: null,
      });

      const result = await service.listObjects('profiles');

      expect(result).toEqual(['file1.jpg', 'file2.jpg']);
    });
  });

  describe('setAcl', () => {
    it('should make a file public', async () => {
      mockSupabaseClient.storage.createSignedUrl.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await service.setAcl('profiles', 'file.jpg', true);

      expect(result).toBe(true);
    });

    it('should make a file private', async () => {
      mockSupabaseClient.storage.move.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await service.setAcl('profiles', 'file.jpg', false);

      expect(result).toBe(true);
    });
  });
});
