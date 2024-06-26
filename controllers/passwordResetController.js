//controllers/passwordResetController.js
const User = require('../models/user');
const ResetToken = require('../models/resetToken');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const generateToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com', 
    port: 587, 
    secure: false, 
    auth: {
        user: 'alexander_forss@hotmail.com',
        pass: '',
    },
    tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
    },
});

module.exports.transporter = transporter;


exports.forgotPassword = async (req, res) => {
    console.log('Forgot Password Route Reached');
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send('User not found');
        }

        const token = generateToken();

        console.log('Generated Token:', token);

        const resetToken = new ResetToken({
            userId: user._id,
            token,
            expirationDate: Date.now() + 3600000,
        });

        await resetToken.save();

        const resetLink = `https://www.barreltreasure.com/password_reset/${token}`;

        console.log(email);

        const mailOptions = {
            from: 'alexander_forss@hotmail.com',
            to: email,
            subject: 'Password Reset Link',
            text: `Click this link to reset your password: ${resetLink}`,
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
        };

        console.log('Sending password reset email...');
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully');

        return res.status(200).send('Reset email sent successfully');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
};

exports.renderResetForm = async (req, res) => {
    console.log('Render Reset Form Route Reached');
    try {
        const { token } = req.params;
        const resetToken = await ResetToken.findOne({ token });

        if (!resetToken || resetToken.expirationDate < new Date()) {
            return res.status(404).send('Invalid or expired token');
        }

        res.render('password_reset', { token });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        console.log('Reset Password Route Reached');
        console.log('Token:', token);
        console.log('New Password:', newPassword);

        const resetToken = await ResetToken.findOne({ token }).populate('userId');

        if (!resetToken || resetToken.expirationDate < new Date()) {
            console.log('Invalid or expired token');
            return res.status(404).send('Invalid or expired token');
        }

        const user = await User.findById(resetToken.userId._id);

        if (!user) {
            console.log('User not found');
            return res.status(404).send('User not found');
        }

        user.password = newPassword;
        await user.save();

        // Remove the used reset token from the database
        await ResetToken.deleteOne({ token });

        console.log('Password updated successfully');
        return res.status(200).send('Password updated successfully');
    } catch (err) {
        console.error(err);
        console.log('Error resetting password');
        return res.status(500).send('Error resetting password');
    }
};