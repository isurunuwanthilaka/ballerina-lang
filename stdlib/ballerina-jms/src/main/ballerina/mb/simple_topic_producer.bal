package ballerina.jms;

import ballerina/log;

public type SimpleTopicProducer object {
    public {
        SimpleTopicProducerEndpointConfiguration config;
    }

    private {
        jms:SimpleTopicProducer? sender;
        TopicProducerConnector? senderConnector;
    }

    public function init(SimpleTopicProducerEndpointConfiguration config) {
    endpoint jms:SimpleTopicProducer topicProducer {
        initialContextFactory: "wso2mbInitialContextFactory",
        providerUrl: generateBrokerURL(config),
        connectionFactoryName: "ConnectionFactory",
        acknowledgementMode: config.acknowledgementMode,
        properties: config.properties,
        topicPattern: config.topicPattern
    };
    self.sender = topicProducer;
    self.senderConnector = new TopicProducerConnector(topicProducer);
    self.config = config;
}

    public function register (typedesc serviceType) {
    }

    public function start () {
    }

    public function getClient () returns (TopicProducerConnector) {
        match (self.senderConnector) {
            TopicProducerConnector s => return s;
            () => {
                error e = {message:"Topic producer connector cannot be nil"};
                throw e;
            }
        }
    }

    public function stop () {
    }

    public function createTextMessage(string message) returns (Message|Error) {
        match (self.sender) {
            jms:SimpleTopicProducer s => {
                var result = s.createTextMessage(message);
                match (result) {
                    jms:Message m => return newMessage(m);
                    jms:Error e => return e;
                }
            }
            () => {
                error e = {message:"topic sender cannot be nil"};
                throw e;
            }
        }

    }
};

public type TopicProducerConnector object {
    private {
        jms:SimpleTopicProducer sender;
    }

    new (sender) {}

    public function send (Message m) returns (Error | ()) {
        endpoint jms:SimpleTopicProducer senderEP = self.sender;
        var result = senderEP->send(m.getJMSMessage());
        return result;
    }
};

public type SimpleTopicProducerEndpointConfiguration {
    string username = "admin",
    string password = "admin",
    string host = "localhost",
    int port = 5672,
    string clientID = "ballerina",
    string virtualHost = "default",
    string acknowledgementMode = "AUTO_ACKNOWLEDGE",
    map properties,
    string topicPattern,
};

