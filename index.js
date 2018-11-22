const homeDir = require("os").homedir();
const fs = require("fs");
const NodeGit = require("nodegit");
const { spawn } = require("child_process");

const ora = require("ora");

const root = `${homeDir}/prodigy`;
if (!fs.existsSync(root)) {
  fs.mkdirSync(root);
  console.log("Creating prodigy directory...");
}

const reposDir = `${homeDir}/prodigy/repos`;
if (!fs.existsSync(reposDir)) {
  fs.mkdirSync(reposDir);
  console.log("Creating prodigy/repos directory...");
}

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

function cloneRepo(repo) {
  const { remote, name } = repo;
  const localPath = `${homeDir}/prodigy/repos/${name}`;
  const spinner = ora(`Cloning ${name}...`).start();

  NodeGit.Clone(remote, localPath, cloneOptions)
    .then(result => {
      spinner.succeed();
      installDeps(repo);
    })
    .catch(err => {
      console.log(err);
      spinner.stop();
    });
}

function installDeps(repo) {
  const { name } = repo;
  const spinner2 = ora(`Installing ${name} dependencies...`).start();
  const child = spawn("yarn install", {
    shell: true,
    cwd: `${homeDir}/prodigy/repos/${name}`
  });

  child.on("error", err => {
    console.log(err);
    console.log("Done");
  });

  child.on("exit", err => {
    spinner2.succeed();
  });
}

const repos = [
  {
    remote: "git@github.com:SMARTeacher/prodigy-api.git",
    name: "api"
  },
  {
    remote: "git@github.com:SMARTeacher/prodigy-graphql.git",
    name: "graphql"
  }
];

repos.forEach(repo => {
  cloneRepo(repo);
});
