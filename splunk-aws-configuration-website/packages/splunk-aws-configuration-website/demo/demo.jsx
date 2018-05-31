import React from 'react';
import { render } from 'react-dom';
import SplunkAwsConfigurationWebsite from '../src/SplunkAwsConfigurationWebsite';

const containerEl = document.getElementById('main-component-container');
render(<SplunkAwsConfigurationWebsite />, containerEl);
