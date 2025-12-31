  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDTxI5JKa0zR3nrCS9yaghhItxWQZOlq2s",
    authDomain: "sample-pjt-8b4b5.firebaseapp.com",
    projectId: "sample-pjt-8b4b5",
    storageBucket: "sample-pjt-8b4b5.firebasestorage.app",
    messagingSenderId: "1071516419858",
    appId: "1:1071516419858:web:f61ae8f55184577951d5cb"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  export { db };