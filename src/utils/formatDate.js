export function formatDate(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}
