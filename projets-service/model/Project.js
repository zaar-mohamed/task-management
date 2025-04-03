const mongoose=require("mongoose");

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { type: String, enum: ['En attente', 'En cours', 'Terminé'], default: 'En attente' },
    category: { type: String }
  }, { timestamps: true });
  
  const Project = mongoose.model('Project', ProjectSchema);
  module.exports=Project;