Github Actions Pipelines and InHouse Actions

For more information checkout this Confluence Document

https://carecru.atlassian.net/l/cp/b1FXvbfB

## Semantic versioning and floating major tags

This repository should follow **semantic versioning** for releases: **MAJOR.MINOR.PATCH** (e.g. `3.2.1`). Bump the **major** when reusable workflows or actions change in a breaking way for callers; **minor** for backward-compatible additions; **patch** for fixes.

Callers can reference workflows with an **immutable** tag (`@v3.2.1`) for maximum stability, or a **floating major** tag (`@v3`) so they automatically track the latest **v3.\*** release without tracking `main` and without editing every consumer repo for each patch.

### Updating a floating major (e.g. `v3` or `v4`)

After you cut or fast-forward the commit that should represent “current v3”, move the lightweight tag and push it:

```bash
git tag -f v3
git push origin v3 --force
```

Use **`v4`**, **`v5`**, and so on the same way when those major lines exist. The force push is required because the tag name is reused at a new commit.

**Convention:** Keep **`vN`** aligned with the latest release on major **N** (e.g. after tagging `v3.4.0`, point **`v3`** at that same commit). Document any exception if a major line is frozen.

### Caller examples

- Pin to a major line: `uses: OWNER/gh_pipelines/.github/workflows/example.yml@v3`
- Pin to an exact release: `uses: OWNER/gh_pipelines/.github/workflows/example.yml@v3.4.0`

Avoid having every repository point at **`main`** unless you intentionally want unreleased workflow changes.

### v4 breaking change: `deploy_mfe.yml`

**v4** replaces direct S3 copy with ArgoCD deploy via `repository_dispatch` to `carecru-deployment-configs`.

| v3 (removed) | v4 |
|---|---|
| `service_name`, `region`, `domain`, AWS key secrets | `app`, `tag`, `mfe_service_name`, `pat_devops` |
| Copies `micro-frontend-artifacts` → env bucket in the workflow | Bumps `release` in `{env}/{app}.yaml`; Helm MFE sync hook runs in cluster |

Example:

```yaml
uses: CareCru/gh_pipelines/.github/workflows/deploy_mfe.yml@v4
with:
  app: dashboard
  environment: dev
  tag: abc1234
  mfe_service_name: dashboard-frontend
secrets:
  pat_devops: ${{ secrets.PAT_DEVOPS }}
```

Repos still on **v3** `deploy_mfe.yml` keep the old behavior until they upgrade to **@v4**.

### `deploy_app.yml` and `resolve_targets.yml`

`resolve_targets.yml` holds the shared rules for which environments a run targets, and with which tag:

| Caller event | Environments | Tag |
|---|---|---|
| push to `develop` (`branch` input) | `dev` | short commit SHA |
| prerelease created | `test` | release tag |
| release created | `prod`, `prod-us` (RC tags blocked) | release tag |
| `workflow_dispatch` | the `env` input (any environment, e.g. `test-2`) | the `tag` input |

It outputs `envs` (a JSON array, `[]` when nothing should run) and `tag`. Repos that build per environment before deploying (e.g. form-service, enterprise-management) can call it directly and fan out with `matrix.env: ${{ fromJson(needs.<job>.outputs.envs) }}`.

`deploy_app.yml` calls `resolve_targets.yml`, then deploys each environment with `deploy_mfe.yml` when `mfe_service_name` is set, or `deploy.yml` otherwise. A caller's whole Deploy workflow becomes:

```yaml
name: Deploy
on:
  push:
    branches: [develop]
  release:
    types: [created]
  workflow_dispatch:
    inputs:
      env: { description: "Environment to deploy (e.g. dev, test, test-2, prod, prod-us)", required: true }
      tag: { description: Tag to deploy, required: true }

jobs:
  deploy:
    uses: CareCru/gh_pipelines/.github/workflows/deploy_app.yml@v4
    with:
      app: dashboard
      mfe_service_name: dashboard-frontend # omit for image only apps
    secrets:
      client_id: ${{ secrets.DEPLOY_CLIENT_ID }}
      app_private_key: ${{ secrets.DEPLOY_APP_PRIVATE_KEY }}
```

The dispatch inputs must be named `env` and `tag`, or passed explicitly through the `env` / `tag` inputs.
