export function fmtTimeStamp(
    format: string,
    region: string,
    hourDigit: "numeric" | "2-digit" = "2-digit",
    minuteDigit: "numeric" | "2-digit" = "2-digit"
): string {
    return new Date(format).toLocaleTimeString(region, {
        hour: hourDigit,
        minute: minuteDigit,
    });
}
