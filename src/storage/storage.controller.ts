import {
  Controller,
  Get,
  Delete,
  Param,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
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
  @Post('profiles')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadProfile(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const category = StorageCategory.PROFILES;
    const { buffer, mimetype } = file;
    return await this.storageService.uploadObject(
      req.user.userId,
      category,
      buffer,
      mimetype,
    );
  }

  @LoggedIn()
  @Get('profiles')
  getProfile(@Req() req: AuthenticatedRequest) {
    const url = this.storageService.getObject('profiles', req.user.userId);
    return { url };
  }

  @Post(':category/:filename')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  async uploadObject(
    @Param('category') category: StorageCategory,
    @Param('filename') filename: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (category === StorageCategory.PROFILES) {
      throw new BadRequestException(
        'Uploading directly to the profile is not allowed.',
      );
    }
    const { buffer, mimetype } = file;
    return await this.storageService.uploadObject(
      filename,
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
}
