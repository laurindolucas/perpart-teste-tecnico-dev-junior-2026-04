import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

  async findAll(page = 1, limit = 10, search = '') {
    const [data, total] = await this.repo.findAndCount({
      where: search ? { name: ILike(`%${search}%`) } : {},
      relations: ['owner'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, lastPage: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const cat = await this.repo.findOne({ where: { id }, relations: ['owner'] });
    if (!cat) throw new NotFoundException('Categoria não encontrada');
    return cat;
  }

  async create(data: Partial<Category>, ownerId: string) {
    const cat = this.repo.create({ ...data, owner: { id: ownerId } as any });
    return this.repo.save(cat);
  }

  async update(id: string, data: Partial<Category>) {
    const cat = await this.findOne(id);
    Object.assign(cat, data);
    return this.repo.save(cat);
  }

  async remove(id: string) {
    const cat = await this.findOne(id);
    await this.repo.remove(cat);
    return { message: 'Categoria removida com sucesso' };
  }
}