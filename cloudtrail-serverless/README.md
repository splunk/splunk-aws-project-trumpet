TODO:
    Solve the certificate issue. 
        -   create ALB and cert as part of template
    Figure out best option for CloudTrail -> S3 -> SNS -> lambda pathway
        - Issue: CFN does not support update of existing resources. It is likely the user will have an existing 
        trail with data being pushed to an existing s3 bucket and may have dependencies on that bucket name. 