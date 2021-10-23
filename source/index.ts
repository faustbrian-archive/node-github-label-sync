#!/usr/bin/env node
import { readFileSync } from "fs";
import { Octokit } from "octokit";
import { resolve } from "path";
import yargs from "yargs/yargs";

interface Label {
  name: string;
  description: string;
  color: string;
}

export const main = async (): Promise<void> => {
  const { auth, config, owner, repo } = yargs(process.argv.slice(2)).options({
    auth: { demandOption: true, type: "string" },
    config: { demandOption: true, type: "string" },
    owner: { demandOption: true, type: "string" },
    repo: { demandOption: true, type: "string" },
  }).argv;

  const newLabels: Label[] = JSON.parse(
    readFileSync(resolve(config)).toString("utf8"),
  );

  const octokit = new Octokit({ auth });

  const { data: oldLabels } = await octokit.rest.issues.listLabelsForRepo({
    owner,
    repo,
  });

  for (const oldLabel of oldLabels) {
    console.log(`Deleting label: ${oldLabel.name}`);

    await octokit.rest.issues.deleteLabel({ name: oldLabel.name, owner, repo });
  }

  for (const newLabel of newLabels) {
    console.log(`Creating label: ${newLabel.name}`);

    await octokit.rest.issues.createLabel({
      color: newLabel.color.startsWith("#")
        ? newLabel.color.slice(1)
        : newLabel.color,
      description: newLabel.description,
      name: newLabel.name,
      owner,
      repo,
    });
  }
};

main();
