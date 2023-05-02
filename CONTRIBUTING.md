# Contributing to the project

## Sign off Your Work

The Developer Certificate of Origin (DCO) is a lightweight way for contributors to certify that they wrote or otherwise have the right to submit the code they are contributing to the project. Here is the full text of the [DCO](https://developercertificate.org/). Contributors must sign-off that they adhere to these requirements by adding a Signed-off-by line to commit messages.

```
This is my commit message

Signed-off-by: Random J Developer <random@developer.example.org>
```

See git help commit:

```
-s, --signoff
Add Signed-off-by line by the committer at the end of the commit log
message. The meaning of a signoff depends on the project, but it typically
certifies that committer has the rights to submit this work under the same
license and agrees to a Developer Certificate of Origin (see
http://developercertificate.org/ for more information).
```

## How to Contribute

1. Fork this repository, develop, and test your changes
2. Remember to sign off your commits as described above
3. Submit a pull request

## How to add a new library

1. create a new Nx library using a suitable generator with a standalone project.json
2. add a `generate-docs` target to the project.json
    ```
      "generate-docs": {
       "executor": "@cloudflight/nx-plugin-typedoc:build",
       "outputs": ["{options.output}"],
       "inputs": ["default"],
       "options": {
         "output": "apps/documentation/src/api/<libName>",
         "entryPoint": "packages/<libName>/src/index.ts",
         "tsConfig": "packages/<libName>/tsconfig.lib.json"
       }
    ```
3. add a implicit dependency to the new library in `apps/documentation/project.json` so the docs get build automatically
4. add a `publish` target to the project.json
    ```
     "publish": {
       "executor": "@nx/workspace:run-commands",
       "options": {
         "command": "node tools/scripts/publish.mjs <libName>"
       },
       "dependsOn": [
         {
           "projects": "self",
           "target": "build"
         }
       ]
     },
    ```
