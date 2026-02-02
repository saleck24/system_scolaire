const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendResetEmail = async (email, resetLink) => {
    const mailOptions = {
        from: `"Système Scolaire" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #007bff; text-align: center;">Système Scolaire</h2>
                <p>Bonjour,</p>
                <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour procéder :</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser mon mot de passe</a>
                </div>
                <p>Si vous n'avez pas demandé ce changement, vous pouvez ignorer cet email en toute sécurité.</p>
                <p>Ce lien expirera dans 1 heure.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.8rem; color: #777; text-align: center;">Ceci est un message automatique, merci de ne pas y répondre.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[MAIL_SENT] Reset email sent to ${email}`);
    } catch (error) {
        console.error('[MAIL_ERROR] Failed to send email:', error);
        throw new Error('Erreur lors de l\'envoi de l\'email.');
    }
};
