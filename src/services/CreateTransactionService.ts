import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';
import AppError from '../errors/AppError';

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
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getCustomRepository(CategoriesRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enougth balance.');
    }

    let categoryEntity = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoryEntity) {
      categoryEntity = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryEntity);
    }

    // const category_id = categoryEntity.id;
    const transaction = transactionsRepository.create({
      type,
      title,
      value,
      category: categoryEntity,
      // category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
