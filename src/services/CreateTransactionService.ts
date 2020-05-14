// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CategoriesRepository from '../repositories/CategoriesRepository';
import Category from '../models/Category';

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
    let categoryEntity = new Category();

    const findCategoryInSameTitle = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });

    if (findCategoryInSameTitle) {
      categoryEntity.id = findCategoryInSameTitle.id;
    } else {
      categoryEntity = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryEntity);
    }

    const category_id = categoryEntity.id;
    const transaction = transactionsRepository.create({
      type,
      title,
      value,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
