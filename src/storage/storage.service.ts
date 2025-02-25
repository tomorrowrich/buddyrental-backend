import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  constructor(private readonly supabase: SupabaseClient) {}

  private bucket = process.env.S3_BUCKET_NAME || 'storage';

  private validateCategory(category: string): void {
    const validCategories = ['chats', 'profiles', 'personal'];
    if (!validCategories.includes(category)) {
      throw new Error(
        `Invalid category. Must be one of: ${validCategories.join(', ')}`,
      );
    }
  }

  private getFilePath(category: string, filename: string): string {
    return `${category}/${filename}`;
  }

  async uploadObject(
    userId: string,
    category: string,
    buffer: Buffer,
    mimetype: string,
  ): Promise<string> {
    try {
      this.validateCategory(category);
      const filename = `${userId}`;
      const filePath = this.getFilePath(category, filename);

      const { error } = await this.supabase.storage
        .from(this.bucket)
        .upload(filePath, buffer, {
          contentType: mimetype,
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to upload object: ${error.message}`);
      }
      throw new Error('An unknown error occurred.');
    }
  }

  getObject(category: string, filename: string): string {
    try {
      this.validateCategory(category);
      const filePath = this.getFilePath(category, filename);

      const { data } = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(filePath);

      if (!data) throw new Error('Object not found');

      return data.publicUrl;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get object: ${error.message}`);
      }
      throw new Error('An unknown error occurred.');
    }
  }

  async deleteObject(category: string, filename: string): Promise<boolean> {
    try {
      this.validateCategory(category);
      const filePath = this.getFilePath(category, filename);

      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([filePath]);

      if (error) throw error;

      return !error;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete object: ${error.message}`);
      }
      throw new Error('An unknown error occurred.');
    }
  }

  async listObjects(category: string): Promise<string[]> {
    try {
      this.validateCategory(category);

      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .list(category);

      if (error) throw error;

      return data.map((file) => file.name);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to list object: ${error.message}`);
      }
      throw new Error('An unknown error occurred.');
    }
  }

  async setAcl(
    category: string,
    filename: string,
    isPublic: boolean,
  ): Promise<boolean> {
    try {
      this.validateCategory(category);
      const filePath = this.getFilePath(category, filename);

      if (isPublic) {
        await this.supabase.storage
          .from(this.bucket)
          .createSignedUrl(filePath, 100000);
      } else {
        // Remove public access by moving to a new path with restricted permissions
        const tempPath = `private/${category}/${filename}`;
        await this.supabase.storage.from(this.bucket).move(filePath, tempPath);
      }
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update access control: ${error.message}`);
      }
      throw new Error('An unknown error occurred.');
    }
  }
}
