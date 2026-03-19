import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Title, Form, FormItem, Input, Button } from '@ui5/webcomponents-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Si ya hay sesión, redirigir a la ruta original (o /dashboard)
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Construir header Basic Auth
    const basicAuth = 'Basic ' + btoa(`${username}:${password}`);
    try {
      // Hacer fetch a un endpoint protegido (por ejemplo, Orders)
      const res = await fetch('/odata/v4/order/Orders?$top=1', {
        headers: { 'Authorization': basicAuth }
      });
      if (res.status === 401) {
        setError('Usuario o contraseña incorrectos');
        return;
      }
      if (!res.ok) {
        setError('Error de conexión con el backend');
        return;
      }
      // Si autenticó, obtener roles desde .cdsrc.json (hardcode por ahora)
      // En un escenario real, el backend debería devolver los roles del usuario autenticado
      let roles = [];
      if (username === 'admin') roles = ['admin', 'contador', 'vendedor'];
      else if (username === 'contador') roles = ['contador'];
      else if (username === 'vendedor') roles = ['vendedor'];
      else roles = [];
      login(username, roles, basicAuth);
      // Redirigir a la ruta original o a /dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError('Error de red o backend no disponible');
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: '5rem auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <Title level="H2">Iniciar sesión</Title>
      <form onSubmit={handleSubmit}>
        <Form columnsL={1} columnsM={1} columnsS={1} style={{ marginTop: 16 }}>
          <FormItem label="Usuario">
            <Input value={username} onInput={e => setUsername(e.target.value)} />
          </FormItem>
          <FormItem label="Contraseña">
            <Input type="Password" value={password} onInput={e => setPassword(e.target.value)} />
          </FormItem>
        </Form>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <Button design="Emphasized" type="Submit" style={{ marginTop: 16, width: '100%' }}>Ingresar</Button>
      </form>
    </div>
  );
}
