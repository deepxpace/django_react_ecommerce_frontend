# Django React E-commerce Frontend

Django React E-commerce Backend can be acces at https://github.com/auriorajaa/django_react_ecommerce_backend

This is the frontend repository for Kosimart, a multi-vendor e-commerce platform built with React.js and Vite. This frontend provides the user interface for the e-commerce platform, integrating with the Django Rest Framework backend.

![Cover GitHub](https://github.com/user-attachments/assets/cc1538fb-9610-4826-b034-7ffdc06132aa)

## Prerequisites

- Node.js (version 14 or higher)
- Yarn package manager
- A running instance of the backend server

## Installation

1. Clone the repository
```bash
git clone https://github.com/auriorajaa/django_react_ecommerce_frontend.git
cd django_react_ecommerce_frontend
```

2. Install dependencies
```bash
yarn install
```

3. Create `.env` file
Create a `.env` file in the root directory and add:
```
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

4. Start the development server
```bash
yarn dev
```

The application will start at `http://localhost:5173`

## Building for Production

To create a production build:
```bash
yarn build
```

To preview the production build:
```bash
yarn preview
```

## Features

- Multi-vendor e-commerce platform
- User authentication
- Product browsing and searching
- Shopping cart functionality
- PayPal payment integration
- Responsive design
- And more...

## Development

To run the development server with hot-reload:
```bash
yarn dev
```

To run tests:
```bash
yarn test
```

To lint your code:
```bash
yarn lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
