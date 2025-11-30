CREATE DATABASE IF NOT EXISTS payment_management_system;
USE payment_management_system;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role ENUM('student', 'admin', 'cashier') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    amount DECIMAL(10,2) NOT NULL,
    payment_type ENUM('tuition', 'miscellaneous', 'lab_fee') NOT NULL,
    payment_method ENUM('credit_card', 'bank_transfer', 'e_wallet', 'cash') NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE fee_structure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fee_type VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    academic_year VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password, email, role, full_name, student_id) VALUES
('admin', 'password', 'admin@adfc.edu', 'admin', 'System Administrator', NULL),
('cashier01', 'password', 'cashier@adfc.edu', 'cashier', 'Juan Dela Cruz', NULL),
('2023-00125', 'password', 'maria@student.adfc.edu', 'student', 'Maria Santos', '2023-00125');

INSERT INTO fee_structure (fee_type, amount, description, academic_year) VALUES
('Tuition Fee', 12500.00, 'Regular tuition fee per semester', '2023-2024'),
('Miscellaneous Fee', 3500.00, 'Various school fees', '2023-2024'),
('Laboratory Fee', 2000.00, 'Science and computer lab fee', '2023-2024');

INSERT INTO payments (student_id, amount, payment_type, payment_method, status, due_date) VALUES
(3, 12500.00, 'tuition', 'credit_card', 'completed', '2023-10-15'),
(3, 3500.00, 'miscellaneous', 'bank_transfer', 'completed', '2023-10-20'),
(3, 2000.00, 'lab_fee', 'e_wallet', 'pending', '2023-11-05');