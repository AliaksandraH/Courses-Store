const keys = require("../keys");

module.exports = function (to, name, token) {
    return {
        to: to,
        from: keys.EMAIL_FROM,
        subject: "CouHive - Password Reset",
        html: `
            <h1>Hello ${name},</h1>
            <p>You are receiving this email because you have requested a password reset for your account.</p>
            <p>To reset your password, please follow the link below:</p>
            <p><a href="${keys.BASE_URL}/auth/password/${token}">Password Reset Link<a></p>
            <p>If you did not request a password change, please disregard this message.</p>
            <h1>Best regards, CouHive.</h1>
        `,
    };
};
