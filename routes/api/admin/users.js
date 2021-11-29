const express = require('express');
const router = express.Router();
const authAdmin = require('../../../middleware/authAdmin');
const logger = require('../../../config/logger');

const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route   GET api/admin/users
// @desc    Get all projects
// @access  Private
router.get('/', authAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    logger.error(error.message);
    res.status(500).send({ errors: [{ msg: 'server error' }] });
  }
});

// @route   POST api/admin/users
// @desc    register users
// @access  Public
router.post(
  '/',
  [
    authAdmin,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Email is not valid').isEmail(),
      check('role', 'Role is not valid').not().isEmpty(),
      check('position', 'Position is not valid').not().isEmpty(),
      check('password', 'Password should be 6 or more characters').isLength({
        min: 6,
      }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password, role, position } = req.body;

    try {
      let user = await User.findOne({ email: email });

      if (user) {
        res.status(400).json({ errors: [{ msg: 'User already exists!' }] });
      }

      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm',
      });

      user = new User({
        name,
        email,
        password,
        avatar,
        role,
        position,
      });

      const salt = await bcrypt.genSalt(config.get('bcryptSalt'));
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id,
          role: user.role,
        },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: config.get('JWTExpiresIn') },
        (err, token) => {
          if (err) {
            throw err;
          }
          res.json({ token });
        }
      );
    } catch (error) {
      logger.error('Unable to fetch user record from database - ', error);
      res.status(500).send('Server error!');
    }
  }
);

module.exports = router;
