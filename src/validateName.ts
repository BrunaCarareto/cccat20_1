export function validateName (name: string) {
    // To return TRUE, the following rules are necessary:
    // It starts with one or more letters (upper or lower case)
    // It has exactly one space between two groups of letters
    // It ends with one or more letters after the space
    if (name.match(/^[a-zA-Z]+ [a-zA-Z]+$/)) return true;
	return false
}