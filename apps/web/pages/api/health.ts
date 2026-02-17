import type { NextApiRequest, NextApiResponse } from 'next';
import { auth, db, storage } from '@repo/firebase/client';

type HealthCheck = {
  status: string;
  firebase: {
    auth: boolean;
    firestore: boolean;
    storage: boolean;
  };
  config: {
    projectId: string | undefined;
    authDomain: string | undefined;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheck>
) {
  try {
    const healthCheck: HealthCheck = {
      status: 'ok',
      firebase: {
        auth: !!auth,
        firestore: !!db,
        storage: !!storage,
      },
      config: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      },
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      firebase: {
        auth: false,
        firestore: false,
        storage: false,
      },
      config: {
        projectId: undefined,
        authDomain: undefined,
      },
    });
  }
}

