'use client';

import { useEffect, useState } from 'react';
import {
    Table, Button, Typography, Search,
    Dialog, InputText, Message, Paginator, Column
} from '@uigovpe/components';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import api from '@/services/api';

interface Category {
    id: string;
    name: string;
    description: string;
    owner: { name: string };
}

export default function CategoriasPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', description: '' });

    const limit = 10;

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/categories', { params: { page, limit, search } });
            setCategories(data.data);
            setTotal(data.total);
        } catch {
            setError('Erro ao carregar categorias');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, [page, search]);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', description: '' });
        setDialogOpen(true);
    };

    const openEdit = (cat: Category) => {
        setEditing(cat);
        setForm({ name: cat.name, description: cat.description });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editing) {
                await api.put(`/categories/${editing.id}`, form);
            } else {
                await api.post('/categories', form);
            }
            setDialogOpen(false);
            fetchCategories();
        } catch {
            setError('Erro ao salvar categoria');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja remover esta categoria?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch {
            setError('Erro ao remover categoria');
        }
    };

    const columns = [
        { field: 'name', header: 'Nome' },
        { field: 'description', header: 'Descrição' },
        { field: 'owner.name', header: 'Criado por' },
        {
            field: 'actions', header: 'Ações',
            body: (row: Category) => (
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
                    <Typography variant="h2">Categorias</Typography>
                    <Button label="Nova Categoria" onClick={openCreate} />
                </div>

                {error && <Message severity="error" text={error} style={{ marginBottom: '1rem' }} />}

                <Search
                    label='Buscar'
                    placeholder="Buscar categoria..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    style={{ marginBottom: '1rem', width: '100%' }}
                />

                <Table value={categories} loading={loading}>
                    {columns.map((col) => (
                        <Column
                            key={col.field}
                            field={col.field}
                            header={col.header}
                            body={col.body}
                        />
                    ))}
                </Table>

                <Paginator
                    first={(page - 1) * limit}
                    rows={limit}
                    totalRecords={total}
                    onPageChange={(e) => setPage(e.page + 1)}
                    style={{ marginTop: '1rem' }}
                />

                <Dialog
                    header={editing ? 'Editar Categoria' : 'Nova Categoria'}
                    visible={dialogOpen}
                    onHide={() => setDialogOpen(false)}
                    style={{ width: '400px' }}
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
                        <Button label="Salvar" onClick={handleSave} style={{ width: '100%' }} />
                    </div>
                </Dialog>
            </AppLayout>
        </ProtectedRoute>
    );
}