// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');

admin.initializeApp();
// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    // Push the new message into the Realtime Database using the Firebase Admin SDK.
    return admin.database().ref('/messages').push({original: original}).then((snapshot) => {
      // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
      return res.redirect(303, snapshot.ref.toString());
    });
  });

const nodemailer = require('nodemailer');

exports.sendMailFromCraDb = 
  functions.database.ref('/cra/{pushId}/').onCreate((snapshot, context) => {
    const data = snapshot.val();
    return sendCloudMail(data);
  });

function sendCloudMail(data) {

  console.log('sendCloudMail sending email from xlm.services.cra@gmail.com to '+ data.email);
  const mailTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: 'xlm.services.cra@gmail.com',
      pass: '98BhaK2e'
    }
  });
  
  var mailOptions = {
    from: 'xlm.services.cra@gmail.com',
    to: data.email,
    subject: 'CRA ' + data.name + ' - ' + data.month,

    /*
    for plain text body
    ->	text: 'Just Testing!'
    */

    // html body
    // html: '<h1>Hello ! </h1><p>' + data.message + '</p><p>The mail has been sent from Node.js application!</p>',
    html: '<p>Bonjour,</p><p>Veuillez trouver ci-joint le CRA de ' + data.name + ' pour le mois de ' + data.month + '</p><p>Cordialement,</p><p>XLM-Services.CRA</p>',
    attachments: 
     {   // use URL as an attachment
       filename: 'craPdf.pdf',
       path: data.pdfFile
     }
  };

  // verify connection configuration
  mailTransport.verify(function(error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  console.log(data.email);

  mailTransport.sendMail(mailOptions, (error, info) => {
    if (error){
    return console.log(error);
    } else{
      console.log('Email sent: ' + info.response);
    }
  });
  
}