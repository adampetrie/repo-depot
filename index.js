const homeDir = require("os").homedir();
const fs = require("fs");
const Listr = require("listr");
const execa = require("execa");

const repos = [
  "git@github.com:SMARTeacher/prodigy-api.git",
  "git@github.com:SMARTeacher/prodigy-graphql.git"
];

const repoName = repo => {
  return repo.split("/")[1].split(".")[0];
};

function repoTasks(repo, name) {
  return new Listr([
    {
      title: "Cloning Repo...",
      task: async ctx => {
        await execa("git", ["clone", repo], {
          cwd: `${homeDir}/prodigy`
        });
      }
    },
    {
      title: "Installing dependencies...",
      task: async () => {
        await execa("yarn", ["install"], {
          cwd: `${homeDir}/prodigy/${name}`
        });
      }
    }
  ]);
}

function installRepos() {
  const tasks = repos.map(repo => {
    const name = repoName(repo);
    return {
      title: name,
      task: () => {
        return repoTasks(repo, name);
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
