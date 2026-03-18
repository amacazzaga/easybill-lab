import React from 'react';
import { SideNavigation, SideNavigationItem } from '@ui5/webcomponents-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ACCESS_MAP } from '../accessMap.js';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SideNav() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si el usuario tiene múltiples roles, adaptar aquí:
  const userRoles = Array.isArray(role) ? role : [role];

  // Filtrar ítems según roles
  const allowedItems = ACCESS_MAP.filter(item =>
    item.allowedRoles.some(r => userRoles.includes(r))
  );

  return (
    <SideNavigation style={{ minWidth: 220 }}>
      {allowedItems.map(item => (
        <SideNavigationItem
          key={item.path}
          text={item.label}
          selected={location.pathname === item.path}
          onClick={() => navigate(item.path)}
        />
      ))}
    </SideNavigation>
  );
}
