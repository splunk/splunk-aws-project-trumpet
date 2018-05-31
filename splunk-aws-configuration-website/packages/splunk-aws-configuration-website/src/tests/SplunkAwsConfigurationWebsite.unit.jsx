/* eslint-env mocha */

import 'raf/polyfill'; // ensure requestAnimationFrame is available, React requires it
import React from 'react';
import { assert } from 'chai';
import Enzyme, { mount } from 'enzyme';
import EnzymeAdapterReact16 from 'enzyme-adapter-react-16';
import SplunkAwsConfigurationWebsite from '../SplunkAwsConfigurationWebsite';

// This sets up the enzyme adapter
const adapter = new EnzymeAdapterReact16();
Enzyme.configure({ adapter });

describe('SplunkAwsConfigurationWebsite', () => {
    it('renders with default name', () => {
        const wrapper = mount(<SplunkAwsConfigurationWebsite />);
        assert.include(wrapper.text(), 'Hello, User!');
        wrapper.unmount();
    });

    it('renders with custom name', () => {
        const wrapper = mount(<SplunkAwsConfigurationWebsite name="World" />);
        assert.include(wrapper.text(), 'Hello, World!');
        wrapper.unmount();
    });

    it('increases the counter when button is clicked', () => {
        const wrapper = mount(<SplunkAwsConfigurationWebsite name="World" />);
        assert.equal(wrapper.state('counter'), 0);
        wrapper.find('button').simulate('click');
        assert.equal(wrapper.state('counter'), 1);
        wrapper.unmount();
    });
});
