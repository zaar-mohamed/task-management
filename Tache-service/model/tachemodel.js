const mongoose=require("mongoose");
const commentschema=mongoose.Schema({
    content:{type:String,required:true},
    author:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},


})
const tacheschema=mongoose.Schema({
    titre:{type:String,required:true},
    description:{type:String,required:true}
    ,status:{type:String,required:true,enum:["à faire", "en cours", "terminé"],default:"à faire"},
    priorite:{type:String,required:true,enum:["moyenne","elevée","urgente"],default:"moyenne"},
    deadline:{type:Date,required:true},
    commentaire:[commentschema],
    projet_id:{type:mongoose.Schema.Types.ObjectId,ref:"Project",required:true},
    assignedUser:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    createdby:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
})

module.exports=mongoose.model("taches",tacheschema)