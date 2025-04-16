const User = require('../models/userModel')
const bcrypt = require('bcryptjs')

exports.signUp = async (req, res) => {
    const { username, password } = req.body
    try {
      const hashedPassword = await bcrypt.hash(password, 12)
      const newUser = await User.create({username, password: hashedPassword})
      req.session.user = newUser
      res.status(201).json({
        status: 'success',
        data: {
            user: newUser
        }
      })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            status: 'fail',
        })
    }
}

exports.login = async (req, res) => {
    const { username, password } = req.body
    try {
        const user = await User.findOne({username})
        if (!user) {
            return res.status(400).json({
                status: 'fail',
                message: 'user not found'
            })
        }
        const isValidPassword = await bcrypt.compare(password, user.password)
        if(isValidPassword){
            console.log({session: req.session})
            req.session.user = user
            console.log({ session: req.session })
            res.status(200).json({
                status: 'success',
            })
        }else{
            res.status(400).json({
                status: 'fail',
                message: 'incorrect username or password'
            })
        }
      } catch (error) {
          console.log(error)
          res.status(400).json({
              status: 'fail',
          })
      }
}