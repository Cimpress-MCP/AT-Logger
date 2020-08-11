# ATSquad Token Provider

Logger which takes care of truncating Bearer tokens, safe JSON stringification, and converts errors to json objects.

## Using this library

Install the library.

```bash
yarn add @alphatango/logger
```

```typescript
import Logger from '@alphatango/logger';

const defaultConfiguration = { logFunction: console.log, jsonSpace: 2 };

let requestLogger = new RequestLogger(defaultConfiguration);

requestLogger.log({ title: 'Message title', level: 'WARN', error: 'Error'});
```

## Contribution

We value your input as part of direct feedback to us, by filing issues, or preferably by directly contributing improvements:

1. Fork this repository
1. Create a branch
1. Contribute
1. Pull request
