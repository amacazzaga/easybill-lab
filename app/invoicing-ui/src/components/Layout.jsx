import React from 'react';
import ShellBar from './ShellBar';
import SideNav from './SideNav';
import { useLocation } from 'react-router-dom';

const layoutStyle = {
  display: 'flex',
  height: '100vh',
  flexDirection: 'column',
};
const contentStyle = {
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
};
const mainStyle = {
  flex: 1,
  overflow: 'auto',
  background: '#f7f7f7',
  padding: '2rem',
};

export default function Layout({ children }) {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  return (
    <div style={layoutStyle}>
      {!isLogin && <ShellBar />}
      <div style={contentStyle}>
        {!isLogin && <SideNav />}
        <main style={mainStyle}>{children}</main>
      </div>
    </div>
  );
}
