export function isEmpty(obj) {
  if (!obj) return false;
  return Object.keys(obj).length === 0;
}
