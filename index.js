const homeDir = require("os").homedir();
const fs = require("fs");
const NodeGit = require("nodegit");
const { spawn } = require("child_process");

const ora = require("ora");

fs.mkdir(`${homeDir}/prodigy`, err => {
  if (!err) {
    console.log("prodigy dir created");
  } else {
    console.log(err);
  }

  fs.mkdir(`${homeDir}/prodigy/repos`, err => {
    if (!err) {
      console.log("repos dir created");
    } else {
      console.log(err);
    }

    const cloneURL = "git@github.com:SMARTeacher/prodigy-api.git";
    const localPath = `${homeDir}/prodigy/repos/api`;
    const cloneOptions = {};
    cloneOptions.fetchOpts = {
      callbacks: {
        certificateCheck: function() {
          return 1;
        },
        credentials: function(url, userName) {
          return NodeGit.Cred.sshKeyFromAgent(userName);
        }
      }
    };

    const spinner = ora("Cloning repo").start();

    NodeGit.Clone(cloneURL, localPath, cloneOptions)
      .then(result => {
        spinner.succeed();

        const spinner2 = ora("Installing Dependencies").start();
        const child = spawn("yarn install", {
          shell: true,
          cwd: `${homeDir}/prodigy/repos/api`
        });

        child.on("error", err => {
          console.log(err);
          console.log("Done");
        });

        child.on("exit", err => {
          spinner2.succeed();
        });
      })
      .catch(err => {
        console.log(err);
        spinner.stop();
      });
  });
});
