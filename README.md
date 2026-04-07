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
