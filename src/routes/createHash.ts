export function createHash(length: number): string {
  let randomString = "afdhajkledfiounvjadfhaadfaklvnacsire";

  let ans = "";

  for (let i = 0; i < length; ++i) {
    ans += randomString[Math.floor(Math.random() * length)];
  }

  return ans;
}
