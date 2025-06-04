document.getElementById('ping').addEventListener('click', async () => {
  const response = await window.api.ping();
  document.getElementById('response').textContent = response;
});
