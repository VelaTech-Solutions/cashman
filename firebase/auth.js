import { firebase } from './firebase';

// Sign in function
const signIn = (email, password) => {
  return firebase.auth().signInWithEmailAndPassword(email, password);
};

// Sign out function
const signOut = () => {
  return firebase.auth().signOut();
};

export { signIn, signOut };
