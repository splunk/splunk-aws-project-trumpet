import os
import json
from datetime import datetime



class trumpetLogger(object):
    """
    Some details for later
    """

    # LOGGING FORMAT

    def __init__(self, lambda_context, lambda_event):
        """Set up our HEC instance using environment
        variables from the lambda function we are running under
        and set up our log line examples"""

        """This is recycled from another project. There's probably some redundant 
        or additional info we need to  add to make it work for our use case"""

        self.LOG_STRING = '{date} action_mode="lambda" lambda_message="{lambda_message}" lambda_status="{status}"'
        self.UI_STRING = '{date} action_mode="lambda" lambda_message="{lambda_message}" lambda_status="{status}"'

        self.sourcetype = 'modular_alerts:{}'.format(lambda_context.function_name)
        self.source = '{}_modalert.log'.format(lambda_context.function_name)

        # store lambda context internally
        self.lambda_context = lambda_context

    def writebase(self, lambda_status, lambda_message=None):
        """Sends the requried message to Splunk to register
        in the ES UI"""
        t = datetime.utcnow()
        s = t.strftime('%Y-%m-%d %H:%M:%S,%f')
        log_time = s[:-3] + "+0000"
        if lambda_message is None:
            lambda_message = self.lambda_context.function_name
        try:
            print self.UI_STRING.format(date=log_time, lambda_message=lambda_message, status=lambda_status)
        except Exception as e:
            print "Encountered exception while attempting to write base data: {}".format(str(e))





