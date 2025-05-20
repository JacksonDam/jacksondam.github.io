import React from 'react';
import { Card, CardBody } from '@heroui/react';

export default function CardPanel({ title, children }) {
  return (
    <div className="flex items-center justify-center h-full">
      <Card style={{ width: '86vw', height: '72vh', marginTop: '50rem', padding: '1rem'}}>
        <CardBody className="flex flex-col gap-4">
          <div className="text-2xl" style={{ fontWeight: 700 }}>{title}</div>
          <div className="overflow-auto">{children}</div>
        </CardBody>
      </Card>
    </div>
  );
}