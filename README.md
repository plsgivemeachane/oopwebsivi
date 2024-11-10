# Sivi

Sivi is a project that mimics an Nginx server, providing functionalities to handle reverse proxying, logging, and DNS resolving.

## Table of Contents

- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## Setup Instructions

### I. Clone the repository:

```bash
git clone https://github.com/plsgivemeachane/oopwebsivi.git
```

### II. Install dependencies:

```bash
npm install
```

## Usage

### Build the project:

```bash
npm install
```

```bash
npm run build
```

### Start the server:

```bash
npm start
```

## API Endpoints

### Port Forwarding

- **URL:** `/api/v1/portforwarding`
- **Method:** `GET` | `POST` | `DELETE`
- **Description:** Get/ Create/ Delete a port forwarding rule.

### Reverse Proxy

- **URL:** `/api/v1/reverseproxy`
- **Method:** `GET` | `POST` | `DELETE`
- **Description:** Get/ Create/ Delete a reverse proxy.

### DNS

- **URL:** `/api/v1/dns`
- **Method:** `POST`
- **Description:** Get/ Create/ Delete DNS Record.

### Logs

- **URL:** `/api/v1/logs`
- **Method:** `GET`
- **Description:** Retrieves real-time logs.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue.
