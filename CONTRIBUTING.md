# Contribution guide

## Developing Cultivator

You consider contributing changes to Cultivator – thank you!
Please consider these guidelines when filing a pull request:

*  Commits follow the [Angular commit convention](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines) (*Tip:* use `npm run cz` to create commits)

## Creating releases

Cultivator uses [semantic-release](https://github.com/semantic-release/semantic-release)
to release new versions automatically.

*  Commits of type `fix` will trigger bugfix releases, think `0.0.1`
*  Commits of type `feat` will trigger feature releases, think `0.1.0`
*  Commits with `BREAKING CHANGE` in body or footer will trigger breaking releases, think `1.0.0`

All other commit types will trigger no new release.