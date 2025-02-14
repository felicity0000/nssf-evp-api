import mongoose from "mongoose";

const moodSchema = new mongoose.Schema({
    username:String,
    mood:String,
    date: { type: Date, default: Date.now },
    timestamp: { type: Date, default: Date.now },
});

const mood = mongoose.model('mood', moodSchema);

export default mood;