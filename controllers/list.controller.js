const List = require('../models/list.model');
const taskController = require('./task.controller');


function sendResponse(res, next, status, message, result = null) {
    let response = {
        status: status,
        message: message,
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


class ListController {

    fetchLists(req, res, next) {
        // we want to return an array of all the list that belong to the authenticated user.
        List.find({
            _userId: req.user_id
        }, (err, lists) => {
            if (err) {
                sendResponse(res, next, 0, err);
            } else {
                sendResponse(res, next, 1, 'Showing lists', lists);
            }
        });
    }

    addList(req, res, next) {
        // let title = req.body.title;
        let newList = new List({
            title: req.body.title,
            _userId: req.user_id
        });

        newList.save((err, list) => {
            if (err) {
                sendResponse(res, next, 0, err);
            } else {
                sendResponse(res, next, 1, 'List added successfully', list);
            }
        })
    }

    updateList(req, res, next) {
        List.findOneAndUpdate({
            _id: req.params.id,
            _userId: req.user_id
        }, {
            $set: req.body
        }, (err, list) => {
            if (err) {
                sendResponse(res, next, 0, err);
            } else {
                sendResponse(res, next, 1, 'List updated successfully', list);
            }
        })

    }

    deleteList(req, res, next) {
        List.findOneAndRemove({
            _id: req.params.id,
            _userId: req.user_id
        }, (err, list) => {
            if (err) {
                sendResponse(res, next, 0, err);
            } else {
                sendResponse(res, next, 1, 'List deleted successfully', list);
                // delete all the task related to the list
                taskController.deleteTaskFromList(list._id);
            }
        })

    }

    // Type Error

   /* canCreateTask(listId, userId) {
        let flag = false;
        List.findOne({
            _id: listId,
            _userId: userId
        }, (err, user) => {
            console.log(user);
            flag = !!user;
        });
        return flag;
    }*/

}


module.exports = new ListController();
