const Task = require('../models/task.model');
const List = require('../models/list.model');

const listController = require('./list.controller');

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

class TaskController {

    fetchTasks(req, res, next) {
        List.findOne({
            _id:req.params.listId,
            _userId:req.user_id
        },(list)=>{
            return !!list;
        }).then((canShowTasks)=>{
            if(canShowTasks){
                Task.find({listId: req.params.listId}, (err, tasks) => {
                    if (err) {
                        sendResponse(res, next, 0, err);
                    } else {
                        sendResponse(res, next, 1, 'Showing Tasks ', tasks);
                    }
                });
            }else{
                res.sendStatus(404);
            }
        })


    }

    fetchTask(req, res, next) {
        Task.findOne({
            _id: req.params.taskId,
            listId: req.params.listId
        }, (err, task) => {
            if (err) {
                sendResponse(res, next, 0, err);
            } else {
                sendResponse(res, next, 1, "Showing task", task);
            }
        })
    }

    addTask(req, res, next) {
        List.findOne({
            _id:req.params.listId,
            _userId:req.user_id
        },(list)=>{
            return !!list;

        }).then((canCreateTask)=>{
            if(canCreateTask){
                let newTask = new Task({
                    title: req.body.title,
                    listId: req.params.listId
                });
                newTask.save((err, task) => {
                    if (err) {
                        sendResponse(res, next, 0, err);
                    } else {
                        sendResponse(res, next, 1, 'Task added successfully', task);
                    }
                });
            }else{
                res.sendStatus(404);
            }
        })

        /*let listId = req.params.listId;
        let _userId = req.user_id;
        if (listController.canCreateTask(listId, _userId)) {
            let newTask = new Task({
                title: req.body.title,
                listId: req.params.listId
            });
            newTask.save((err, task) => {
                if (err) {
                    sendResponse(res, next, 0, err);
                } else {
                    sendResponse(res, next, 1, 'Task added successfully', task);
                }
            });
        } else {
            res.sendStatus(404);
        }
*/
    }

    updateTask(req, res, next) {
        List.findOne({
            _id:req.params.listId,
            _userId:req.user_id
        },(list)=>{
            return !!list;
        }).then((canUpdateTask)=>{
            if(canUpdateTask){
                Task.findOneAndUpdate({
                    _id: req.params.taskId,
                    listId: req.params.listId
                }, {
                    $set: req.body
                }, (err, task) => {
                    if (err) {
                        sendResponse(res, next, 0, err);
                    } else {
                        sendResponse(res, next, 1, "Task updated successfully", task);
                    }
                });
            }else{
                res.sendStatus(404);
            }
        });
    }


    deleteTask(req, res, next) {
        List.findOne({
            _id:req.params.listId,
            _userId:req.user_id
        },(list)=>{
            return !!list;
        }).then((canDeleteTask)=>{
           if(canDeleteTask){
               Task.findOneAndDelete({
                   _id: req.params.taskId,
                   listId: req.params.listId
               }, (err, task) => {
                   if (err) {
                       sendResponse(res, next, 0, err);
                   } else {
                       sendResponse(res, next, 1, "Task deleted successfully", task);
                   }
               });
           } else{
               res.sendStatus(404);
           }
        });


    }

    deleteTaskFromList(_listId) {
        Task.deleteMany({_listId}, (err, tasks) => {
            if (err) {
                //sendResponse(res, next, 0, err);
                console.log(err);
            } else {
                //sendResponse(res, next, 1, `Task from ${_listId} is deleted successfully`, tasks);
                console.log(`Task from ${_listId} is deleted successfully`);
            }
        });
    }
}

module.exports = new TaskController();
