'use client';

import { useEffect, useState } from 'react';
import {
    Table, Button, Typography, Search,
    Dialog, InputText, Dropdown, Message, Paginator, Column
} from '@uigovpe/components';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import api from '@/services/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function UsuariosPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const limit = 10;


    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/users', { params: { page, limit, search } });
            setUsers(data.data);
            setTotal(data.total);
        } catch {
            setError('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, [page, search]);

    const openCreate = () => {
        setEditing(null);
        setForm({ name: '', email: '', password: '', role: 'user' });
        setDialogOpen(true);
    };

    const openEdit = (user: User) => {
        setEditing(user);
        setForm({ name: user.name, email: user.email, password: '', role: user.role });
        setDialogOpen(true);
    };

const handleSave = async () => {
    try {
        setLoading(true); 
        let userId = editing?.id;

        if (editing) {
            await api.put(`/users/${editing.id}`, form);
        } else {
            const response = await api.post('/users', form);
            userId = response.data.id; 
        }

        if (avatarFile && userId) {
            const formData = new FormData();
            formData.append('file', avatarFile);
            
            await api.post(`/users/${userId}/avatar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }

        setDialogOpen(false);
        fetchUsers();
        setAvatarFile(null);
        
    } catch (err) {
        console.error(err);
        setError('Erro ao salvar usuário. Verifique os dados e tente novamente.');
    } finally {
        setLoading(false);
    }
};

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja remover este usuário?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
        } catch {
            setError('Erro ao remover usuário');
        }
    };

    const roleOptions = [
        { label: 'Usuário', value: 'user' },
        { label: 'Admin', value: 'admin' },
    ];

    const columns = [
        { field: 'name', header: 'Nome' },
        { field: 'email', header: 'E-mail' },
        { field: 'role', header: 'Perfil' },
        {
            field: 'actions', header: 'Ações',
            body: (row: User) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button label="Editar" onClick={() => openEdit(row)} />
                    <Button label="Remover" severity="danger" onClick={() => handleDelete(row.id)} />
                </div>
            ),
        },
    ];

    return (
        <ProtectedRoute adminOnly>
            <AppLayout>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <Typography variant="h2">Usuários</Typography>
                    <Button label="Novo Usuário" onClick={openCreate} />
                </div>

                {error && <Message severity="error" text={error} style={{ marginBottom: '1rem' }} />}

                <Search
                    label="Buscar"
                    placeholder="Buscar por nome ou e-mail..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                    style={{ marginBottom: '1rem', width: '100%' }}
                />
                <div style={{ overflowX: 'auto', width: '100%' }}>

                    <Table value={users} loading={loading}>
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
                    header={editing ? 'Editar Usuário' : 'Novo Usuário'}
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
                            label="E-mail"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                        <InputText
                            label={editing ? 'Nova Senha (opcional)' : 'Senha'}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            type="password"
                        />
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                Foto do Usuário
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                            />
                        </div>
                        <Dropdown
                            label="Perfil"
                            value={form.role}
                            options={roleOptions}
                            onChange={(e) => setForm({ ...form, role: e.value })}
                        />
                        <Button label="Salvar" onClick={handleSave} style={{ width: '100%' }} />
                    </div>
                </Dialog>
            </AppLayout>
        </ProtectedRoute>
    );
}