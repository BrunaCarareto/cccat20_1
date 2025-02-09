export function validateCarPlate (carPlate: string) {
    // To return TRUE, the following rules are necessary:
    // It must contain a sequence of 3 capital letters followed by 4 numbers.
	if (carPlate.match(/[A-Z]{3}[0-9]{4}/)) return true;
    return false;
}