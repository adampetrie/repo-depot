const homeDir = require("os").homedir();
const fs = require("fs");
const Listr = require("listr");
const execa = require("execa");

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

function repoTasks(repo) {
  return new Listr([
    {
      title: "Cloning Repo...",
      task: async ctx => {
        await execa("node", ["./clone.js", repo.remote, repo.name]);
      }
    },
    {
      title: "Installing dependencies...",
      task: async () => {
        await execa("yarn", ["install"], {
          cwd: `${homeDir}/prodigy/${repo.name}`
        });
      }
    }
  ]);
}

function installRepos() {
  const tasks = repos.map(repo => {
    return {
      title: repo.name,
      task: () => {
        return repoTasks(repo);
      }
    };
  });

  return new Listr(tasks, { concurrent: true });
}

const setup = new Listr(
  [
    {
      title: "Creating prodigy directory",
      task: (ctx, task) => {
        const root = `${homeDir}/prodigy`;
        if (!fs.existsSync(root)) {
          fs.mkdirSync(root);
          task.title = `Created ${root}`;
        } else {
          task.title = `${root} already exists`;
        }
      }
    },
    {
      title: "Setting up local repositories",
      task: () => {
        return installRepos();
      }
    }
  ],
  { collapse: false }
);

setup.run();
