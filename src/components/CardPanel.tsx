import React from 'react';
import { Card, CardBody } from '@heroui/react';

interface CardPanelProps {
  title: string;
  children: React.ReactNode;
  showProfile?: boolean;
  profileSrc?: string;
}

export default function CardPanel({
  title,
  children,
  showProfile = false,
  profileSrc = '',
}: CardPanelProps) {
  return (
    <div className="flex items-center justify-center">
      <Card
        style={{
          position: 'relative',
          width: '86vw',
          maxWidth: '1200px',
          minHeight: '72vh',
          marginTop: '4.8vh',
          marginBottom: '4.8vh',
          background:
            'linear-gradient(180deg, rgb(40, 70, 120) 0%, rgb(120, 196, 254) 100%)',
          boxShadow: '0 0 24px rgba(40, 70, 120, 0.7), 0 0 48px rgba(120, 196, 254, 0.7)'
        }}
      >

        {showProfile && profileSrc && (
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '10.5vh',
              height: '10.5vh',
              zIndex: 20,
            }}
          >
            <img
              src={profileSrc}
              alt="Profile"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            />
          </div>
        )}

        <CardBody
          className="z-10 flex flex-col gap-4"
          style={{ paddingTop: '1rem', paddingLeft: '1.5rem' }}
        >
          <div className="card-title" style={{ fontSize: '3rem', fontWeight: 700 }}>{title}</div>
          <div className="overflow-auto card-body-text py-3">{children}</div>
        </CardBody>
      </Card>
    </div>
  );
}
