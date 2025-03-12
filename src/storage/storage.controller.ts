import {
  Controller,
  Get,
  Delete,
  Put,
  Param,
  Query,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { StorageDto } from './dto/storage.dto';
import { StorageCategory } from './dto/storage.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoggedIn } from '@app/auth/auth.decorator';
import { AuthenticatedRequest } from '@app/interfaces/authenticated_request.auth.interface';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @LoggedIn()
  @Post(':category')
  @UseInterceptors(FileInterceptor('file'))
  async uploadObject(
    @Req() req: AuthenticatedRequest,
    @Param('category') category: StorageCategory,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { buffer, mimetype } = file;
    return await this.storageService.uploadObject(
      req.user.userId,
      category,
      buffer,
      mimetype,
    );
  }

  @Get(':category/:filename')
  getFileUrl(
    @Param('category') category: StorageCategory,
    @Param('filename') filename: string,
  ): StorageDto {
    const url = this.storageService.getObject(category, filename);
    return { url };
  }

  @Get(':category')
  async listFiles(
    @Param('category') category: StorageCategory,
  ): Promise<StorageDto> {
    const files = await this.storageService.listObjects(category);
    return { files };
  }

  @Delete(':category/:filename')
  async deleteFile(
    @Param('category') category: StorageCategory,
    @Param('filename') filename: string,
  ): Promise<StorageDto> {
    const success = await this.storageService.deleteObject(category, filename);
    return { success };
  }

  @Put(':category/:filename/acl')
  async updateAcl(
    @Param('category') category: StorageCategory,
    @Param('filename') filename: string,
    @Query('isPublic') isPublic: boolean,
  ): Promise<StorageDto> {
    const success = await this.storageService.setAcl(
      category,
      filename,
      isPublic,
    );
    return { success };
  }
}
