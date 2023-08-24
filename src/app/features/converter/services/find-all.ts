import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResponseData } from './converter';
import { Transaction } from '@src/app/models/transactions';

@Injectable()
export class FindAllService {
  constructor(
    @InjectModel('TransactionModel')
    private transactionsModel: Model<Transaction>,
  ) {}

  execute(): Promise<ResponseData[]> {
    return this.transactionsModel.find();
  }
}