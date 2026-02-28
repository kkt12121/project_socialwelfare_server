const app = require("../server");

const PORT = process.env.SERVER_PORT;

app.listen(PORT, () => {
  console.log(`Check out the app at http://localhost:${PORT}`);
});
