## HelloChat

Realtime Chatting React Application

## Description

HelloChat is a Realtime Chatting system.
Its concept is inspired by WhatsApp.
UI features are similar to it.
Its a one page Application.
For the sake of simplicity, it allows to chat in only text messages.
We can send and recieve messages in realtime, add and delete the user from the list of users with whom we are chatting.
Messages are stored in database in encrypted form (Symmetric Encryption).
Suggestions are given when user search for other users to add to list to chat with.

## Technology Used

HTML, CSS, React js, MySQL, Express-Node.js, Socket.io, Axios, Crypto

React js : frontend

MySQL : DataBase

Express-Node.js : for implementing backend in JavaScript

Socket.io : for realtime data transfer

Axios : for making http requests

Crypto : Node js module for encryption and decryption

## Deployment

Points for deploying it on local machine :

All frontend code is written in client folder.

-React server runs on default port 3000.

All Backend code is written in server folder.

-Backend server runs on port 3001.

## Scripts

Scripts to run servers :

Express server - `yarn start / npm start`

Backend server - `npm run devStart`

![Screenshot (193)](https://user-images.githubusercontent.com/56961805/123983452-82303b00-d9e1-11eb-817f-883e594d9f30.png)
![Screenshot (194)](https://user-images.githubusercontent.com/56961805/123983495-8b210c80-d9e1-11eb-974c-4e4f3beca761.png)
![Screenshot (195)](https://user-images.githubusercontent.com/56961805/123983518-8eb49380-d9e1-11eb-84aa-558c63d4f02a.png)
![Screenshot (196)](https://user-images.githubusercontent.com/56961805/123983530-92e0b100-d9e1-11eb-95ef-5aacd181b0a5.png)

Socket.io console log when new user get online and starts a session.

![Screenshot (197)](https://user-images.githubusercontent.com/56961805/123983549-95dba180-d9e1-11eb-9980-36eba227b772.png)
