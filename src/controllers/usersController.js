const { v4: uuidv4, validate } = require('uuid');
const bcrypt = require('bcrypt');
const { readJson, saveJson } = require('../utils/filesystem');


module.exports = {
  
  register: (req,res) =>{
      return res.render('users/register', {title:'Cargar Usuario'})
  },

  processRegister: function (req, res) {
    const users = readJson('../db/users.json')
    const {name, surname, username,email,avatar, password} = req.body

    const newUser = {
      id : uuidv4(),
      name : name.trim(),
      surname : surname.trim(),
      username : username.trim(),
      email : email.trim(),
      avatar: avatar,
      password : bcrypt.hashSync(password, 10),
      token : null,
      validate : true,
      lock : false,
      rol : 'user'
    }

    users.push(newUser)
    saveJson('../db/users.json', users);

    return res.redirect('/users/login');
  },

  login:function(req,res){
      return res.render('users/login',{title:'Login'})
  },
  
  processLogin: function(req,res){
   const users = readJson('../db/users.json')
   const { email, password } = req.body
     const user = users.find(user => user.email === email && bcrypt.compareSync(password, user.password))
      
   if(!user){
     return res.render('users/login',{
       error : "Credenciales inválidas"
      })
    }
    const userLogin = {
      id : user.id,
      name : user.name,
      rol : user.rol
    }

    req.session.userLogin = {
      id : user.id,
      name : user.name,
      rol : user.rol
    }
    console.log("RECORDAR: ", req.body.recordar)
    if(req.body.recordar){
    res.cookie("user",    req.session.userLogin , {maxAge: 60000*60*30})
    }

    return res.redirect('/')

  },

  profile: (req, res) => {
    
  const { id } = req.params
  const users = readJson('../db/users.json')
  const roles = readJson('../db/roles.json')

  const user = users.find(user => user.id === id)

  return res.render('users/profile', {
    ...user,
    roles
  })
  },

  update: (req, res) => {
    const users = readJson('../db/users.json')

    const {name, surname, username,email, password,token,validate,lock,rol} = req.body
  
    const usersModify = users.map(user => {
      if (user.id === +req.params.id) {
        user.name = name.trim();
        user.surname = surname.trim();
        user.username = username.trim();
        user.email = email.trim();
        user.password = password.trim();
        token : null;
        validate : true;
        lock : false;
        rol : 'user'
      }
              return user
    })
  
    saveJson('../db/users.json', usersModify)
  console.log('users MODIFY: ',usersModify)
    return res.redirect('/admin')
  },
  
  logout: (req,res) => { 
    req.session.destroy();
    res.clearCookie('user'); 
    res.redirect("/");
  }
}