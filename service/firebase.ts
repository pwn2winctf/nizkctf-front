import firebase from 'firebase/app';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();


export const signUp = async ({ email, password, displayName }: { email: string, password: string, displayName: string }) => {
  const userCredentials = await auth.createUserWithEmailAndPassword(
    email,
    password
  )

  if (!userCredentials.user) {
    throw new Error('Empty user')
  }

  await userCredentials.user.updateProfile({ displayName })
  await userCredentials.user.sendEmailVerification()

  const token = await userCredentials.user.getIdToken()

  return { uuid: userCredentials.user.uid, email, displayName, token }
}