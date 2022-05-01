const express = require('express')
const UserCtrl = require('../controllers/user-ctrl')
const router = express.Router()

router.post('/user', UserCtrl.createMovie)
router.put('/user/:id', UserCtrl.updateMovie)
router.delete('/user/:id', UserCtrl.deleteMovie)
router.get('/user/:id', UserCtrl.getMovieById)
router.get('/user', UserCtrl.getMovies)

module.exports = router
