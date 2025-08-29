export async function fetchCloses(symbol, limit = 200) {
  // generate fake walk data for testing
  let v = 100 + Math.random() * 10
  const arr = []
  for (let i = 0; i < limit; i++) {
    v += (Math.random() - 0.5) * 0.8
    arr.push(Math.max(1, v))
  }
  return arr
}
