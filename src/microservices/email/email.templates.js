export const templates = {
	registration: (username, confirmationToken) => ({
		subject: `Email Verification ${username} | Welcome to VideoTube`,
		html: `<p> Hey, your verification link is ${confirmationToken}</p>`,
	}),
};
