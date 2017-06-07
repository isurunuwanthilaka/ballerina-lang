/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import _ from 'lodash';
import Expression from './expression';
import FragmentUtils from './../../utils/fragment-utils';

/**
 * Constructor for FunctionInvocationExpression
 * @param {Object} args - Arguments to create the FunctionInvocationExpression
 * @constructor
 * @augments Expression
 */
class FunctionInvocationExpression extends Expression {
    constructor(args) {
        super('FunctionInvocationExpression');
        this._packageName = _.get(args, 'packageName', '');
        this._functionName = _.get(args, 'functionName', 'callFunction');
        this._params = _.get(args, 'params', '');
        this._fullPackageName = _.get(args, 'fullPackageName', '');
        this.whiteSpace.defaultDescriptor.regions =  {
            0: '',
            1: '',
            2: '',
            3: ''
        };
        this.whiteSpace.defaultDescriptor.children =  {
            nameRef: {
                0: '',
                1: '',
                2: '',
                3: ''
            }
        };
    }

    setFunctionName(functionName, options) {
        this.setAttribute('_functionName', functionName, options);
    }

    getFunctionName() {
        return this._functionName;
    }

    setFullPackageName(packageName, options) {
        this.setAttribute('_fullPackageName', packageName, options);
    }

    getFullPackageName() {
        return this._fullPackageName;
    }

    setPackageName(packageName, options) {
        this.setAttribute('_packageName', packageName, options);
    }

    getPackageName() {
        return this._packageName;
    }

    setParams(params, options) {
        this.setAttribute('_params', params, options);
    }

    getParams() {
        var params;
        if(!_.isUndefined(this._params)) {
            params = this._params.split(',');
            return params;
        }
        else params = "";
        return params;
    }

    /**
     * Get the expression string
     * @returns {string} expression string
     * @override
     */
    getExpressionString() {
        var text = '';
        if (!_.isNil(this._packageName) && !_.isEmpty(this._packageName) && !_.isEqual(this._packageName, 'Current Package')) {
            text += this._packageName + this.getChildWSRegion('nameRef', 1) + ':';
        }
        text += this.getChildWSRegion('nameRef', 2) + this._functionName + this.getWSRegion(1);
        text += '('+ this.getWSRegion(2) + (this._params? this._params:'') +')' + this.getWSRegion(3);
        return text;
    }

    setExpressionFromString(expressionString) {
        const fragment = FragmentUtils.createExpressionFragment(expressionString);
        const parsedJson = FragmentUtils.parseFragment(fragment);

        this.initFromJson(parsedJson);

        // Manually firing the tree-modified event here.
        // TODO: need a proper fix to avoid breaking the undo-redo
        this.trigger('tree-modified', {
            origin: this,
            type: 'custom',
            title: 'Function Invocation Expression Custom Tree modified',
            context: this,
        });
    }

    /**
     * Creating the function invocation statement which invoked by the parsed code.
     * @param {Object} jsonNode - A node explaining the structure of a function invocation.
     * @param {string} jsonNode.type - The type of this current node. The value would be
     * "function_invocation_expression";
     * @param {string} jsonNode.package_name - The package name of the function being invoked. Example : "system".
     * @param {string} jsonNode.function_name - The body of the function information. Example : "println".
     * @param {Object[]} jsonNode.children - The arguments of the function invocation.
     */
    initFromJson(jsonNode) {
        this.getChildren().length = 0;
        var self = this;
        this.setPackageName(jsonNode.package_name, {doSilently: true});
        if (_.isEqual(jsonNode.package_path, '.')){
            this.setFullPackageName('Current Package', {doSilently: true});
        } else {
            this.setFullPackageName(jsonNode.package_path, {doSilently: true});
        }
        this.setFunctionName(jsonNode.function_name, {doSilently: true});
        _.each(jsonNode.children, function (childNode) {
            var child = self.getFactory().createFromJson(childNode);
            self.addChild(child);
            child.initFromJson(childNode);
        });

        // TODO: Refactor this as well
        this.setParams(this._generateArgsString(jsonNode),  {doSilently: true});
    }

    /**
     * Generates the arguments passed to a function as a string.
     * @param {Object} jsonNode - A node explaining the structure function argument.
     * @return {string} - Arguments as a string.
     * @private
     */
    _generateArgsString(jsonNode) {
        var self = this;
        var argsString = "";

        for (var itr = 0; itr < jsonNode.children.length; itr++) {
            var childJsonNode = jsonNode.children[itr];
            var child = self.getFactory().createFromJson(childJsonNode);
            child.initFromJson(childJsonNode);
            argsString += child.getExpressionString();

            if (itr !== jsonNode.children.length - 1) {
                argsString += ', ';
            }
        }
        return argsString;
    }

    /**
     * Get the action invocation statement
     * @return {string} action invocation statement
     */
    generateExpression() {
        let args = [];
        _.forEach(this.getChildren(), child => {
            args.push(child.generateExpression());
        });
        let argsString = _.join(args, ',');

        var functionName = (_.isNil(this.getPackageName()) || _.isEqual(this.getPackageName(), 'Current Package') )
            ? this.getFunctionName() : this.getPackageName() + ':' + this.getFunctionName();

        return functionName + '(' + argsString +  ')';
    }
}

export default FunctionInvocationExpression;
