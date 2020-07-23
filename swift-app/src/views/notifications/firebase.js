import firebase from 'firebase'

var firebaseConfig = {
    apiKey: "AIzaSyAYPUzsHaE1xeUQGYQ7GWcLlpTP3dGIY1g",
    authDomain: "notifications-19.firebaseapp.com",
    databaseURL: "https://notifications-19.firebaseio.com",
    projectId: "notifications-19",
    storageBucket: "notifications-19.appspot.com",
    messagingSenderId: "1071384504222",
    appId: "1:1071384504222:web:6b5e4a6cc88f628891988f",
    measurementId: "G-58ZY6B74R3"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();
  messaging.requestPermission()
  .then(function(){
      console.log('Have permission');
      return messaging.getToken();
  })
  .then(function(token)
  { 
      console.log(token);

  })
  .catch(function(err) {
      console.log('Error occured',err);
  })
  messaging.onMessage((payload) => {
    console.log('Message received. ', payload);

    // ...
  });

  messaging.onTokenRefresh(function (){
      messaging.getToken()
      .then(function(newtoken){
          console.log('New Token :', newtoken);
      })
      .catch(function(reason){
          console.log(reason);

      })
  })
  