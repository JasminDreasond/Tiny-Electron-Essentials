document.getElementById('ping').addEventListener('click', async () => {
  const response = await window.api.ping();
  document.getElementById('response').textContent = response;
  const response2 = await window.api.getUser();
  document.getElementById('response2').textContent =
    `IpcRequestManager tester: ${JSON.stringify(response2)}`;
});
