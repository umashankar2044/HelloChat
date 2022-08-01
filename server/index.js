const express = require("express");
const mysql = require("mysql");
const socket = require("socket.io");
const cors = require("cors");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const { encrypt, decrypt } = require("./EncryptionHandler");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userid",
    secret: "ThereIsNoSecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 1000 * 60 * 30,
    },
  })
);

//database credentials
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456Seven8",
  database: "hellochat",
});

const connectionProblemMessage = "There was some problem in fetching data";

//login requests
app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send([
      { loggedIn: true },
      { id: req.session.user[0] },
      { user: req.session.user[1] },
    ]);
  } else {
    res.send([{ loggedIn: false }]);
  }
});

//logout request
app.get("/logout", (req, res) => {
  if (req.session.destroy()) {
    res.send([{ loggedout: true }]);
  } else {
    res.send([{ loggedout: false }]);
  }
});

app.post("/login", (req, res) => {
  const loginCredencials = [req.body.username, req.body.password];
  //Verifying if same Username with different password exist or not.

  const sqlVarify = "SELECT * FROM users WHERE username=?";

  db.query(sqlVarify, [loginCredencials[0]], (err0, result0) => {
    if (err0) {
      res.send([{ id: -1 }, { message: err0 }]);
    }
    if (result0) {
      if (result0.length > 0) {
        if (
          loginCredencials[1] !==
          decrypt({ data: result0[0].password, iv: result0[0].iv })
        ) {
          res.send([
            { id: -1 },
            { message: "Username Already Exist or Wrong Password" },
          ]);
        } else {
          req.session.user = [result0[0].id, loginCredencials[0]];
          res.send([
            { id: result0[0].id },
            { message: "Loading ..." },
            { user: loginCredencials[0] },
          ]);
        }
      } else {
        //Encrypting the password
        const encryptedPassword = encrypt(req.body.password);

        //Username and Password Already not exist so inserting into database.
        const sqlInsert =
          "INSERT INTO users (username,password,iv) VALUES (?,?,?)";
        db.query(
          sqlInsert,
          [loginCredencials[0], encryptedPassword.data, encryptedPassword.iv],
          (err2, result2) => {
            if (err2) {
              res.send([{ id: -1 }, { message: err2 }]);
            }
            if (result2) {
              //Getting user id of that inserted credentials.
              req.session.user = [result2.insertId, loginCredencials[0]];
              res.send([
                { id: result2.insertId },
                { message: "Loading ..." },
                { user: loginCredencials[0] },
              ]);
            } else {
              res.send([{ id: -1 }, { message: connectionProblemMessage }]);
            }
          }
        );
      }
    } else {
      res.send([{ id: -1 }, { message: connectionProblemMessage }]);
    }
  });
});

//list requests
app.post("/list", (req, res) => {
  const userid = req.body.userid;
  const sqlGetUsers =
    "SELECT id,rearuser,rearusername FROM userlist WHERE (frontuser=?) ORDER BY lastdate DESC";
  db.query(sqlGetUsers, [userid], (err, result) => {
    if (err) {
      res.send([{ statusList: false }, { message: err }]);
    }
    if (result) {
      res.send([{ statusList: true }, result]);
    } else {
      res.send([{ statusList: false }, { message: connectionProblemMessage }]);
    }
  });
});

//list/addUser requests
app.post("/list/addUser", (req, res) => {
  const newUser = req.body.newUser;
  const userid = req.body.userid;
  const datetime = req.body.datetime;
  const sqlVerify = "SELECT id FROM users WHERE username=?";
  db.query(sqlVerify, [newUser], (err, result) => {
    //Verifying that the user to add in the list exist or not
    if (err) {
      res.send([{ id: -1 }, { message: err }]);
    }
    if (result) {
      if (result.length === 0) {
        res.send([{ id: -1 }, { message: "No such User exists!" }]);
      } else {
        const newUserid = result[0].id;
        const sqlInsert =
          "INSERT INTO userlist (frontuser,rearuser,rearusername,lastdate) VALUES (?,?,?,?)";
        db.query(
          sqlInsert,
          [userid, newUserid, newUser, datetime],
          (err1, result1) => {
            //Inserting all values in the userlist table and sending the id of the inserted column
            if (err1) {
              res.send([{ id: -1 }, { message: err1 }]);
            }
            if (result1) {
              res.send([{ id: result1.insertId }, { userid: newUserid }]);
            } else {
              res.send([{ id: -1 }, { message: connectionProblemMessage }]);
            }
          }
        );
      }
    } else {
      res.send([{ id: -1 }, { message: connectionProblemMessage }]);
    }
  });
});

//list delete request
app.post("/list/deleteList", (req, res) => {
  const listid = req.body.listid;
  const sqlDelete = "DELETE FROM userlist WHERE id=?";
  db.query(sqlDelete, [listid], (err, result) => {
    if (err) {
      res.send([{ deleteStatus: false }, { message: err }]);
    }
    if (result) {
      res.send([{ deleteStatus: true }]);
    } else {
      res.send([
        { deleteStatus: false },
        { message: connectionProblemMessage },
      ]);
    }
  });
});

app.post("/list/suggest", (req, res) => {
  const sqlFetch =
    "SELECT username FROM users WHERE username LIKE '" +
    req.body.username +
    "%' LIMIT 5";
  db.query(sqlFetch, (err, result) => {
    if (err) {
      res.send([]);
    }
    if (result) {
      res.send(result);
    } else {
      res.send([]);
    }
  });
});

//chatArea requests

//chatArea requests for fetching messages from database.
app.post("/chatArea", (req, res) => {
  const userfrom = req.body.userfrom;
  const userto = req.body.userto;
  const sqlFetch =
    "SELECT * FROM messages WHERE (userfrom=? AND userto=?) OR (userfrom=? AND userto=?) ORDER BY datetime DESC";
  db.query(sqlFetch, [userfrom, userto, userto, userfrom], (err, result) => {
    if (err) {
      res.send([{ fetchStatus: false }, { message: err }]);
    }

    if (result) {
      for (var i = 0; i < result.length; i++) {
        result[i].message = decrypt({
          data: result[i].message,
          iv: result[i].iv,
        });
      }

      res.send([{ fetchStatus: true }, result]);
    } else {
      res.send([{ fetchStatus: false }, { message: connectionProblemMessage }]);
    }
  });
});

//chatArea request for set all the ids of the requested messages to read status.
app.post("/chatArea/setReadStatus", (req, res) => {
  const ids = req.body.messageIds;
  var idsString = "";
  for (var i = 0; i < ids.length; i++) {
    if (i === 0) {
      idsString += ids[i].toString();
    } else {
      idsString += "," + ids[i].toString();
    }
  }
  const sqlUpdate =
    "UPDATE messages SET readstatus=true WHERE id IN(" + idsString + ")";
  db.query(sqlUpdate, (err, result) => {
    if (err) {
      res.send([{ message: err }]);
    }
    if (result) {
      res.send([result]);
    } else {
      res.send([{ message: connectionProblemMessage }]);
    }
  });
});
//chatArea requests for inserting messages into database.
app.post("/chatArea/message", (req, res) => {
  const encryptedMessages = encrypt(req.body.message);

  const details = {
    userfrom: req.body.userfrom,
    userto: req.body.userto,
    message: encryptedMessages.data,
    datetime: req.body.datetime,
    iv: encryptedMessages.iv,
  };
  const sqlInsert =
    "INSERT INTO messages (userfrom,userto,message,datetime,readstatus,iv) VALUES (?,?,?,?,?,?)";
  db.query(
    sqlInsert,
    [
      details.userfrom,
      details.userto,
      details.message,
      details.datetime,
      false,
      details.iv,
    ],
    (err, result) => {
      if (err) {
        res.send([{ inserted: false }, { message: err }]);
      }
      if (result) {
        res.send([{ inserted: true }, { id: result.insertId }]);
      } else {
        res.send([{ inserted: false }, { message: connectionProblemMessage }]);
      }
    }
  );
});

const server = app.listen(3001, () => {
  console.log("running on port 3001");
});
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});
io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on("join_chat", (data) => {
    socket.join(data);
    console.log("User joined: " + data);
  });

  socket.on("send_message", (data) => {
    socket.to(data.userto).emit("recieve_message", data);
  });

  socket.on("readStatusTrue", (data) => {
    socket.to(data.userfrom).emit("read", data);
  });

  socket.on("disconnected", () => {
    socket.disconnect(true);
    console.log("User Disconnected");
  });
});
