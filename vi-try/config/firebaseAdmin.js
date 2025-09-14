// config/firebaseAdmin.js
import admin from 'firebase-admin';

let firebaseApp;

export function getFirebaseAdmin() {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      firebaseApp = admin.apps[0];
      return firebaseApp;
    }

    let credential;

    // Try different ways to get Firebase credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // If we have the full service account JSON in env vars
      console.log('Using FIREBASE_SERVICE_ACCOUNT_KEY');
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      credential = admin.credential.cert(serviceAccount);
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      // If we have individual env vars
      console.log('Using individual Firebase env vars');
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // If we have a path to a service account file
      console.log('Using GOOGLE_APPLICATION_CREDENTIALS');
      credential = admin.credential.applicationDefault();
    } else {
      // In production, this should not happen - throw an error
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Firebase credentials not found in environment variables');
      }
      
      // Fallback for development
      console.warn('⚠️  Using hardcoded Firebase credentials for development');
      credential = admin.credential.cert({
        "type": "service_account",
        "project_id": "vi-try",
        "private_key_id": "9979a9737b1b762d5bc6835969d2600c749ef1d8",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCkyNlAEGkaLMbu\nVm7VYjcpj0bpED4tjttZI8Jfbds5oHHXfF/6RHGdMLo9cj36rCEAhUrjn8j+YzJi\nDJmgGMY18gisETXukF2wk810eK4CIeitVvae+dNZwC6UJgDZCUZs5+rH55491B3L\nkF9Jh726rKfuPo1scgBlur99UteTBnd8nW9RWEM3chpgoK5yjenHrOHH97QOcWf0\nFMCKOflU2XMKOeJTZU90pyXQvhiSC0xKNudoivQPdqnQvH6TVqwdHx7RhbKaQ6H1\n9ncN0PJHPQwuldZUedwVka8Vu8vZoRiElPpMsjcTPlUO4DFWObJFYSzaTMl+RVJe\n1CEuMuC5AgMBAAECggEABKG9Ioz7iU/wJQeirKaKtqU3eOpbFxB8h6ZGysQlnPpu\nrMALGhelqmWR3JOLHLJNKKy2eMy3W3gqFMG2KT79Bkvn9L80mQCvk3yqEh+ow3hU\nyBeJTdlnmI6beJBTZoZZV4sSyTzwUJxXXI8RsJlLStWa0Eprkvxm2LUtt/31v4UL\n1oJ7rSbzhNoC1r/7UdUymWsDDLTSgo9MC+CeMiqbQaxQGCm5WitN3DHUvzK+dL0w\nOMcsccnkWglbS0+0HL4zC9oZ0pZsT1FD1u3xvdzPrXC8DLvj0sx/h92gURw62OBS\nUqHXH2l4jFplxPMd1JQjp1hKYvSzDdsjAkvnQBgHcQKBgQDTGqy+YoI99kX4CMjF\n38Bk1YYlZiEZ/tqLnf4uzxvTP04C61YjSqqcILLa/OkxVExYUfzc7wHsaTkXrb+6\nCZOjoPGNfV+lZPk2mqftBMRqtIHziXvDLxmcqg0DANuUbWEj7SS0+y3pNckc81XF\n3txfCHekHXYsQkN5VFCaZ+sY8QKBgQDH1FrNtzaC6Spe3O6aYGOZUtvjPv3zzLyg\n3h3sqiOG9Z/CiH9NuA2KNdurAgpZvMdz9zLwnT0QNLmo54ai8xetgTZrjge8VDfu\nkcLMa5skVL6+3+3kSXIy08+NNvgXKsWDO7aN3EPqG+6yVeOiYmbUZTQyxJLvOA4G\nxX4eFBUESQKBgBGT6ghcSX4BUKgrixQ24l1DDk106JKyjt4LRMv/ANEhN0y07dI4\neGZRrrLfVkd+PnEoOobm++EEjfVzyUAjZgC8+QAQDXPHKZ0rWYo52GUOLLfrnbuN\n43MREc5LNv1v8iO8rk7Hj3YYvWtEs8KrIOxk1xl6PonG5rlmlOOWfZPxAoGADnfQ\njz5povbQy4eBewnpjCtUolJoPqOfMKKEViNHaTkVdRc+6FigGlal7e664x5o7nuC\nY6tuxWKb4p/IvrmNCFHnp8fjxX3vgsVo7jYISIweN2GtLq8mpolxaI8HTV4aaNME\n96ZwAF4/XQgc8B/hxBUDv30+CjXrxg+8ft8DWokCgYEAltQSoB3I6J1SGjRsxvdU\nuG278Vn4Lgcv84MQiyjyxCStD1aqJH9XjBNjTT92eLl0AGRa2MtuxC4m3gzS33ce\nvUWstXFbjU6p85NPsmXfCVoI9o+sMzrl20vmNb+sBZpCgoKaAGT6E9tpJuDflLUz\nNqdoVLo/Oy2oq/+hLMpgoK0=\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-z630y@vi-try.iam.gserviceaccount.com",
        "client_id": "101330092887679197657",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-z630y%40vi-try.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
      });
    }

    // Initialize Firebase Admin
    firebaseApp = admin.initializeApp({
      credential: credential,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "vi-try.appspot.com"
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseApp;

  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
    throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
  }
}

export function getFirebaseStorage() {
  const app = getFirebaseAdmin();
  return admin.storage(app).bucket();
}

export default getFirebaseAdmin;