const mongoose=require('mongoose');

const TaskSchema=mongoose.Schema({
    title:{
        type:String,
        required:true,
        minlength:1,
        trim:true
    },
    listId:{
        type:mongoose.Types.ObjectId,
        required: true
    },
    completed:{
        type:Boolean,
        default:false
    }

},{strict:true, timestamp:true});

module.exports=mongoose.model('Task',TaskSchema);
