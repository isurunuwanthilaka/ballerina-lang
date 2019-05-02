/*
 * Copyright (c) 2019, WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.ballerinalang.docgen.generator.model;

import java.util.List;
import java.util.Optional;

/**
 * Represent documentation for an Object.
 */
public class Object extends Construct {

    public List<DefaultableVarible> fields;
    public List<Function> methods;

    public Object(String name, String description, List<DefaultableVarible> fields, List<Function> methods) {
        super(name, description);
        this.fields = fields;
        this.methods = methods;
    }

    public Optional<Function> getInitMethod() {
        return this.methods.stream()
                .filter(function -> function.name.equals("__init"))
                .findFirst();
    }
}
