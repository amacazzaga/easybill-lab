import React from 'react';
import { Card, CardHeader, Text } from '@ui5/webcomponents-react';

export default function KPICard({ label, value, unit }) {
  return (
    <Card style={{ minWidth: 220, minHeight: 120 }} header={<CardHeader titleText={label} />} >
      <div style={{ display: 'flex', alignItems: 'center', height: 60, justifyContent: 'center' }}>
        <Text style={{ fontSize: 32, fontWeight: 700 }}>
          {unit ? `${unit} ` : ''}{value}
        </Text>
      </div>
    </Card>
  );
}
