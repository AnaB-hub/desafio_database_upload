import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import { getCustomRepository, getRepository } from 'typeorm';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('withdrawal amount exceeds the total amount', 400);
    }

    const findCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    // Creates category
    if (!findCategory) {
      const newCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(newCategory);

      const transaction = transactionRepository.create({
        title,
        value,
        type,
        category_id: newCategory.id,
      });

      await transactionRepository.save(transaction);

      return transaction;
    }

    // Creates transaction
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: findCategory.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
