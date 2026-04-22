'use client';

import { useEffect, useState } from 'react';
import {
    Table, Button, Typography, Search,
    Dialog, InputText, MultiSelect, Message, Paginator, InputNumber, Column,
    Dropdown
} from '@uigovpe/components';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import api from '@/services/api';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    owner: { name: string };
    categories: { id: string; name: string }[];
}

interface Category {
    id: string;
    name: string;
}

export default function ProdutosPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [error, setError] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [form, setForm] = useState({
        name: '', description: '', price: 0, categoryIds: [] as string[],
    });
    const [categoryFilter, setCategoryFilter] = useState('');

    const limit = 10;

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/products', {
                params: {
                    page,
                    limit,
                    search,
                    categoryId: categoryFilter || undefined
                }
            });
            setProducts(data.data);
            setTotal(data.total);
        } catch {
            setError('Erro ao carregar produtos');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch {
            setError('Erro ao carregar categorias');
        }
    };


    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [page, search]);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', description: '', price: 0, categoryIds: [] });
        setImageFile(null);
        setDialogOpen(true);
    };

    const openEdit = (product: Product) => {
        setEditing(product);
        setForm({
            name: product.name,
            description: product.description,
            price: product.price,
            categoryIds: product.categories.map((c) => c.id),
        });
        setImageFile(null);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            let savedProduct;
            if (editing) {
                const { data } = await api.put(`/products/${editing.id}`, form);
                savedProduct = data;
            } else {
                const { data } = await api.post('/products', form);
                savedProduct = data;
            }

            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                await api.post(`/products/${savedProduct.id}/image`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            setDialogOpen(false);
            fetchProducts();
        } catch {
            setError('Erro ao salvar produto');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja remover este produto?')) return;
        try {
            await api.delete(`/products/${id}`);
            fetchProducts();
        } catch {
            setError('Erro ao remover produto');
        }
    };

    const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id }));

    const columns = [
        {
            field: 'imageUrl', header: 'Imagem',
            body: (row: Product) => row.imageUrl
                ? <img src={`http://localhost:3001${row.imageUrl}`} alt={row.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                : <span>—</span>,
        },
        { field: 'name', header: 'Nome' },
        { field: 'price', header: 'Preço', body: (row: Product) => `R$ ${Number(row.price).toFixed(2)}` },
        {
            field: 'categories', header: 'Categorias',
            body: (row: Product) => row.categories?.map((c) => c.name).join(', ') || '—',
        },
        { field: 'owner.name', header: 'Criado por' },
        {
            field: 'actions', header: 'Ações',
            body: (row: Product) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button label="Editar" onClick={() => openEdit(row)} />
                    <Button label="Remover" severity="danger" onClick={() => handleDelete(row.id)} />
                </div>
            ),
        },
    ];

    return (
        <ProtectedRoute>
            <AppLayout>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <Typography variant="h2">Produtos</Typography>
                    <Button label="Novo Produto" onClick={openCreate} />
                </div>

                {error && <Message severity="error" text={error} style={{ marginBottom: '1rem' }} />}

                <Search
                    label='Buscar'
                    placeholder="Buscar produto..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    style={{ marginBottom: '1rem', width: '100%' }}
                />
                <Dropdown
                    label="Filtrar por Categoria"
                    value={categoryFilter}
                    options={[{ label: 'Todas', value: '' }, ...categoryOptions]}
                    onChange={(e) => { setCategoryFilter(e.value); setPage(1); }}
                    style={{ marginBottom: '1rem', minWidth: '200px' }}
                />
                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <Table value={products} loading={loading}>
                        {columns.map((col) => (
                            <Column
                                key={col.field}
                                field={col.field}
                                header={col.header}
                                body={col.body}
                            />
                        ))}
                    </Table>
                </div>


                <Paginator
                    first={(page - 1) * limit}
                    rows={limit}
                    totalRecords={total}
                    onPageChange={(e) => setPage(e.page + 1)}
                    style={{ marginTop: '1rem' }}
                />

                <Dialog
                    header={editing ? 'Editar Produto' : 'Novo Produto'}
                    visible={dialogOpen}
                    onHide={() => setDialogOpen(false)}
                    style={{ width: '480px' }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
                        <InputText
                            label="Nome"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        <InputText
                            label="Descrição"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                        <InputNumber
                            label="Preço"
                            value={form.price}
                            onValueChange={(e) => setForm({ ...form, price: e.value || 0 })}
                            mode="currency"
                            currency="BRL"
                            locale="pt-BR"
                        />
                        <MultiSelect
                            label="Categorias"
                            value={form.categoryIds}
                            options={categoryOptions}
                            onChange={(e) => setForm({ ...form, categoryIds: e.value })}
                            placeholder="Selecione as categorias"
                        />
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                Imagem do Produto
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            />
                        </div>
                        <Button label="Salvar" onClick={handleSave} style={{ width: '100%' }} />
                    </div>
                </Dialog>
            </AppLayout>
        </ProtectedRoute>
    );
}