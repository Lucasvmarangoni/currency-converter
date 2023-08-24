import { Module } from '@nestjs/common';
import { AppClientModule } from '@src/client/client.module';
import { ConverterService } from './services/converter';
import { FindAllService } from './services/find-all';
import { AppDatabaseModule } from '@src/app/models/database.module';
import { ConverterController } from './controllers/converter.controller';

@Module({
  imports: [AppClientModule, AppDatabaseModule],
  providers: [FindAllService, ConverterService],
  controllers: [ConverterController],
  exports: [FindAllService, ConverterService],
})
export class AppConverterModule {}