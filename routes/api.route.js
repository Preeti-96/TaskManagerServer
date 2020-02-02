const express = require('express');
const router = express.Router();

const listController = require('../controllers/list.controller');
const taskController = require('../controllers/task.controller');
const userController = require('../controllers/user.controller');
const {User} = require("../models/users.model");

const jwt = require('jsonwebtoken');

// Check whether the JWT has valid JWT access token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    // Verify the JWT
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // there was an error
            // Invalid JWT - Don't authenticate
            res.status(401).send(err);
        } else {
            // JWT is valid
            req.user_id = decoded._id;
            next();
        }
    });
};


//to fetch list
router.get('/lists', authenticate, listController.fetchLists);
router.get('/lists/:listId/tasks', authenticate, taskController.fetchTasks);
//to fetch specific task
router.get('/lists/:listId/task/:taskId', taskController.fetchTask);

//add list
router.post('/list', authenticate, listController.addList);
router.post('/lists/:listId/task', authenticate, taskController.addTask);
//update list

router.put('/list/:id', authenticate, listController.updateList);
router.put('/lists/:listId/task/:taskId', authenticate, taskController.updateTask);

//delete list
router.delete('/list/:id', authenticate, listController.deleteList);
router.delete('/lists/:listId/task/:taskId', authenticate, taskController.deleteTask);


//Verify the refresh Token middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
    //grab the refresh Token from the request header
    let refreshToken = req.header('x-refresh-token');
    //grab the id from the request header
    let _id = req.header('_id');
    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and id are correct'
            })
        }
        //if the code reaches here the user is found.
        // therefore the refresh token exist in the database - but we still have to check whether its expired or not
        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;
        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                //check if the session has expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    //refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is valid- call next() to proceed with web request
            next();
        } else {
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }
    }).catch(e => {
        //401 means not authorised
        console.log("inside 401");
        res.status(401).send(e);
    });
};


/* User Routes */
/*
* POST /users
* Purpose: Sign up
*/

//router.post('/users', userController.signUp);

router.post('/users', (req, res) => {
    //user sign up
    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        //Session created successfully. refresh Token returned
        // Now we generate an access auth token for the user.

        return newUser.generateAccessAuthToken().then((accessToken) => {
            //access authToken generated successfully, now we return an object containing the authToken.
            return {accessToken, refreshToken}
        });
    }).then((authTokens) => {
        //Now we construct and send the response to the user with their auth tokens in the header and
        //the user object in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    });
});


/*
* /users/login
* */
router.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            //Session created successfully. refresh Token returned
            // Now we generate an access auth token for the user.

            return user.generateAccessAuthToken().then((accessToken) => {
                //access authToken generated successfully, now we return an object containing the authToken.
                return {accessToken, refreshToken}
            });
        }).then((authTokens) => {
            //Now we construct and send the response to the user with their auth tokens in the header and
            //the user object in the body
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
});

/*
* GET  /users/me/access-token
* Purpose : generates and returns an access token
* */

router.get('/users/me/access-token', verifySession, (req, res) => {
    // we know that the user/caller is authenticated and we have the user_id and user object available to us.
    console.log("inside print4");

    req.userObject.generateAccessAuthToken().then((accessToken) => {
        console.log("inside print");
        res.header('x-access-token', accessToken).send({accessToken});
    }).catch(e => {
        res.status(400).send(e);
    });


});

module.exports = router;
