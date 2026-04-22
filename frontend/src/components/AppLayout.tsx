'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AdminSideBar, AdminUserBar, GovBar } from '@uigovpe/components';
import { useRouter, usePathname } from 'next/navigation';
import { Toast } from '@uigovpe/components';
import { useRef } from 'react';

const menuUsuario = [
    {
        id: 'produtos',
        label: 'Produtos',
        link: '/produtos',
    },
    {
        id: 'categorias',
        label: 'Categorias',
        link: '/categorias',
    },
    {
        id: 'favoritos',
        label: 'Favoritos',
        link: '/favoritos',
    },
];

const menuAdmin = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        link: '/dashboard',
    },
    {
        id: 'usuarios',
        label: 'Usuários',
        link: '/usuarios',
    },
    {
        id: 'produtos',
        label: 'Produtos',
        link: '/produtos',
    },
    {
        id: 'categorias',
        label: 'Categorias',
        link: '/categorias',
    },
    {
        id: 'relatorios',
        label: 'Relatórios',
        link: '/relatorios',
    },
];
const toast = useRef(null);

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const toast = useRef(null);

    const menuItems = isAdmin ? menuAdmin : menuUsuario;

    const sections = [
        {
            id: 'main',
            title: 'Menu',
            items: menuItems.map((item) => ({
                id: item.id,
                label: item.label,
                link: item.link,
                selected: pathname === item.link,
            })),
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <GovBar />

            <Toast ref={toast} />

            <AdminUserBar
                user={{
                    name: user?.name ?? '',
                    profile: isAdmin ? 'admin' : 'user',
                }}
            />

            <div style={{ display: 'flex', flex: 1 }}>
                <AdminSideBar sections={sections} />

                <main style={{
                    flex: 1,
                    padding: '1rem',
                    minWidth: 0,
                    overflowX: 'auto',
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
}