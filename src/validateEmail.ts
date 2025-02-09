export function validateEmail (email: string) {
    // To return TRUE, the following rules are necessary:
    // It starts with any sequence of characters (representing the username in the email)
    // It has the "@" symbol separating the username from the domain
    // It ends with any sequence of characters (representing the email domain)
	if (email.match(/^(.+)@(.+)$/)) return true;
	return false;
}