1. Update the CHANGELOG.md file to fully reflect changes in the version
2. Update README.md as necessary and with a link to the old version (handled with a GitHub tag)
3. Update production s3 buckets with new code (currently code in the `splunk-aws-automation-configuration/lambda_code` and `splunk-aws-automation/lambda_code` directories)
    1. Old Lambda code directories should be moved into a directory named `v0.x` (replace `x` with the old version number)
    2. All new Lambda code directories should have `v0.x` (replace `x` with the new version number) appended to the end of the directory name
    3. Run the package_upload.py script
4. Update GitHub
    1. Push to the `develop/v0.x` (replace `x` with the new version number) branch
    2. Create a pull request
    3. Merge to master
    4. Tag old version
5. Announce in relevant channels