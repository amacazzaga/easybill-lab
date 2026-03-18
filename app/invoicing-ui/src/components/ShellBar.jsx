import React from 'react';
import { ShellBar } from '@ui5/webcomponents-react';

export default function AppShellBar() {
  return (
    <ShellBar
      primaryTitle="EasyBill Lab"
      showNotifications
      showProductSwitch
      profile={{ initials: 'EB' }}
    />
  );
}
