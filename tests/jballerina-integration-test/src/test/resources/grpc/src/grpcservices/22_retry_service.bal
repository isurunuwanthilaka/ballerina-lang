// Copyright (c) 2020 WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
//
// WSO2 Inc. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import ballerina/grpc;
import ballerina/io;

int TIMEOUT = 5000;
int requestCount = 0;

string clientName = "";

listener grpc:Listener retryListener = new (9112);

@grpc:ServiceDescriptor {
    descriptor: ROOT_DESCRIPTOR_22,
    descMap: getDescriptorMap22()
}
service RetryService on retryListener {
    resource function getResult(grpc:Caller caller, string value) {
        // Identifying the client to maintain state to track retry attempts.
        if (clientName != value) {
            requestCount = 0;
            clientName = <@untainted>value;
        }
        requestCount += 1;
        io:println(clientName + ": Attetmpt No. " + requestCount.toString());
        if (requestCount < 4) {
            var sendResult = caller->sendError(13, "Mocking Internal Error");
            var completeResult = caller->complete();
        } else {
            var sendResult = caller->send("Total Attempts: " + requestCount.toString());
            var completeResult = caller->complete();
        }
    }
}

const string ROOT_DESCRIPTOR_22 =
"0A14756E6172795F626C6F636B696E672E70726F746F1A1E676F6F676C652F70726F746F6275662F77726170706572732E70726F746F32570A0C52657472795365727669636512470A09676574526573756C74121C2E676F6F676C652E70726F746F6275662E537472696E6756616C75651A1C2E676F6F676C652E70726F746F6275662E537472696E6756616C7565620670726F746F33";
function getDescriptorMap22() returns map<string> {
    return {
        "unary_blocking.proto":"0A14756E6172795F626C6F636B696E672E70726F746F1A1E676F6F676C652F70726F746F6275662F77726170706572732E70726F746F32570A0C52657472795365727669636512470A09676574526573756C74121C2E676F6F676C652E70726F746F6275662E537472696E6756616C75651A1C2E676F6F676C652E70726F746F6275662E537472696E6756616C7565620670726F746F33",
        "google/protobuf/wrappers.proto":"0A1E676F6F676C652F70726F746F6275662F77726170706572732E70726F746F120F676F6F676C652E70726F746F62756622230A0B446F75626C6556616C756512140A0576616C7565180120012801520576616C756522220A0A466C6F617456616C756512140A0576616C7565180120012802520576616C756522220A0A496E74363456616C756512140A0576616C7565180120012803520576616C756522230A0B55496E74363456616C756512140A0576616C7565180120012804520576616C756522220A0A496E74333256616C756512140A0576616C7565180120012805520576616C756522230A0B55496E74333256616C756512140A0576616C756518012001280D520576616C756522210A09426F6F6C56616C756512140A0576616C7565180120012808520576616C756522230A0B537472696E6756616C756512140A0576616C7565180120012809520576616C756522220A0A427974657356616C756512140A0576616C756518012001280C520576616C756542570A13636F6D2E676F6F676C652E70726F746F627566420D577261707065727350726F746F50015A057479706573F80101A20203475042AA021E476F6F676C652E50726F746F6275662E57656C6C4B6E6F776E5479706573620670726F746F33"
    };
}
