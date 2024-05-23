export function lineToNumber(line: number) {
  if (line === 6) {
    return 1;
  } else if (line === 5) {
    return 2;
  } else if (line === 4) {
    return 3;
  } else if (line === 3) {
    return 4;
  } else if (line === 2) {
    return 5;
  } else if (line === 1) {
    return 6;
  }
  return 1;
}
