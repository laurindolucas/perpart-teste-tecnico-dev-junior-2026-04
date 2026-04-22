'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AdminSideBar, AdminUserBar, Badge, GovBar, Icon, Toast } from '@uigovpe/components';
import { useRouter, usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';
import api from '@/services/api';

const menuUsuario = [
    { id: 'produtos', label: 'Produtos', link: '/produtos' },
    { id: 'categorias', label: 'Categorias', link: '/categorias' },
    { id: 'favoritos', label: 'Favoritos', link: '/favoritos' },
];

const menuAdmin = [
    { id: 'dashboard', label: 'Dashboard', link: '/dashboard' },
    { id: 'usuarios', label: 'Usuários', link: '/usuarios' },
    { id: 'produtos', label: 'Produtos', link: '/produtos' },
    { id: 'categorias', label: 'Categorias', link: '/categorias' },
    { id: 'relatorios', label: 'Relatórios', link: '/relatorios' },
];

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, logout, isAdmin } = useAuth();
    const pathname = usePathname();
    const toastRef = useRef(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (user) {
            api.get('/notifications')
                .then(res => setNotifications(res.data))
                .catch(() => {});
        }
    }, [user]);

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
            
            <Toast ref={toastRef} />

            {/* Container para alinhar as notificações à barra de usuário */}
            <div style={{ position: 'relative' }}>
                <AdminUserBar
                    user={{
                        name: user?.name ?? '',
                        profile: isAdmin ? 'admin' : 'user',
                    }}
                />
                
                {/* Botão de Notificações posicionado de forma absoluta para evitar erro de children */}
                <div style={{ 
                    position: 'absolute', 
                    right: '250px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Badge>
                        {/* Removido "bell" e "count" para evitar erro de tipo. O número vai dentro do span */}
                        <span style={{ marginRight: '5px', fontWeight: 'bold' }}>
                            {notifications.length}
                        </span>
                        <Icon icon="check" /> 
                    </Badge>
                </div>
            </div>

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