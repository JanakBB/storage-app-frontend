import { spawn } from "child_process";

const bashChildProcess = spawn("bashs", ["script.sh"]);

// console.log(bashChildProcess.stdout);
// console.log(bashChildProcess.stderr);

bashChildProcess.stdout.on("data", (data) => {
  process.stdout.write(data);
});
bashChildProcess.stderr.on("data", (data) => {
  process.stderr.write(data);
});

bashChildProcess.on("close", (code) => {
  if (code === 0) {
    console.log("Script executed successfully!");
  } else {
    console.log("Script failed!!");
  }
});

bashChildProcess.on("error", (err) => {
  console.log("Error on spawning the process!");
  console.log(err);
});
