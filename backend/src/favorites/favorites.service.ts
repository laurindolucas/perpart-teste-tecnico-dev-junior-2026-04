import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { Product } from '../products/product.entity';
import { Notification } from '../notifications/notification.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private repo: Repository<Favorite>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) {}

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

    const product = await this.productRepo.findOne({
      where: { id: productId },
      relations: ['owner'],
    });

    if (product?.owner && product.owner.id !== userId) {
      await this.notificationRepo.save({
        recipient: { id: product.owner.id } as any,
        message: `Alguém favoritou seu produto: ${product.name}`,
      });
    }

    return { favorited: true, message: 'Adicionado aos favoritos' };
  }
}