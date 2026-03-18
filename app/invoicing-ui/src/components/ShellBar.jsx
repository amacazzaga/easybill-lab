import React from 'react';
import { ShellBar } from '@ui5/webcomponents-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function AppShellBar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <ShellBar
      primaryTitle="EasyBill Lab"
      showNotifications
      showProductSwitch
      profile={{ initials: 'EB' }}
      menuItems={[
        { text: 'Cerrar sesión', icon: 'log', onClick: handleLogout }
      ]}
    />
  );
}
