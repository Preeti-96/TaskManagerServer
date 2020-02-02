const mongoose=require('mongoose');

const ListSchema=mongoose.Schema({
    title:{
        type:String,
        required:true,
        minlength:1,
        trim:true
    },
    _userId:{
        type:mongoose.Types.ObjectId,
        required:true
    }
},{strict:true, timestamp:true});

module.exports=mongoose.model('List',ListSchema);
