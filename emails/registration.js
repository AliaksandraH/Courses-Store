const keys = require("../keys");

module.exports = function (to) {
    return {
        to: to,
        from: keys.EMAIL_FROM,
        subject: "CouHive",
        html: `
            <h1>Welcome to CouHive!</h1>
            <p>Hello,</p>
            <p>Welcome to CouHive! We're thrilled to have you join our online learning community.</p>
            <p>We've created this app to help you expand your knowledge, reach new goals, and enrich your experience. Here, you'll find a wide range of courses on various topics from leading experts and instructors.</p>
            <p>Start your educational journey right now by clicking on the <a href="${keys.BASE_URL}">link</a> and select the programs you are interested in.<p>
            <p>Thank you for choosing CouHive! We hope you'll derive maximum benefit from our app.</p>
            <h1>Best regards, The CouHive Team.</h1>
        `,
    };
};
