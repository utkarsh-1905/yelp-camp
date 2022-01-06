const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email:{
        type: String,
        required:true,
        unique:true
    }
});

//adds additional methods to our schema and password (hash and salt ) and username fields
//automaticallu using the plugin option

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema);