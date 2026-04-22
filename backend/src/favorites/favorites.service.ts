import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(@InjectRepository(Favorite) private repo: Repository<Favorite>) {}

  async findAll(userId: string) {
    return this.repo.find({
      where: { user: { id: userId } },
      relations: ['product', 'product.categories'],
    });
  }

  async toggle(userId: string, productId: string) {
    const existing = await this.repo.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (existing) {
      await this.repo.remove(existing);
      return { favorited: false, message: 'Removido dos favoritos' };
    }

    const favorite = this.repo.create({
      user: { id: userId } as any,
      product: { id: productId } as any,
    });
    await this.repo.save(favorite);
    return { favorited: true, message: 'Adicionado aos favoritos' };
  }
}