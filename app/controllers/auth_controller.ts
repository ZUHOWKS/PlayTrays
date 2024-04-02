import User from "#models/user";
import {Database} from "@adonisjs/lucid/database";

export default class AuthController {
    public async index(){
        return User.all()
    }
    public async store(){
        User.create({
            email: 'test@test.fr', 
            username: 'Majurax', 
            password: '1234',
            points: 0})
        return User.all()
    }
}
