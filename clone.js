const homeDir = require("os").homedir();
const NodeGit = require("nodegit");

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

function cloneRepo(remote, name) {
  const localPath = `${homeDir}/prodigy/${name}`;

  NodeGit.Clone(remote, localPath, cloneOptions).catch(err => {
    console.log(err);
    process.exit();
  });
}

cloneRepo(process.argv[2], process.argv[3]);
