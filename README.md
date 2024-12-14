# 💼 Shopping App Backend

## ✨ Overview
This repository contains the backend code for a Shopping App. The backend is built using **Node.js** with the **Express.js** framework and **MongoDB** for data storage. It supports user authentication, admin functionalities, product management, and cart operations. Encryption and JWT are utilized for secure operations.

---

## 🚀 Features

- 🔐 **User Authentication**: Sign up and log in securely using encrypted data.
- 💡 **Admin Access**: Special routes for admins to manage products and view data.
- 🛒 **Shopping Cart**: Add, update, and purchase items.
- ⏩ **Performance Optimization**: Scalable with Node.js clustering.
- ⚖️ **Data Security**: Data is encrypted using AES-256-CBC.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JSON Web Tokens (JWT)
- **Encryption**: AES-256-CBC with Crypto module
- **Clustering**: Node.js Cluster Module

---

## ✍️ How to Use

### 🔄 Prerequisites

- Node.js installed
- MongoDB server running locally or accessible remotely

### 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/shopping-app-backend.git
   ```
2. Navigate to the project directory:
   ```bash
   cd shopping-app-backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### 🌐 Configuration

- Update MongoDB connection string in the code:
  ```javascript
  mongoose.connect('mongodb://localhost:27017/shoppingAPP')
  ```
- Replace placeholders for `your-secret-key` and `your-fixed-iv` in the encryption logic:
  ```javascript
  const secretKey = 'your-secret-key';
  const iv = 'your-fixed-iv';
  ```

### ▶️ Running the Application

- Start the server:
  ```bash
  node app.js
  ```

The server will run on `http://localhost:8000`.

---

## 🔧 API Endpoints

### 👤 User Routes

#### **Sign Up**
- **POST** `/signup`
- **Body**:
  ```json
  {
    "firstname": "John",
    "lastname": "Doe",
    "email": "johndoe@example.com",
    "password": "password123",
    "admin": "false"
  }
  ```

#### **Log In**
- **POST** `/login`
- **Body**:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "password123"
  }
  ```

---

### 📑 Admin Routes

#### **Add Product**
- **POST** `/admine`
- **Headers**:
  ```
  Authorization: Bearer <JWT Token>
  ```
- **Body**:
  ```json
  {
    "product": "Laptop",
    "quantity": 10,
    "pricePrProduct": 1500
  }
  ```

#### **View Cart Data**
- **GET** `/admine/cardData/`

---

### 🛒 Cart Routes

#### **Add to Cart**
- **POST** `/login/list/cart`
- **Headers**:
  ```
  Authorization: Bearer <JWT Token>
  ```
- **Body**:
  ```json
  [
    {
      "product": "Laptop",
      "quantity": 1
    }
  ]
  ```

#### **Purchase Cart**
- **POST** `/login/list/purchase`

---

## 🔒 Security

- **Encryption**: User data (e.g., passwords) is encrypted before saving to the database.
- **JWT**: Tokens are used for secure and stateless authentication.
- **Validation**: Input validation to prevent unauthorized actions.

---

## ⚙️ Advanced Features

### Clustering
The app uses Node.js clustering to utilize all available CPU cores for improved performance:
```javascript
if (cluster.isPrimary) {
    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }
} else {
    // Worker processes
    const app = express();
}
```

---

## 🌐 License
This project is licensed under the MIT License. Feel free to use, modify, and distribute as needed.

---

## 💜 Contributions
Contributions are always welcome! Please fork the repository, make your changes, and submit a pull request.

---

## 🚀 Future Enhancements
- Implement role-based access control
- Add unit and integration tests
- Dockerize the application
- Expand APIs for advanced reporting

---

## ❓ Questions?
If you have any questions or suggestions, feel free to raise an issue or contact me at **your-email@example.com**. 

😃 Happy Coding!
