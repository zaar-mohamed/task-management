const express=require("express");
const router=express.Router();
const tasks=require("../model/tachemodel")
const axios=require("axios")
// avoir tous les taches
router.get("/all",async(req,res)=>{
    try{
        const alltaches=await tasks.find({});
        res.json(alltaches);
    }
    catch(err){
        res.status(500).json({message:err.message})
    }

});

// ajouter une tache
router.post("/add",async(req,res)=>{
    try {
        const {titre,description,status,priorite,deadline,commentaire,projet_id,assignedUser,createdby}=req.body;
    const projetresponse = await axios.get(`http://localhost:3001/projets/projects/${projet_id}`, {
        headers: {
            Authorization: req.headers.Authorization
        }
    });
    console.log("Projet response:", projetresponse.data);
    if (!projetresponse.data) {
        return res.status(404).json({ message: "Projet non trouvé" });
    }

    const assignedUserresponse = await axios.get(`http://localhost:5000/api/auth/users/${assignedUser}`, {
        headers: {
            Authorization: req.headers.Authorization
        }
    });
    console.log("Assigned User response:", assignedUserresponse.data);
    if (!assignedUserresponse.data) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const createdbyresponse = await axios.get(`http://localhost:5000/api/auth/users/${createdby}`, {
        headers: {
            Authorization: req.headers.Authorization
        }
    });
    console.log("Created by response:", createdbyresponse.data);
    if (createdbyresponse.data.role !== "admin") {
        return res.status(403).json({ message: "Vous devez être admin pour ajouter une tâche" });
    }

    // Création de tâche
    const newtache = new tasks({
        titre, description, status, priorite, deadline, commentaire, projet_id, assignedUser, createdby
    });
    await newtache.save();
    res.status(201).json(newtache);
} catch (err) {
    console.error(err); // Ajout d'un log d'erreur
    res.status(500).json({ message: `Erreur lors de l'ajout de la tâche: ${err.message}` });
}
});

// les taches d'un projet
router.get("/projet/:id",async(req,res)=>{
    try{
        const projetresponse=await axios.get(`http://localhost:3001/projets/projects/${axios.req.params.id}`,{
            headers:{
                Authorization:req.headers.authorization
            }
        });
        if(!projetresponse.data){
            return res.status(404).json({message:"Projet not found"})
        }
        if(req.user.role !== "admin"){
            return res.status(403).json({message:"not authorized"})
        }
        const taches=await tasks.find({projet_id:req.params.id});
        res.status(200).json({tasks:taches});


    }
    catch(err){
        res.status(500).json({message:`erreur lors de la recuperation  des taches: ${err.message}`})
    }

});

// recuperer une tache par ID;
router.get("/:id",async(req,res)=>{
    try{
        const tacheID=req.params.id;
        const task=await tasks.findById(tacheID);
        if(!task){
            return res.status(404).json({message:"tache not found"})
        }
        if(req.user.role!=="admin"){
            return res.status(403).json({message:"not authorized"})
        }
        res.status(200).json(task);

        
    }
    catch(err){
        res.status(500).json({message:`erreur lors de la recuperation de tache ${err.message}`})
    }
});

// modifier une tache
router.put("/update/:id",async(req,res)=>{
    try{
        const tacheID=req.params.id;
        const updatedtask=await tasks.findOneAndUpdate({_id:tacheID},req.body);
        if(!updatedtask){
            return res.status(404).json({message:"tache not found"})
        }
        if(req.user.role!=="admin"){
            return res.status(403).json({message:"not authorized"})
        }
        res.status(200).json(updatedtask);

    }
    catch(err){
        res.status(500).json({message:`erreur lors de la modification de la tache: ${err.message}`})
    }
});

// supprimer une tache
router.delete("/delete/:id",async(req,res)=>{
    try{
        const tacheID=req.params.id;
        const deletedtask=await tasks.findByIdAndDelete(tacheID);
        if(!deletedtask){
            return res.status(404).json({message:"tache not found"})
        }
        if(req.user.role!=="admin"){
            return res.status(403).json({message:"not authorized"})
        }
        res.status(200).json({message:"task deleted successfully"})
    }
    catch(err){
        res.status(500).json({message:`erreur lors de la suppression de la tache: ${err.message}`})
    }
});

// ajouter un commentaire a une tache;
router.post("/addcomment/:id",async(req,res)=>{
    try{
        const {content,author}=req.body;
        const tacheID=req.params.id;
        const tachexists= await tasks.findById(tacheID);
        if(!tachexists){
            return res.status(404).json({message:"tache not found"})
        }
        // verification si utilisateur exists
        const userexists=await axios.get(`http://localhost:5000/api/auth/users/${author}`,{
            headers:{
                authorization:req.headers.authorization
            }
        })

        if(!userexists.data){
            return res.status(404).json({message:"user not found"})
        }
        if(req.user.role!=="admin"){
            return res.status(403).json({message:"not authorized"})
        }
        tachexists.commentaire.push({content:content,author:author});
        await tachexists.save();
        
    }
    catch(err){
        res.status(500).json({message:`erreur lors de l'ajout du commentaire: ${err.message}`})
    }
});

// supprimer un commentaire;
router.delete("/deletecomment/:id/:commentID",async(req,res)=>{
    try{
        const tacheID=req.params.id;
        const task=await tasks.findById(tacheID);
        if(!task){
            return res.status(404).json({message:"task not found"})
        }
        const comment=task.commentaire.findById(req.params.commentID);
        if(!comment){
            return res.status(404).json({message:"no comment found for this task"})
        }
        if(req.user.role!=="admin"){
            return res.status(403).json({message:"not authorized"})
        }
        task.commentaire.pull(comment._id);
        await task.save();
        res.status(200).json({message:"commentaire supprimée avec success"}); 
    }
    catch(err){
        return res.status(500).json({message:`erreur lors la suppresion de commentaire ${err}`})
    }
});

//suppression de tous taches d'un projet
router.delete("/deleteAllTasks/:projectID",async(req,res)=>{
    try{
       const projectID=req.params.projectID;
       const projectExists=await axios.get(`http://localhost:3001/projets/projects/${projectID}`,{
            headers:{
                authorization:req.headers.authorization
            }
        });
        if(!projectExists.data){
            return res.status(404).json({message:"projet non trouvé"})
        }
        if(req.user.role!=="admin"){
            return res.status(403).json({message:"not authorized"})
        }
        const tasks=await tasks.deleteMany({projet_id:projectID});
        res.status(200).json({message:"tous les taches de ce projet sond supprimée"})
        
    }
    catch(err){
        return res.status(500).json({message:`erreur lors de la suppression de toutes les taches: ${err}`})
    }
});

module.exports=router;

