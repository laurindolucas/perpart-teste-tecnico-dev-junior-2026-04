'use client';

import { useEffect, useState } from 'react';
import { Card, Typography } from '@uigovpe/components';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import api from '@/services/api';

interface Stats {
  users: number;
  products: number;
  categories: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ users: 0, products: 0, categories: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, products, categories] = await Promise.all([
          api.get('/users?limit=1'),
          api.get('/products?limit=1'),
          api.get('/categories?limit=1'),
        ]);
        setStats({
          users: users.data.total,
          products: products.data.total,
          categories: categories.data.total,
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Usuários', value: stats.users, icon: '👥', color: '#003580' },
    { label: 'Produtos', value: stats.products, icon: '📦', color: '#1e7e34' },
    { label: 'Categorias', value: stats.categories, icon: '🏷️', color: '#856404' },
  ];

  return (
    <ProtectedRoute adminOnly>
      <AppLayout>
        <Typography variant="h2">Visão Geral do Sistema</Typography>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginTop: '1.5rem',
        }}>
          {cards.map((card) => (
            <Card key={card.label}>
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '2.5rem' }}>{card.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: card.color }}>
                  {card.value}
                </div>
                <Typography variant="p">{card.label}</Typography>
              </div>
            </Card>
          ))}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}