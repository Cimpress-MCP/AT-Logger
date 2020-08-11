import Logger from './logger';

describe('log()', () => {
  const expectedErrorMessage = 'this is a unit test error';
  const expectedException = new Error(expectedErrorMessage);
  const testCases = [
    {
      name: 'logs an object',
      message: {
        title: 'My title'
      },
      expectedMessage: {
        title: 'My title'
      }
    },
    {
      name: 'uses specified spaces when overridden with 0',
      jsonSpace: 0,
      message: {
        title: 'My title'
      },
      expectedMessage: {
        title: 'My title'
      }
    },
    {
      name: 'logs an exception',
      message: {
        title: 'Exception',
        exception: JSON.stringify({message: 'error-message'})
      },
      expectedMessage: {
        title: 'Exception',
        exception: JSON.stringify({message: 'error-message'})
      }
    },
    {
      name: 'Converts strings to objects',
      message: 'this is a string message',
      expectedMessage: {
        title: 'this is a string message'
      }
    },
    {
      name: 'truncates JWT token in exception',
      message: {
        title: 'JWT',
        exception: JSON.stringify({message: '"Authorization":"Bearer eyJ111111.eyJ222222.333333"'})
      },
      expectedMessage: {
        title: 'JWT',
        exception: JSON.stringify({message: '"Authorization":"Bearer eyJ111111.eyJ222222.<sig>"'})
      }
    },
    {
      name: 'truncates JWT token in message when object',
      message: {
        title: 'Request Error',
        exception: {
          config: {
            headers: {
              Authorization: 'Bearer eyJ111111.eyJ222222.333333'
            }
          }
        }
      },
      expectedMessage: {
        title: 'Request Error',
        exception: {
          config: {
            headers: {
              Authorization: 'Bearer eyJ111111.eyJ222222.<sig>'
            }
          }
        }
      }
    },
    {
      name: 'truncates when found token anywhere',
      message: {
        title: 'Token in message',
        jwt: 'This was my token eyJ111111.eyJ222222.333333, simon says'
      },
      expectedMessage: {
        title: 'Token in message',
        jwt: 'This was my token eyJ111111.eyJ222222.<sig>, simon says'
      }
    },
    {
      name: 'truncates any oauth token in message when object',
      message: {
        title: 'Request Error',
        exception: {
          message: '"Authorization":"Bearer eyJ111111.eyJ222222.333333"'
        }
      },
      expectedMessage: {
        title: 'Request Error',
        exception: {
          message: '"Authorization":"Bearer eyJ111111.eyJ222222.<sig>"'
        }
      }
    },
    {
      name: 'truncates too large payloads',
      message: {
        title: 'Request Error',
        exception: {
          message: [...Array(100000)].map(() => 1).join('')
        }
      },
      expectedMessage: {
        title: 'Payload too large',
        fields: ['invocationId', 'message'],
        truncatedPayload: `{\n  "invocationId": "{{invocationId}}",\n  "message": {\n    "title": "Request Error",\n    "exception": {\n      "message": "${[...Array(9849)].map(() => 1).join('')}`
      },
      resetInvocationId: true
    },
    {
      name: 'errors are serialized correctly',
      message: {
        messageType: 'Request Error',
        exception: expectedException
      },
      expectedMessage: {
        messageType: 'Request Error',
        exception: {
          name: "Error",
          message: expectedErrorMessage,
          stack: expectedException.stack
        }
      }
    },
    {
      name: 'allows to specify static data',
      staticData: {
        environment: 'test',
        someValue: 'unit-test'
      },
      message: {
        title: 'some message'
      },
      expectedMessage: {
        environment: 'test',
        someValue: 'unit-test',
        title: 'some message'
      }
    },
    {
      name: 'allows to specify static data, and does not override existing value',
      staticData: {
        environment: 'test',
        someValue: 'static-value'
      },
      message: {
        someValue: 'dynamic-value',
        title: 'some message'
      },
      expectedMessage: {
        environment: 'test',
        someValue: 'dynamic-value',
        title: 'some message'
      }
    }
  ];

  testCases.map(testCase => {
    it(testCase.name, () => {
      const jsonSpace = testCase.jsonSpace ?? 2;

      const logFunc = jest.fn()

      let logger = new Logger({logFunction: msg => logFunc(msg), jsonSpace});
      logger.startInvocation(testCase.staticData);

      let logObj = {invocationId: logger.invocationId, message: testCase.expectedMessage};
      let expectedLogString = JSON.stringify(logObj, null, jsonSpace);
      expectedLogString = expectedLogString.replace(/{{invocationId}}/, logger.invocationId);

      logger.log(testCase.message);

      expect(logFunc).toHaveBeenCalledWith(expectedLogString);
    });
  });
});
