function sendResponse(res, next, status, message, result = null) {
    let response = {
        status: status,
        message: message
    };
    if (result) {
        response.result = result;
    }
    res.json(response);
    if (status === 0) {
        res.end();
        next();
    }
}

class UserController {

    signUp(req, res, next) {
        let body = req.body;
        let newUser = new User(body);

        newUser.save().then((err,user) => {
            if(err){
                sendResponse(res,next,0,"Error in creating User");
            }else{
                sendResponse(res,next,1,"User Created Successfully",user);
            }
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
    }

}

module.exports = UserController;
