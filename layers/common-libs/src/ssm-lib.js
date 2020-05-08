const AWS = require('aws-sdk');
const { go } = require('fff-js')
const aws_ssm = new AWS.SSM({ region: 'ap-northeast-2' });

const SSM = {};

const getValue = keyObj => aws_ssm.getParameter(keyObj).promise();
const getValuesByPath = keyObj => aws_ssm.getParametersByPath(keyObj).promise();

const takeParameterValue = parameterObj => {
    return !parameterObj
        ? 'Erorr Params'
        : parameterObj.Parameter.Value
};

const takeParameterValueList = parameterObj => {
    return !parameterObj
        ? 'Erorr Params'
        : parameterObj.Parameters
};

SSM.getParamterStoreValue = name => getValue({
    Name: name,
    WithDecryption: false
});

SSM.getParamterStoreSecretValue = name => getValue({
    Name: name,
    WithDecryption: true
});

SSM.getParameterStoreValuesByPath = ({ path, isDecryption }) => getValuesByPath({
    Path: path,
    WithDecryption: isDecryption
});

SSM.getParameter = name => go(
    name,
    SSM.getParamterStoreValue,
    takeParameterValue
);

SSM.getSecretParameter = name => go(
    name,
    SSM.getParamterStoreSecretValue,
    takeParameterValue
);

SSM.getParametersByPath = (path, isDecryption) => go(
    {
        path,
        isDecryption
    },
    SSM.getParameterStoreValuesByPath,
    takeParameterValueList
);

exports.SSM = SSM
