# [1.2.0-beta.17](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.16...v1.2.0-beta.17) (2025-02-12)

### Features

- **cors:** allow cross-origin ([22fae19](https://github.com/tomorrowrich/buddyrental-backend/commit/22fae19cdb9a168d39b449f6b30fdbd40ca9d894))

# [1.2.0-beta.16](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.15...v1.2.0-beta.16) (2025-02-12)

### Bug Fixes

- **auth:** correct response http codes ([a22c448](https://github.com/tomorrowrich/buddyrental-backend/commit/a22c448cde4ec8cad24d4e5392cc0a152b51be6c))

# [1.2.0-beta.15](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.14...v1.2.0-beta.15) (2025-02-12)

### Features

- **auth:** get session ([87b6888](https://github.com/tomorrowrich/buddyrental-backend/commit/87b68884b4263fea4bf49865fd18e97732e2bfff))

# [1.2.0-beta.14](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.13...v1.2.0-beta.14) (2025-02-12)

### Bug Fixes

- **auth:** add swagger bearer token to verify endpoint ([b29c866](https://github.com/tomorrowrich/buddyrental-backend/commit/b29c8667931363d5f0481b40cd7e2317631de6f6))

# [1.2.0-beta.13](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.12...v1.2.0-beta.13) (2025-02-12)

### Features

- **updatePricing:** implement service offered ([#46](https://github.com/tomorrowrich/buddyrental-backend/issues/46)) ([e9ef32e](https://github.com/tomorrowrich/buddyrental-backend/commit/e9ef32eef7f0260806ff883734b595c5c03cf0b4))

# [1.2.0-beta.12](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.11...v1.2.0-beta.12) (2025-02-11)

### Features

- **updatePI:** implement update user PI ([493c021](https://github.com/tomorrowrich/buddyrental-backend/commit/493c0212fe42cb92345c6668a2da06e4a9026335))

# [1.2.0-beta.11](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.10...v1.2.0-beta.11) (2025-02-10)

### Bug Fixes

- **auth:** add `client_key` for security ([35fb404](https://github.com/tomorrowrich/buddyrental-backend/commit/35fb404656cb26c16c1c3b0e6653cf432095d705))
- **auth:** add `client_key` for security ([7508d05](https://github.com/tomorrowrich/buddyrental-backend/commit/7508d05baa7b1ffdeb26de19c594933af3b8d813))
- **auth:** add client key to /login endpoint ([2771822](https://github.com/tomorrowrich/buddyrental-backend/commit/2771822a9feac325eb8367d59536f094147a9881))
- **ci:** change from real env to mock config files ([a54c440](https://github.com/tomorrowrich/buddyrental-backend/commit/a54c44018644a7d40f3314869c72afea479c3c66))

# [1.2.0-beta.10](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.9...v1.2.0-beta.10) (2025-02-10)

### Features

- **auth:** implement verify endpoint ([eab905a](https://github.com/tomorrowrich/buddyrental-backend/commit/eab905a6820303e502770930c4e660a2fc3ff11f))

# [1.2.0-beta.9](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.8...v1.2.0-beta.9) (2025-02-08)

### Bug Fixes

- **auth:** registers jwt module with secret ([885e9f7](https://github.com/tomorrowrich/buddyrental-backend/commit/885e9f7f7fbe4fa1932fc51cb59dbaf1351fc723))

### Features

- **auth:** add module @nestjs/jwt for auth ([019439e](https://github.com/tomorrowrich/buddyrental-backend/commit/019439e4b09bc5ca4bd2fe9ae695bb69e8099d58))
- **auth:** implement login endpoint ([e9ba8c8](https://github.com/tomorrowrich/buddyrental-backend/commit/e9ba8c8ced3373d4e6da463409f5ca2a7ea937bc))

# [1.2.0-beta.8](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.7...v1.2.0-beta.8) (2025-02-07)

### Features

- **proj:** add credential resource ([e128d52](https://github.com/tomorrowrich/buddyrental-backend/commit/e128d523ae63a7b09844034ef66e88d03670a008))

# [1.2.0-beta.7](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.6...v1.2.0-beta.7) (2025-02-07)

### Bug Fixes

- **workflows:** update deployment dependencies and success command logic ([c854b74](https://github.com/tomorrowrich/buddyrental-backend/commit/c854b74a540898769bcd37074fcb17bb39b1c046))

# [1.2.0-beta.6](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.5...v1.2.0-beta.6) (2025-02-06)

### Bug Fixes

- **workflows:** update release.yml to set 'prod' tag for main branch ([44f5dbc](https://github.com/tomorrowrich/buddyrental-backend/commit/44f5dbc39b3078e3366d0634e3e2da3755a3957f))

# [1.2.0-beta.5](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.4...v1.2.0-beta.5) (2025-02-06)

### Bug Fixes

- **docker:** update Dockerfile to copy @prisma/client from node_modules ([cc9237b](https://github.com/tomorrowrich/buddyrental-backend/commit/cc9237b804222b453d2cd5cd6e4c6e43dde16448))

### Features

- **workflows:** add workflow_dispatch trigger to release workflow ([f2a5c9c](https://github.com/tomorrowrich/buddyrental-backend/commit/f2a5c9c35d9608157cb9159c3e2fb4357c1977a2))

# [1.2.0-beta.5](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.4...v1.2.0-beta.5) (2025-02-06)

### Bug Fixes

- **docker:** update Dockerfile to copy @prisma/client from node_modules ([cc9237b](https://github.com/tomorrowrich/buddyrental-backend/commit/cc9237b804222b453d2cd5cd6e4c6e43dde16448))

# [1.2.0-beta.4](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.3...v1.2.0-beta.4) (2025-02-06)

### Bug Fixes

- **docker:** add missing [@prisma](https://github.com/prisma) directory to Dockerfile ([c570e27](https://github.com/tomorrowrich/buddyrental-backend/commit/c570e2722d7e67b062408a2a7c4c74fa408cb3fe))

# [1.2.0-beta.3](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.2...v1.2.0-beta.3) (2025-02-06)

### Bug Fixes

- **healthcheck:** implement healthcheck endpoint in AppController ([64d7fea](https://github.com/tomorrowrich/buddyrental-backend/commit/64d7feaa2e66ad67218e4fe2a7600b3120931c07))

# [1.2.0-beta.2](https://github.com/tomorrowrich/buddyrental-backend/compare/v1.2.0-beta.1...v1.2.0-beta.2) (2025-02-06)

### Features

- **healthz:** add healthcheck endpoint ([088e6db](https://github.com/tomorrowrich/buddyrental-backend/commit/088e6dbba6c508b8ebdfaf82cc2639ad245f0daf))

# [1.2.0-beta.1](https://github.com/tomorrowrich-se2/buddyrental-backend/compare/v1.1.2-beta.1...v1.2.0-beta.1) (2025-02-06)

### Features

- **users:** implement user creation functionality ([0a5a3fb](https://github.com/tomorrowrich-se2/buddyrental-backend/commit/0a5a3fb00783ac530996f7eaa9ccda0afe486795))

## [1.1.2-beta.1](https://github.com/tomorrowrich-se2/buddyrental-backend/compare/v1.1.1...v1.1.2-beta.1) (2025-02-06)

### Bug Fixes

- **users:** implement user removal functionality ([3a160e1](https://github.com/tomorrowrich-se2/buddyrental-backend/commit/3a160e1cd2626af0ca4fd32e3acd5accfa8ea265))

# [1.0.0-beta.5](https://github.com/tomorrowrich-se2/buddyrental-backend/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2025-02-06)

### Bug Fixes

- **users:** implement user removal functionality ([3a160e1](https://github.com/tomorrowrich-se2/buddyrental-backend/commit/3a160e1cd2626af0ca4fd32e3acd5accfa8ea265))

# [1.0.0-beta.4](https://github.com/tomorrowrich-se2/buddyrental-backend/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2025-02-06)

### Bug Fixes

- **users:** add update users ([9d0d4d6](https://github.com/tomorrowrich-se2/buddyrental-backend/commit/9d0d4d60b4587c94bbb6368d3971db665475384d))
