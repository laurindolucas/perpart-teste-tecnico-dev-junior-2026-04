'use client';

import { useEffect, useState } from 'react';
import { Table, Button, Typography, Message, Paginator, Column } from '@uigovpe/components';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import api from '@/services/api';

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    createdAt: string;
    user: { name: string; email: string };
}

export default function RelatoriosPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const limit = 20;

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/audit', {
                params: { page, limit, startDate: startDate || undefined, endDate: endDate || undefined },
            });
            setLogs(data.data);
            setTotal(data.total);
        } catch {
            setError('Erro ao carregar relatórios');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, [page]);

    const columns = [
        { field: 'user.name', header: 'Usuário', body: (row: AuditLog) => row.user?.name || '—' },
        { field: 'action', header: 'Ação' },
        { field: 'entity', header: 'Entidade' },
        { field: 'entityId', header: 'ID da Entidade' },
        {
            field: 'createdAt', header: 'Data/Hora',
            body: (row: AuditLog) => new Date(row.createdAt).toLocaleString('pt-BR'),
        },
    ];

    return (
        <ProtectedRoute adminOnly>
            <AppLayout>
                <Typography variant="h2" style={{ marginBottom: '1.5rem' }}>Relatórios de Auditoria</Typography>

                {error && <Message severity="error" text={error} style={{ marginBottom: '1rem' }} />}

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Data Início</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Data Fim</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                    </div>
                    <Button label="Filtrar" onClick={() => { setPage(1); fetchLogs(); }} />
                    <Button
                        label="Limpar Filtros"
                        onClick={() => { setStartDate(''); setEndDate(''); setPage(1); fetchLogs(); }}
                    />
                </div>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <Table value={logs} loading={loading}>
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
            </AppLayout>
        </ProtectedRoute>
    );
}