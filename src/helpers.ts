export const sleep = (milliseconds: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

/**
 * Return even-length hexadecimal string representation of an integer.
 */
export const intToHex = (int: number | null): string | null => {
    if (!int) return null
    var str = int.toString(16)
    var evenLenStr = str.length % 2 === 0 ? str : '0'.concat(str)
    return '0x'.concat(evenLenStr)
}

export const hexToInt = (hex: string): number => {
    return parseInt(hex, 16)
}